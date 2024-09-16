import { Router } from "express";
import { forgotPassword, loginUser, logoOutUser, refreshAccessToken, registerUser, resetPassword } from "../controllers/auth.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware";

const router = Router()

router.route("/register").post(registerUser)
router.route("/login").get(loginUser)
router.route("/forget_passoword").post(forgotPassword)

// secured routes
router.route("/logout").get(logoOutUser)
router.route("/refres_access_token").get(refreshAccessToken)
router.route("/reset_password").post(verifyJWT, resetPassword)

export default router