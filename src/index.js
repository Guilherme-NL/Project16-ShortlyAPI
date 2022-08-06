import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import authRouter from "./routes/authRouter.js";
import urlsRouter from "./routes/urlsRouter.js";

const server = express();

server.use(cors());
server.use(express.json());

server.use(authRouter);
server.use(urlsRouter);

const PORT = process.env.PORT_SERVER || 4000;
server.listen(PORT, () => console.log("Server Online"));
