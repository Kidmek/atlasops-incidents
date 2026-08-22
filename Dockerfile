# syntax=docker/dockerfile:1

# ---------- build stage ----------
FROM node:22-alpine AS build
WORKDIR /app

COPY client/package.json client/package-lock.json ./client/
COPY server/package.json server/package-lock.json ./server/
RUN npm --prefix client ci && npm --prefix server ci

COPY client ./client
COPY server ./server
RUN npm --prefix client run build && npm --prefix server run build

# ---------- runtime stage ----------
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/server/package.json /app/server/package-lock.json ./server/
RUN npm --prefix server ci --omit=dev

COPY --from=build /app/client/dist ./client/dist
COPY --from=build /app/server/dist ./server/dist

USER node
EXPOSE 3001
CMD ["node", "server/dist/index.js"]