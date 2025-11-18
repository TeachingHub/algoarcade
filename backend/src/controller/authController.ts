import { Router, Request, Response } from "express";
import { registerUser, login, logout, refreshAuthToken, getPublicUser } from "../service/authService";
import { HttpError } from "../errors/HttpError";
import { COOKIES } from "../config/constants";
import { PublicUser } from "../types/user";

const router = Router();

// --- Routes --- 

// Register 

router.post("/register", async (req: Request, res: Response) => {
  try {
    const createdUser = await registerUser(req.body);
    const PublicUser: PublicUser = {
      username: createdUser.username,
      role: createdUser.role,
      createdAt: createdUser.createdAt,
    }

    res.status(201).json({ message: "User registered successfully", user: PublicUser });
  } catch (error: any) {
    if (error instanceof HttpError) {
      return res.status(error.statusCode).json({ error: error.message })
    }
    res.status(500).json({ error: "Internal Server Error" });
  }
})

// Login 

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const data = await login({ email, password });

    res.cookie(COOKIES.AUTH_TOKEN, data.authToken, { secure: true, httpOnly: true });
    res.cookie(COOKIES.REFRESH_TOKEN, data.refreshToken, { secure: true, httpOnly: true });

    const publicUser: PublicUser = getPublicUser(data.user);

    return res.status(200).json({ message: "User logged in successfully", user: publicUser });
  } catch (err: any) {
    if (err instanceof HttpError) {
      return res.status(err.statusCode).json({ error: err.message })
    }

    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// Logout ---

router.post("/logout", async (req, res) => {

  try {
    const authToken = req.cookies[COOKIES.AUTH_TOKEN];

    await logout(authToken);
    res.clearCookie(COOKIES.AUTH_TOKEN);
    res.clearCookie(COOKIES.REFRESH_TOKEN);
    res.status(200).json({ message: "User logged out successfully" });
  } catch (err: any) {
    if (err instanceof HttpError) {
      return res.status(err.statusCode).json({ error: err.message })
    }
    return res.status(500).json({ error: "Internal Server Error" });
  }
});


// Refresh Token ---

router.post("/refresh", async (req, res) => {
  try {
    const currentRefreshToken = req.cookies[COOKIES.REFRESH_TOKEN];
    if (!currentRefreshToken) {
      return res.status(401).json({ error: "No refresh token provided" });
    }

    const newTokens = await refreshAuthToken(currentRefreshToken);
    res.cookie(COOKIES.AUTH_TOKEN, newTokens.authToken, { secure: true, httpOnly: true });
    res.cookie(COOKIES.REFRESH_TOKEN, newTokens.refreshToken, { secure: true, httpOnly: true });

    return res.status(200).json({ message: "Token refreshed successfully" });

  } catch (err: any) {
    if (err instanceof HttpError) {
      return res.status(err.statusCode).json({ error: err.message })
    }
    return res.status(500).json({ error: "Internal Server Error" });
  }
});


export default router