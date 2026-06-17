import { Router } from "express";
import { getAdminDashboardData, getTransactionsPageData, getBookDetails, bookCopiesDetails, getAdminRecordsPageData } from "../Controller/admin.controller.js";
import verifyJWT from "../Middleware/verifyjwt.js";
import { verifyAdmin } from "../Middleware/verifyRole.js";

const router = Router();

router.route("/admin-dashboard-data").get(verifyJWT, verifyAdmin, getAdminDashboardData)
router.route("/admin-transactions-data").get(verifyJWT, verifyAdmin, getTransactionsPageData)
router.route("/admin-book-details").get(verifyJWT, verifyAdmin, getBookDetails)
router.route("/admin-book-copies-details").get(verifyJWT, verifyAdmin, bookCopiesDetails)
router.route("/admin-records").get(verifyJWT, verifyAdmin, getAdminRecordsPageData)

export default router