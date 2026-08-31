import { Request, Response } from "express";
import { createUser, updateUser } from "../db/queries/users.js";
import { BadRequestError } from "./customErrors.js";
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
    } satisfies UserResponse);
}

export async function handleUpdateUser(req: Request, res: Response) {
    type parameters = {
        email: string;
        password: string;
    };

    const params: parameters = req.body;

    if (!params.email && !params.password) {
        throw new BadRequestError("Missing required fields");
    }


    let userId: string = "";
    try {
        const token = getBearerToken(req);
        userId = validateJWT(token, config.jwt.secret);
    } catch (error) {
        respondWithError(res, 401, "Unauthorized");
    }

    if (!userId) {
        respondWithError(res, 401, "Unauthorized");
    }

    const hashedPassword = await hashPassword(params.password);
    const updatedUser = {
        email: params.email,
        hashedPassword,
    }

    const user = await updateUser(updatedUser, userId);

    respondWithJSON(res, 200, {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    } satisfies UserResponse);
}
