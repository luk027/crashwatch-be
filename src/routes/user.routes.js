import express from "express";
import { signup, login, logout, updatePassword } from "../controllers/user.controllers.js"
import { authenticateUser } from "../middleware/auth.js";

const router = express.Router()

router.post("/signup", signup);
router.post("/login", login);
router.post("/updatePassword", authenticateUser, updatePassword);
router.post("/logout", logout);

export const userRouter = router;