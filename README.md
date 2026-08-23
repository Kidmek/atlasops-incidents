# AtlasOps Incident Management Console

An incident management console for operations engineers: review, filter, and sort a
large incident list, open an incident, change its status, reassign it, and record
investigation notes.

**Live:** https://atlasops.vwx1mevtd9ax2.eu-west-3.cs.amazonlightsail.com
**API docs:** https://atlasops.vwx1mevtd9ax2.eu-west-3.cs.amazonlightsail.com/api/docs

---

## 1. Overview

### Main workflows

- **Incident list** — search by ID, title, service, or assignee; filter by status,
  severity, and service; sort by severity, created, or updated; paginate. All of it
  lives in the URL, so any view is shareable and survives a reload.
- **Incident detail** — full record with a notes timeline. Change status through the
  server's transition rules, assign/reassign/unassign, and add notes. Returning to the
  list restores the exact filters, sort, and page you left.
- **Create incident** — validated form with per-field errors, focus moved to the first
  invalid field, duplicate-submit protection, and server field errors mapped back onto
  the right inputs.

### Stack

|                                |                     | Why                                                                                                         |
| ------------------------------ | ------------------- | ----------------------------------------------------------------------------------------------------------- |
| React 19 + TypeScript + Vite   | UI                  | Required; Vite for fast builds and one config shared with the test runner                                   |
| TanStack Query                 | server state        | Caching, cancellation, optimistic updates, and reconciliation — the four things this brief asks for by name |
| React Router                   | routing + URL state | `useSearchParams` makes the URL the single source of truth for list state                                   |
| React Hook Form + Zod          | forms               | Uncontrolled inputs avoid a re-render per keystroke; the Zod schema mirrors the server's rules              |
| Zod                            | runtime validation  | Applied at every untrusted boundary: API responses, form input, URL parameters                              |
| Tailwind CSS 4                 | styling             | Semantic tokens in `@theme`; components never reference raw colour values                                   |
| Vitest + Testing Library + MSW | tests               | Vitest reuses `vite.config.ts`; MSW intercepts at the network layer so tests exercise the real fetch path   |
| Express 5 + Zod                | mock API            | 1,043 deterministic incidents, simulated latency, failure controls, Swagger                                 |

---

## 2. Setup

Requires **Node 22+**. From a clean checkout:

```bash
# install
npm --prefix client ci && npm --prefix server ci

# run development (two processes)
npm --prefix server run dev     # API on :3001
npm --prefix client run dev     # UI on :5173, proxies /api to :3001

# run tests
npm --prefix client test        # 12 component tests
npm --prefix server test        # 16 API tests

# production build
npm run build                   # builds client and server

# start production build
npm start                       # serves UI + API on :3001
```

`npm start` serves the built SPA and the API from a **single origin**, which is how the
deployment runs.

### Docker

```bash
npm run docker:build && npm run docker:run
```

### Environment variables

All server-side; the client reads none.

| Variable               | Default           | Purpose                                                                        |
| ---------------------- | ----------------- | ------------------------------------------------------------------------------ |
| `PORT`                 | `3001`            | Listen port                                                                    |
| `NODE_ENV`             | —                 | `production` disables mock failure controls; `test` disables simulated latency |
| `ENABLE_MOCK_CONTROLS` | off in production | Enables the `X-Mock-*` development headers                                     |
| `MOCK_RANDOM_FAILURES` | `false`           | 3% random 500s when `true`                                                     |

`server/.env.example` documents these. The client needs no configuration because it is
served same-origin with the API.

---

## 3. Architecture

### Project structure

```
client/src/
  app/          providers, layout, routes, global styles
  features/
    incidents/  api, hooks, schemas, types, components, pages
  shared/
    api/        ApiError and response parsing
    hooks/      domain-independent hooks
    lib/        cn, date formatting
    ui/         atoms, molecules
  test/         setup, MSW server, fixtures, render helper
server/src/     routes, services, validation, data, middleware
```

Dependencies flow one way: **`app → features → shared`**. A feature owns everything about
itself. `shared/` holds only genuinely domain-independent code — `Badge` knows about
tones, not about incident severity.

### Component boundaries

