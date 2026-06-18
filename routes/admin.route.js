import { Router } from "express";
import { getAdminDashboardData, getTransactionsPageData, getBookDetails, bookCopiesDetails, getAdminRecordsPageData, addBook, addBookCopy, updateBookInfo, deleteBook, deleteBookCopy } from "../Controller/admin.controller.js";
import verifyJWT from "../Middleware/verifyjwt.js";
import { verifyAdmin } from "../Middleware/verifyRole.js";

const router = Router();

router.route("/admin-dashboard-data").get(verifyJWT, verifyAdmin, getAdminDashboardData)
router.route("/admin-transactions-data").get(verifyJWT, verifyAdmin, getTransactionsPageData)
router.route("/admin-book-details").get(verifyJWT, verifyAdmin, getBookDetails)
router.route("/admin-book-copies-details").get(verifyJWT, verifyAdmin, bookCopiesDetails)
router.route("/admin-records").get(verifyJWT, verifyAdmin, getAdminRecordsPageData)
router.route("/add-book").post(verifyJWT, verifyAdmin, addBook)
router.route("/add-book-copy").post(verifyJWT, verifyAdmin, addBookCopy)
router.route("/update-book-info").post(verifyJWT, verifyAdmin, updateBookInfo)
router.route("/delete-book").post(verifyJWT, verifyAdmin, deleteBook)
router.route("/delete-book-copy").post(verifyJWT, verifyAdmin, deleteBookCopy)

export default router