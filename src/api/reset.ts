import { Request, Response } from "express";
import { config } from "../config.js";

export async function handleMetricsReset(_: Request, res: Response) {
    config.api.fileserverHits = 0;
    res.write(`Hits reset to: ${config.api.fileserverHits}`);
    res.end();
}
