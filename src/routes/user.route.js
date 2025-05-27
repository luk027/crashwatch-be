import express from "express";
import { userValidation } from "../validation/index.js"
import { authenticateUser } from "../middleware/auth.js";
import { 
    userControllers,
    scrapeControllers
 } from "../controllers/index.js";


const router = express.Router()

// User Routes
router.post("/signup", userValidation.signup, userControllers.signup);
router.post("/verify-otp", userValidation.verifyOTP, userControllers.verifyOTP);
router.post("/resend-otp", userValidation.resendOTP, userControllers.resendOTP);
router.post("/forgot-password", userValidation.forgotPassword, userControllers.forgotPassword);
router.post("/login", userValidation.login, userControllers.login);
router.put("/update-user-data", userValidation.updateUserData, authenticateUser, userControllers.updateUserData);
router.post("/logout", userControllers.logout);
router.post("/add-to-list", authenticateUser, userControllers.addAssetToWatchlist);
router.delete("/remove-from-list/:id", authenticateUser, userControllers.removeAssetFromWatchlist);

//Scraping Routes
router.post("/search", authenticateUser, scrapeControllers.getSearchResults);
router.get("/fetch-all-assets", authenticateUser, scrapeControllers.fetchUserAssetDetails);

export const userRouter = router;