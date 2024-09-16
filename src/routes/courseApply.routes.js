import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";

const router = Router()

router.route("/apply_for_course").post(verifyJWT)

export default router