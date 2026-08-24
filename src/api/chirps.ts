import type { Request, Response } from "express";
import { respondWithError, respondWithJSON } from "./json.js";
import { BadRequestError } from "./customErrors.js";

export async function handleValidateChirp(req: Request, res: Response) {
    type parameters = {
        body: string;
    }

    const params: parameters = req.body;

    const maxChirpLength = 140;

    if (params.body.length > maxChirpLength) {
        throw new BadRequestError(`Chirp is too long. Max length is ${maxChirpLength}`);
    }

    const result = replaceProfaneWords(params.body);

    respondWithJSON(res, 200, {
        cleanedBody: result,
    });
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