Atomic Design applies to `shared/ui` only. Atoms (`Button`, `Input`, `Select`, `Badge`,
`Checkbox`, `Skeleton`, `Label`, `FieldError`, `Textarea`) are domain-free primitives;
molecules (`FormField`, `Pagination`, `OfflineBanner`, `ThemeToggle`) compose them.
Route layouts act as templates but stay app-owned.

Domain-aware components — `IncidentTable`, `IncidentFilters`, `IncidentStatusControl` —
live in `features/incidents/components` and are never promoted to `shared` just to satisfy
a naming scheme. Nothing was extracted without a second consumer that already existed.

### Data fetching

TanStack Query, with the request layer in `features/incidents/api`.

- **No duplicate requests** — every query key includes the normalised list parameters, so
  identical views share a cache entry.
- **Cancellation** — `getIncidents` consumes the `AbortSignal` TanStack provides, so a
  superseded search is actually aborted rather than left to land and be ignored.
- **No stale overwrites** — each parameter set is its own cache entry, so a late response
  writes to its own key and can never clobber a newer one.
- **Slow responses** — `placeholderData: keepPreviousData` keeps the previous page visible
  while the next loads, with a background-refresh indicator instead of a skeleton flash.
- **Reconciliation** — every mutation invalidates on `onSettled`, so the cache converges on
  server state whether the request succeeded or failed.
- **Freshness** — 30s `refetchInterval` plus refetch-on-focus. Background tabs don't poll.

### State ownership

Five kinds of state, deliberately separated:

| Kind                | Where                                         | Example                     |
| ------------------- | --------------------------------------------- | --------------------------- |
| Server state        | TanStack Query                                | incidents, users, services  |
| URL state           | `useSearchParams` via `useIncidentListParams` | search, filters, sort, page |
| Form state          | React Hook Form                               | the create form             |
| Local state         | `useState`                                    | note draft, theme           |
| Shared client state | **none**                                      | —                           |

There is no global state library, because nothing needed one. Server state is cached by
Query, view state is in the URL, and the only cross-cutting concern — the theme — lives in
a DOM attribute plus `localStorage`.

### URL state

`useIncidentListParams` parses `URLSearchParams` through a Zod schema whose fields all use
`.catch()`, so `?page=banana&severity=urgent` degrades to defaults rather than crashing.
Serialising back **omits defaults**, so a clean list stays at `/incidents` instead of a wall
of query string. Any change other than paging resets to page 1, so narrowing the results
can't strand you on a page that no longer exists.

### Forms

React Hook Form with the Zod resolver. The schema mirrors the server's bounds exactly
(title 5–120, description 20–2,000), so the client and server agree. `FormField` owns the
`useId` wiring for `htmlFor`/`aria-describedby` and takes a single `required` prop that
produces both the visual asterisk and the control's `required` attribute — the two cannot
drift apart.

Server field errors are mapped back onto inputs via `setError`, because the API's
`fieldErrors` keys match the form's field names.

### Error handling

One small `ApiError` carries `status`, `code`, `message`, and `fieldErrors`, built by
parsing the error body with Zod. An unreadable or unexpected body falls back to a generic
message, so nothing internal reaches the user.

Three consumers justify it: `404` gets its own state on the detail page with no retry
button, `409` conflicts surface the server's message after rolling back, and `400`
`fieldErrors` land on the right form inputs.

### Styling

22 semantic tokens in `globals.css`. Components never reference raw palette values —
there is no `slate-600` or hex anywhere in `client/src`. Dark mode is 19 token overrides
under `[data-theme="dark"]` and **zero component changes**.

---

## 4. Important Decisions

### Single-service deployment, and what I'd do with a real backend

The mock API stores incidents in an in-memory `Map`. That rules out a serverless split:
Lambda instances are ephemeral and concurrent, so a reviewer's status change would land in
one instance's memory and vanish on the next request. The store needs a long-lived process.

So Express serves both `/api` and the built SPA from one origin, deployed as a single
container on Lightsail. The upside is real: the client needs no `VITE_API_BASE_URL`, there
is no CORS configuration, and relative `/api` paths are _correct_ rather than a dev-time
convenience.

**With an actual backend I would not deploy it this way.** The frontend would go to
**AWS Amplify** — CDN distribution, atomic deploys, preview environments per branch — and
the API to **EC2** (or ECS behind an ALB) as an independently scaled and released service.
Co-hosting them here is a deliberate trade for a demo artifact, not an architecture I'd
recommend for production.

