import { Request, Response } from "express";
import { createUser } from "../db/queries/users.js";
import { BadRequestError } from "./customErrors.js";
import { NewUser } from "../db/schema.js";
import { respondWithJSON } from "./json.js";
import { hashPassword } from "../auth.js";

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
