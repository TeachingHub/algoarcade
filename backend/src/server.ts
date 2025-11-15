import express from "express";
import { PORT } from "./config/enviroments";
import authController from "./controller/authController";

const app = express();
app.use(express.json());

app.use("/api/auth", authController);


app.listen(PORT, () => console.log(`🚀 Servidor en http://localhost:${PORT}`));