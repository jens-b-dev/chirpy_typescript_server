import express from "express";
import { handlerReadiness } from "./api/readiness.js";
import { middlewareLogResponses, middlewareMetricsInc } from "./api/middleware.js";
import { handleMetrics } from "./api/metrics.js";
import { handleMetricsReset } from "./api/reset.js";
import { handleValidateChirp } from "./api/chirps.js";

const app = express();
const PORT = 8080;

app.use(middlewareLogResponses)
app.use(express.json());

app.use("/app", middlewareMetricsInc, express.static("./src/app"));

app.get("/api/healthz", handlerReadiness);
app.post("/api/validate_chirp", handleValidateChirp);

app.get("/admin/metrics", handleMetrics);
app.post("/admin/reset", handleMetricsReset);

app.listen(PORT, () => {
    console.log("Server is running on port 8080");
});
