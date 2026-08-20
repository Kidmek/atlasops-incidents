import { app } from "./app.js";

const port = Number.parseInt(process.env.PORT ?? "3001", 10);

if (Number.isNaN(port)) {
  throw new Error("PORT must be a valid number");
}

app.listen(port, () => {
  console.log(`Mock API listening on http://localhost:${port}`);
});
