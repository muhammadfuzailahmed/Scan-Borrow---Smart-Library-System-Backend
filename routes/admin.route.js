import { Router } from "express";
import { getAdminDashboardData, getTransactionsPageData, getBookDetails, bookCopiesDetails } from "../Controller/admin.controller.js";

const router = Router();

router.route("/admin-dashboard-data").get(getAdminDashboardData)
router.route("/admin-transactions-data").get(getTransactionsPageData)
router.route("/admin-book-details").get(getBookDetails)
router.route("/admin-book-copies-details").get(bookCopiesDetails)

export default router