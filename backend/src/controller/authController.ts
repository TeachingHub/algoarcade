import { Router, Request, Response } from "express";
import { registerUser, login } from "../service/authService";
import { HttpError } from "../errors/HttpError";

const router = Router();

// --- Routes --- 

// Register 

router.post("/register", async (req: Request, res: Response) => {
    try {
        await registerUser(req.body);
        res.status(201).send({ message: "User registered successfully" });
    } catch (error: any) {
        res.status(400).send({ error: error.message });
    }
})

// Login 

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const data = await login({ email, password });
    res.cookie("authCookie",data.idToken,{secure:true})
    //console.log(data)
    return res.status(200).json({ message: "User logged in successfully" });
  } catch (err: any) {
    if (err instanceof HttpError) {
      return res.status(err.statusCode).json({error : err.message})
    }
    
    return res.status(500).json({ error: "Internal Server Error" });
  }
});



export default router