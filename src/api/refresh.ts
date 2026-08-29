import type { Request, Response } from "express";
import { respondWithJSON } from "./json.js";
import { UnauthorizedError } from "./customErrors.js";
import { getBearerToken, makeJWT } from "../auth.js";
import {
    getUserFromRefreshToken,
    revokeRefreshToken,
} from "../db/queries/refresh.js";
import { config } from "../config.js";

export async function handleRefresh(req: Request, res: Response) {
    const refreshToken = getBearerToken(req);

    const result = await getUserFromRefreshToken(refreshToken);

    if (
        !result ||
        result.refreshToken.revokedAt !== null ||
        result.refreshToken.expiresAt < new Date()
    ) {
        throw new UnauthorizedError("Invalid refresh token");
    }

    const token = makeJWT(
        result.user.id,
        config.jwt.defaultDuration,
        config.jwt.secret,
    );

    respondWithJSON(res, 200, { token });
}

export async function handleRevoke(req: Request, res: Response) {
    const refreshToken = getBearerToken(req);

    await revokeRefreshToken(refreshToken);

    res.status(204).send();
}
