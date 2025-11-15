import dotenv from "dotenv";
dotenv.config();

export const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY || "";
export const PORT = process.env.PORT || 3000;