### TanStack Query over a hand-rolled cache

The brief asks for deduplication, cancellation, stale-response protection, optimistic
updates, and post-mutation reconciliation. That is a cache library. Writing one would have
been the bulk of the project and worse than the one that exists.

### `Intl.RelativeTimeFormat` over date-fns

The app only _displays_ dates — no parsing, arithmetic, or ranges. The platform API is
localized by default, where date-fns would need a locale import. §10 asks specifically to
avoid large dependencies for trivial functionality, and two format calls didn't justify one.

### Native `<select>` over a custom listbox

Keyboard behaviour, typeahead, and the mobile picker come free and correct. A custom
listbox is a lot of ARIA to get wrong for no gain on a ten-option filter. Only the caret is
replaced, via `appearance-none` and an inline SVG that follows a token so it inverts in dark
mode.

### Pagination over virtualization

25 rows per page means the DOM never grows, so virtualization would add a dependency and
scroll-restoration complexity to solve a problem that doesn't exist. Page numbers are also
URL-shareable in a way that "scrolled through seven accumulated pages" is not.

### `tailwind-merge` in `cn`

Added after a real conflict, not preemptively. Class order in a `class` attribute is
meaningless — the cascade decides — so a caller's `px-0` lost to a component's `px-2.5`
and silently squashed an icon. `twMerge` makes `className` reliably override component
defaults.

### Optimistic status updates keyed on `version`

The status mutation sends the incident's `version`, so a concurrent edit produces a real
`409` instead of a silent overwrite. `onMutate` cancels in-flight refetches, snapshots, and
patches; `onError` restores the snapshot; `onSettled` invalidates. Cancelling first is the
step that's easy to skip and the one that breaks it — without it a refetch already in
flight resolves _after_ the optimistic write and reverts it.

---

## 5. Performance

**Dataset:** 1,043 incidents, the full set the mock API generates.

### Measured on the deployed build

|                              | Before      | After                         |
| ---------------------------- | ----------- | ----------------------------- |
| `index-*.js` over the wire   | 384,490 B   | 114,333 B (**−70%**)          |
| `/api/incidents?pageSize=25` | 10,560 B    | 1,762 B (**−83%**)            |
| Asset `Cache-Control`        | `max-age=0` | `max-age=31536000, immutable` |

Express's `static` doesn't compress, so every visitor was downloading 384 KB of JavaScript
that should have been 114 KB. Added `compression` and a one-year immutable cache on Vite's
content-hashed assets — safe because a change produces a new filename.

### Latency middleware scoping

The mock API simulates 200–1,200 ms per request. It was mounted globally, which meant that
once Express also served the SPA, **every JS and CSS file** would have been delayed by up to
1.2 s. Scoping it to `/api` fixed it — verified on the deployed URL: the API call takes
596 ms while the JS bundle takes 2.4 ms.

### Avoided on purpose

- **Virtualization** — 25 rows per page.
- **Memoization by default** — `useMemo` is used where identity is consumed (the parsed URL
  params, which must change identity exactly when the view changes), not sprinkled.
- **Debounce placement** — search writes to the URL on every keystroke so the input stays a
  controlled reflection of it, but the _query_ uses a debounced copy. One request per pause,
  not per keystroke.

---

## 6. Accessibility

### Keyboard

Every control is reachable and operable by keyboard, with **no `onKeyDown` handlers
anywhere** — sort headers are real `<button>`s, navigation is real `<a>`s. One test drives
sorting entirely by `Tab` and `Enter` to lock that in.

### Focus

- Focus is visible globally via one `:focus-visible` rule on a token.
- A rejected form submit moves focus to the first invalid field (asserted in tests).
- Incident cards use a stretched link, so the **whole card** shows the focus ring rather
  than just the title.

### Semantics over ARIA

- Real `<table>` with `<caption>`, `scope="col"`, and `<tr>` structure.
- `aria-sort` carries three distinct states: absent (not sortable), `none` (sortable,
  inactive), `ascending`/`descending` (active). Arrow glyphs are `aria-hidden` so nothing
  reads "descending, black down-pointing triangle".
