import { Request, Response } from "express";
import { createUser, updateUser, updateUserToRed } from "../db/queries/users.js";
import { BadRequestError, NotFoundError } from "./customErrors.js";
import { NewUser } from "../db/schema.js";
import { respondWithError, respondWithJSON } from "./json.js";
import { getBearerToken, hashPassword, validateJWT } from "../auth.js";
import { config } from "../config.js";

export type UserResponse = Omit<NewUser, "hashedPassword">

export async function handleCreateUser(req: Request, res: Response) {
    type parameters = {
        email: string;
        password: string;
    };

    const params: parameters = req.body;

    if (!params.email || !params.password) {
        throw new BadRequestError("Missing required fields");
    }

    const hashedPassword = await hashPassword(params.password);

    const user = await createUser({
        email: params.email,
        hashedPassword,
    });

    if (!user) {
        throw new Error("User creation failed");
    }

    respondWithJSON(res, 201, {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        isChirpyRed: user.isChirpyRed,
    } satisfies UserResponse);
}

export async function handleUpdateUser(req: Request, res: Response) {
    type parameters = {
        email: string;
        password: string;
    };

    const token = getBearerToken(req);
    const userID = validateJWT(token, config.jwt.secret);

    const params: parameters = req.body;

    if (!params.email && !params.password) {
        throw new BadRequestError("Missing required fields");
    }

    const hashedPassword = await hashPassword(params.password);

    const user = await updateUser(userID, params.email, hashedPassword);

    respondWithJSON(res, 200, {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        isChirpyRed: user.isChirpyRed,
    } satisfies UserResponse);
}
