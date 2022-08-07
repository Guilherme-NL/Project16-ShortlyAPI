import { getUsers } from "../controllers/usersController.js";
import { Router } from "express";

const router = Router();

router.get("/users/me", getUsers);

export default router;
