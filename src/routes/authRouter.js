import { signin, signup } from "../controllers/authController.js";
import { Router } from "express";

const router = Router();

router.post("/signin", signin);
router.post("/signup", signup);

export default router;
