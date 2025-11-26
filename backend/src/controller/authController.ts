import { Router, Request, Response } from "express";
import { registerUser, isUsernameTaken } from "../service/authService";
import { HttpError } from "../errors/HttpError";

const router = Router();

// --- Routes ---


router.get("/check-username", async (req: Request, res: Response) => {
  const username = req.query.username as string;

  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }

  try {
    const taken = await isUsernameTaken(username);
    if (taken) {
      return res.status(409).json({ error: "Username already taken" });
    }
    return res.status(200).json({ message: "Username available" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// Register Firestore User

router.post("/register", async (req: Request, res: Response) => {
  try {
    const RegisterUserRequest = req.body;
    const userDocument = await registerUser(RegisterUserRequest);

    res.status(201).json({ message: "User registered successfully", user: userDocument });
  } catch (error: any) {
    if (error instanceof HttpError) {
      return res.status(error.statusCode).json({ error: error.message })
    }
    res.status(500).json({ error: "Internal Server Error" });
  }
})

export default router