import express from "express";
import { signup, verifyOTP, resendOTP, login, logout, forgotPassword, updateUserData } from "../controllers/user.controllers.js"
import { authenticateUser } from "../middleware/auth.js";
import { userValidation } from "../validation/index.js"

const router = express.Router()

router.post("/signup", userValidation.signup, signup);
router.post("/verify-otp", userValidation.verifyOTP, verifyOTP);
router.post("/resend-otp", userValidation.resendOTP, resendOTP);
router.post("/forgot-password", userValidation.forgotPassword, forgotPassword);
router.post("/login", userValidation.login, login);
router.put("/update-user-data", userValidation.updateUserData, authenticateUser, updateUserData);
router.post("/logout", logout);

export const userRouter = router;