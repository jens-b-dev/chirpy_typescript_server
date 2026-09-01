import express from "express";
import { handlerReadiness } from "./api/readiness.js";
import {
    middlewareErrorHandler,
    middlewareLogResponses,
    middlewareMetricsInc,
} from "./api/middleware.js";
import { handleMetrics } from "./api/metrics.js";
import { reset } from "./api/reset.js";
import {
    handleCreateChirp,
    handleDeleteCrhip,
    handleGetChirp,
    handleGetChirps,
} from "./api/chirps.js";
import postgres from "postgres";
import { config } from "./config.js";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { handleCreateUser, handleUpdateUser } from "./api/users.js";
import { handleLogin } from "./api/auth.js";
import { handleRefresh, handleRevoke } from "./api/refresh.js";
import { handleWebhook } from "./api/webhooks.js";

export const app = express();
const PORT = 8080;

const migrationClient = postgres(config.db.url, { max: 1 });

await migrate(drizzle(migrationClient), config.db.migrationConfig);

app.use(middlewareLogResponses);
app.use(express.json());

app.use("/app", middlewareMetricsInc, express.static("./src/app"));

app.get("/api/healthz", (req, res, next) => {
    Promise.resolve(handlerReadiness(req, res)).catch(next);
});
app.post("/api/users", (req, res, next) => {
    Promise.resolve(handleCreateUser(req, res)).catch(next);
});
app.put("/api/users", (req, res, next) => {
    Promise.resolve(handleUpdateUser(req, res)).catch(next);
});
app.post("/api/login", (req, res, next) => {
    Promise.resolve(handleLogin(req, res)).catch(next);
});
app.post("/api/refresh", (req, res, next) => {
    Promise.resolve(handleRefresh(req, res)).catch(next);
});
app.post("/api/revoke", (req, res, next) => {
    Promise.resolve(handleRevoke(req, res)).catch(next);
});
app.post("/api/chirps", (req, res, next) => {
    Promise.resolve(handleCreateChirp(req, res)).catch(next);
});
app.get("/api/chirps", (req, res, next) => {
    Promise.resolve(handleGetChirps(req, res)).catch(next);
});
app.get("/api/chirps/:id", (req, res, next) => {
    Promise.resolve(handleGetChirp(req, res)).catch(next);
});
app.delete("/api/chirps/:id", (req, res, next) => {
    Promise.resolve(handleDeleteCrhip(req, res)).catch(next);
});
app.post("/api/polka/webhooks", (req, res, next) => {
    Promise.resolve(handleWebhook(req, res)).catch(next);
});


app.get("/admin/metrics", (req, res, next) => {
    Promise.resolve(handleMetrics(req, res)).catch(next);
});
app.post("/admin/reset", (req, res, next) => {
    Promise.resolve(reset(req, res)).catch(next);
});


app.use(middlewareErrorHandler);

app.listen(PORT, () => {
    console.log("Server is running on port 8080");
});
