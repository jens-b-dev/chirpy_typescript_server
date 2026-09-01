import { db } from "../index.js";
import { chirps, NewChirp } from "../schema.js";
import { asc, eq } from "drizzle-orm";

export async function createChirp(newChirp: NewChirp) {
    console.log("Creating new chirp:", newChirp);
    const [result] = await db
        .insert(chirps)
        .values(newChirp)
        .onConflictDoNothing()
        .returning();

    return result;
}

export async function getChirps() {
    const chirpsList = await db
        .select()
        .from(chirps)
        .orderBy(asc(chirps.createdAt));
    return chirpsList;
}

export async function getChirp(id: string) {
    const result = await db.select().from(chirps).where(eq(chirps.id, id));

    if (result.length === 0) {
        return;
    }

    return result[0];
}

export async function deleteChirp(id: string, userId: string) {
    const result = await db.delete(chirps)
        .where(eq(chirps.id, id) && eq(chirps.userId, userId))
        .returning();

    if (result.length === 0) {
        return;
    }

    return result[0];
}
