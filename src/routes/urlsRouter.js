import { shorten } from "../controllers/urlsController.js";
import { Router } from "express";

const router = Router();

router.post("/urls/shorten", shorten);

export default router;
