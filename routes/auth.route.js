import { Router } from "express";
import { loginUser, getCurrentUser, logoutUser } from "../Controller/auth.controller.js";

const router = Router();

router.route("/login").post(loginUser)
router.route("/current-user/:userId").get(getCurrentUser)
router.route("/logout").post(logoutUser)

export default router