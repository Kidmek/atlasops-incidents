import { app } from "./app.js";

const port = Number.parseInt(process.env.PORT ?? "3001", 10);

if (Number.isNaN(port)) {
  throw new Error("PORT must be a valid number");
}

const server = app.listen(port, () => {
  console.log(`Mock API listening on http://localhost:${port}`);
});

function shutdown(signal: string) {
  console.log(`${signal} received. Closing the mock API.`);
  server.close((error) => {
    if (error !== undefined) {
      console.error("The mock API could not close cleanly.");
      process.exitCode = 1;
    }
  });
}

process.once("SIGINT", () => shutdown("SIGINT"));
process.once("SIGTERM", () => shutdown("SIGTERM"));
