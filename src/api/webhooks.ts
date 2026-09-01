import type { Request, Response } from "express";
import { updateUserToRed } from "../db/queries/users.js";

export async function handleWebhook(req: Request, res: Response) {
    type parameters = {
        event: string;
        data: {
            userId: string;
        };
    };

    const params: parameters = req.body;

    if (!params.event || params.event !== "user.upgraded") {
        res.status(204).send();
        return;
    }

    const upgradedUser = await updateUserToRed(params.data.userId);
    if (!upgradedUser) {
        res.status(404).send();
        return;
    }

    res.status(204).send();
}
