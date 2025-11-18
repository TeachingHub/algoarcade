import dotenv from "dotenv";
dotenv.config();


if (!process.env.FIREBASE_API_KEY) {
    console.error("FATAL ERROR: FIREBASE_API_KEY is missing in .env");
    process.exit(1);
}

export const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY;
export const PORT = process.env.PORT || 3000;