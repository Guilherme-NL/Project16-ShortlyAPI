import {
  shorten,
  getShort,
  getShortOpen,
  deleteShort,
} from "../controllers/urlsController.js";
import { Router } from "express";

const router = Router();

router.post("/urls/shorten", shorten);

router.get("/urls/:id", getShort);

router.get("/urls/open/:shortUrl", getShortOpen);

router.delete("/urls/:id", deleteShort);

export default router;
