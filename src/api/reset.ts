import { Request, Response } from "express";
import { config } from "../config.js";
import { deleteAllUsers } from "../db/queries/users.js";
import { ForbiddenError } from "./customErrors.js";

export async function reset(_: Request, res: Response) {
    if (config.api.platform !== "dev") {
        throw new ForbiddenError("Reset is only allowed in the dev environment.");
    }

    await deleteAllUsers();
    config.api.fileserverHits = 0;
    res.write(`Hits reset to: ${config.api.fileserverHits}`);
    res.end();
}