- Filter checkboxes are wrapped in their `<label>` — no `id`/`htmlFor` pair to typo or
  collide, and the whole label is a target.
- `<fieldset>`/`<legend>` name each filter group.
- Icon-only buttons carry an `aria-label` describing the _action_.

### Announcements

Mutation results sit in an `aria-live="polite"` region with reserved height, so the layout
doesn't shift and a late-appearing region is still announced. The offline banner uses
`role="status"`, not `alert` — losing connection is a state change, not an interruption.

### Colour

Status is never conveyed by colour alone; every badge carries text. Contrast was measured
on the live DOM in dark mode:

|                         | Ratio | AA (4.5:1) |
| ----------------------- | ----- | ---------- |
| White on primary button | 5.17  | ✅         |
| Heading on background   | 16.30 | ✅         |
| Smallest label text     | 5.71  | ✅         |

Dark-mode primary was deliberately kept at `#2563eb` rather than lightened — `#3b82f6`
would have dropped the button label to ~3.7:1 and failed.

### Known limitations

- No `role="grid"` arrow-key navigation between rows. The ARIA Authoring Practices reserve
  grids for widgets needing intra-widget navigation; adopting it would degrade normal table
  reading for screen-reader users to add arrow keys nothing here requires.
- Not tested with a real screen reader — semantics were verified through role-based queries
  and computed accessible names.

---

## 7. Testing

**12 component tests** (client) and **16 API tests** (server).

### Covered

| Required case                       | Where                                               |
| ----------------------------------- | --------------------------------------------------- |
| List rendering                      | `IncidentTable.test.tsx`                            |
| Search / filtering                  | `IncidentFilters.test.tsx`                          |
| Successful mutation                 | `IncidentDetailPage.test.tsx`                       |
| Failed mutation + error state       | `IncidentDetailPage.test.tsx`                       |
| Form validation                     | `IncidentCreatePage.test.tsx`                       |
| Accessibility-sensitive interaction | focus-to-first-invalid-field, plus keyboard sorting |

Tests are co-located with what they test; `src/test/` holds only shared infrastructure.
MSW intercepts at the network layer, so tests exercise the real `fetch` → `toApiError` →
Zod parse path rather than a stubbed client.

Queries are role- and label-based throughout, which means a test fails if the accessible
wiring breaks — the a11y requirements are enforced by the suite rather than merely
coexisting with it.

### Not covered, and why

- **Rollback isolated from refetch.** After a 409, `onError` restores the snapshot and
  `onSettled` refetches — both produce the same visible result, so the test can't
  distinguish them. Separating them would mean either a timing race or asserting on cache
  internals; both are worse than the gap.
- **Native `<select>` keyboard interaction.** jsdom doesn't implement the dropdown widget,
  so arrow keys can't be simulated. That behaviour belongs to the browser, not to this code.
- **End-to-end.** Deep links, hard refresh on a client route, and theme persistence across
  reload are all production-only paths that jsdom can't reach.

---

## 8. Incomplete Work

- **Real-time updates.** `MOCK_API.md` §9 specifies an SSE endpoint; the server doesn't
  implement it. 30-second polling plus refetch-on-focus stands in. SSE — not WebSocket, since
  the data flows one way and `EventSource` reconnects natively — would be the next step.
- **End-to-end tests.** Scoped with Playwright and set aside. The 12 component tests cover
  behaviour; I'd add E2E for the deep-link, hard-refresh, and theme-persistence paths.
- **Data resets on redeploy.** The in-memory store means an incident a reviewer creates
  won't survive a restart. Correct for a mock; worth knowing before you look for it.
- **Deployment is manual.** `npm run deploy:push` then a version bump in
  `lightsail-deployment.json`. CI runs on every push; CD was left out because two remaining
  deploys don't justify the OIDC setup.
- **Authentication and role-based access.** Out of scope per §11, so the current user is
  simulated. With auth in place the natural next step is authorisation: an admin who can
  assign and reassign any incident, and support or engineering roles scoped to the incidents
  they own. That would be enforced server-side — the client would hide actions a role can't
  perform, but hiding a button is presentation, not a permission check.
- **Bulk actions, saved views, command palette, i18n, Storybook, error monitoring** — all
  deliberately out of scope.
