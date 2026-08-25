import type { Request, Response } from "express";
import { respondWithJSON } from "./json.js";
import { BadRequestError, NotFoundError } from "./customErrors.js";
import { createChirp, getChirp, getChirps } from "../db/queries/chirps.js";

export async function handleCreateChirp(req: Request, res: Response) {
    type parameters = {
        body: string;
        userId: string;
    };

    const params: parameters = req.body;

    const maxChirpLength = 140;

    if (params.body.length > maxChirpLength) {
        throw new BadRequestError(
            `Chirp is too long. Max length is ${maxChirpLength}`,
        );
    }

    const chirp = await createChirp({
        body: params.body,
        userId: params.userId,
    });

    const profaneBody = replaceProfaneWords(params.body);

    respondWithJSON(res, 201, {
        id: chirp.id,
        createdAt: chirp.createdAt,
        updatedAt: chirp.updatedAt,
        body: profaneBody,
        userId: chirp.userId,
    });
}

export async function handleGetChirps(req: Request, res: Response) {
    const chirpsList = await getChirps();
    respondWithJSON(res, 200, chirpsList);
}

export async function handleGetChirp(req: Request, res: Response) {
    const { id } = req.params;

    if (typeof id !== "string") {
        throw new BadRequestError("Invalid chirp id");
    }

    const chirp = await getChirp(id);

    if (!chirp) {
        throw new NotFoundError(`Chirp with id ${id} not found`);
    }

    respondWithJSON(res, 200, chirp);
}

function replaceProfaneWords(text: string): string {
    const badWords = ["kerfuffle", "sharbert", "fornax"];
    const result = [];

    const textArray = text.split(" ");
    for (const word of textArray) {
        if (badWords.includes(word.toLowerCase())) {
            result.push("****");
        } else {
            result.push(word);
        }
    }

    return result.join(" ");
}
