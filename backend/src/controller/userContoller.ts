import { Router, Request, Response } from "express";
import { updateUser, deleteUser } from "../service/userService";
import { HttpError } from "../errors/HttpError";

const router = Router();


router.put("/:uid", async (req: Request, res: Response) => {
    try {
        const { uid } = req.params;
        const { username } = req.body;

        const result = await updateUser(uid, username);
        res.status(200).json(result);
    } catch (error: any) {
        if (error instanceof HttpError) {
            return res.status(error.statusCode).json({ error: error.message });
        }
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.delete("/:uid", async (req: Request, res: Response) => {
    try {
        const { uid } = req.params;

        const result = await deleteUser(uid);
        res.status(200).json(result);
    } catch (error: any) {
        if (error instanceof HttpError) {
            return res.status(error.statusCode).json({ error: error.message });
        }
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

export default router;
