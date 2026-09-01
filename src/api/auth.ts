import { Response, Request } from "express";
import { checkPasswordHash, makeJWT, makeRefreshToken } from "../auth.js";
import { getUserByEmail } from "../db/queries/users.js";
import { respondWithJSON } from "./json.js";
import { UserResponse } from "./users.js";
import { config } from "../config.js";
import { addRefreshToken } from "../db/queries/refresh.js";

export type LoginResponse = UserResponse & {
    token: string;
    refreshToken?: string;
};

export async function handleLogin(req: Request, res: Response) {
    type parameters = {
        email: string;
        password: string;
    };

    const params: parameters = req.body;

    const user = await getUserByEmail(params.email);

    const validPassword = await checkPasswordHash(params.password, user.hashedPassword);

    if (!validPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    let duration = config.jwt.defaultDuration;

    const token = await makeJWT(user.id, duration, config.jwt.secret);
    const refreshToken = makeRefreshToken();

    await addRefreshToken(user.id, refreshToken);

    respondWithJSON(res, 200, {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        isChirpyRed: user.isChirpyRed,
        token,
        refreshToken,
    } satisfies LoginResponse);
}
