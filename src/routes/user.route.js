import express from "express";
import { userValidation } from "../validation/index.js"
import { authenticateUser } from "../middleware/auth.js";
import { 
    userControllers,
    scrapeControllers
 } from "../controllers/index.js";


const router = express.Router()

// USER ROUTES
router.post("/signup", userValidation.signup, userControllers.signup);
router.post("/verify-otp", userValidation.verifyOTP, userControllers.verifyOTP);
router.post("/resend-otp", userValidation.resendOTP, userControllers.resendOTP);
router.post("/forgot-password", userValidation.forgotPassword, userControllers.forgotPassword);
router.post("/login", userValidation.login, userControllers.login);
router.put("/update-user-data", userValidation.updateUserData, authenticateUser, userControllers.updateUserData);
router.post("/logout", userControllers.logout);
router.post("/add-to-list", userControllers.addResultToWatchlist);

//Scraping Routes
router.post("/search", scrapeControllers.getSearchResults);

export const userRouter = router;