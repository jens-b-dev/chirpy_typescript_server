import { hash, verify } from "argon2";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import { BadRequestError, UnauthorizedError, UserNotAuthenticatedError } from "./api/customErrors.js";
import { Request } from "express";
import crypto from "crypto";

type payload = Pick<JwtPayload, "iss" | "sub" | "iat" | "exp">;

const TOKEN_ISSUER = "chirpy";

export async function hashPassword(password: string) {
    return hash(password);
}

export async function checkPasswordHash(password: string, hash: string) {
    if (!password) {
        return false;
    }
    try {
        return await verify(hash, password);
    } catch (err) {
        return false;
    }
}

export function makeJWT(userID: string, expiresIn: number, secret: string) {
    const issuedAt = Math.floor(Date.now() / 1000);
    const expiresAt = issuedAt + expiresIn;

    return jwt.sign(
        {
            iss: TOKEN_ISSUER,
            sub: userID,
            iat: issuedAt,
            exp: expiresAt,
        } satisfies payload,
        secret,
        {
            algorithm: "HS256",
        },
    );
}

export function validateJWT(tokenString: string, secret: string) {
    let decoded: payload;
    try {
        decoded = jwt.verify(tokenString, secret) as JwtPayload;
    } catch (e) {
        throw new UserNotAuthenticatedError("Invalid token");
    }

    if (decoded.iss !== TOKEN_ISSUER) {
        throw new UserNotAuthenticatedError("Invalid issuer");
    }

    if (!decoded.sub) {
        throw new UserNotAuthenticatedError("No user ID in token");
    }

    return decoded.sub;
}

export function getBearerToken(req: Request) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        throw new UnauthorizedError("No authorization header");
    }

    return extractBearerToken(authHeader);
}

export function extractBearerToken(header: string) {
    const splitAuth = header.split(" ");
      if (splitAuth.length < 2 || splitAuth[0] !== "Bearer") {
        throw new BadRequestError("Malformed authorization header");
      }
      return splitAuth[1];
}

export function makeRefreshToken() {
    return crypto.randomBytes(32).toString("hex");
}
