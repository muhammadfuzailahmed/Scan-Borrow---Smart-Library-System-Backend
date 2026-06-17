import { Router } from "express";
import { loginUser, getCurrentUser, logoutUser } from "../Controller/auth.controller.js";
import verifyJWT from "../Middleware/verifyjwt.js";

const router = Router();

router.route("/login").post(loginUser)
router.route("/current-user").get(verifyJWT, getCurrentUser)
router.route("/logout").post(verifyJWT, logoutUser)

export default router