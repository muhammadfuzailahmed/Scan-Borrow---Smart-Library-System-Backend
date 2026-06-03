import { Router } from "express";
import { getBooks } from "../Controller/book.controller.js";

const router = Router();

router.route("/books").get(getBooks)

export default router