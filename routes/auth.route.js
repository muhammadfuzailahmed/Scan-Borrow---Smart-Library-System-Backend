import { Router } from "express";
import { loginUser, getCurrentUser } from "../Controller/auth.controller.js";

const router = Router();

router.route("/login").post(loginUser)
router.route("/current-user/:userId").get(getCurrentUser)

export default router