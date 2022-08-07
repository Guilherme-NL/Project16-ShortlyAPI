import { ranking } from "../controllers/rankingController.js";
import { Router } from "express";

const router = Router();

router.get("/ranking", ranking);

export default router;
