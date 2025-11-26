import { Router, Request, Response } from "express";
import { registerUser } from "../service/authService";
import { HttpError } from "../errors/HttpError";

const router = Router();

// --- Routes --- 

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