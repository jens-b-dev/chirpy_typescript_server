import { db } from "../index.js";
import { refreshTokens, users } from "../schema.js";
import { eq } from "drizzle-orm";

export async function addRefreshToken(userId: string, refreshToken: string) {
    await db.insert(refreshTokens).values({
        token: refreshToken,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId,
        expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
    });
}

export async function getUserFromRefreshToken(token: string) {
    const [result] = await db
        .select({ user: users, refreshToken: refreshTokens })
        .from(refreshTokens)
        .innerJoin(users, eq(refreshTokens.userId, users.id))
        .where(eq(refreshTokens.token, token));

    return result;
}

export async function revokeRefreshToken(token: string) {
    await db
        .update(refreshTokens)
        .set({ revokedAt: new Date(), updatedAt: new Date() })
        .where(eq(refreshTokens.token, token));
}
