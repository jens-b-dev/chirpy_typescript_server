import { Response, Request } from "express";
import { checkPasswordHash, makeJWT } from "../auth.js";
import { getUserByEmail } from "../db/queries/users.js";
import { respondWithJSON } from "./json.js";
import { UserResponse } from "./users.js";
import { config } from "../config.js";

export type LoginResponse = UserResponse & {
    token: string;
};

export async function handleLogin(req: Request, res: Response) {
    type parameters = {
        email: string;
        password: string;
        expiresInSeconds?: number;
    };

    const params: parameters = req.body;

    const user = await getUserByEmail(params.email);

    const validPassword = await checkPasswordHash(params.password, user.hashedPassword);

    if (!validPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    let duration = config.jwt.defaultDuration;
    if (params.expiresInSeconds && !(params.expiresInSeconds > config.jwt.defaultDuration)) {
        duration = params.expiresInSeconds;
    }

    const token = await makeJWT(user.id, duration, config.jwt.secret)

    respondWithJSON(res, 200, {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        token
    } satisfies LoginResponse);
}
