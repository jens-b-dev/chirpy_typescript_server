import { hashPassword } from "../../auth.js";
import { db } from "../index.js";
import { NewUser, users } from "../schema.js";
import { eq } from "drizzle-orm";

export async function createUser(user: NewUser) {
    console.log("Creating user:", user.email);
    const [result] = await db
        .insert(users)
        .values(user)
        .onConflictDoNothing()
        .returning();

    return result;
}

export async function deleteAllUsers() {
    await db.delete(users);
}

export async function getUserByEmail(email: string) {
    const [user] = await db.select().from(users).where(eq(users.email, email));

    return user;
}

export async function updateUser(user: NewUser, userId: string) {
    const [result] = await db
        .update(users)
        .set({
            email: user.email,
            hashedPassword: user.hashedPassword,
        })
        .where(eq(users.id, userId))
        .returning();

    return result;
}
