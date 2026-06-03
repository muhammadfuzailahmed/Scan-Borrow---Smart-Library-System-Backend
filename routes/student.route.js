import { Router } from "express";
import { getStudentDashboardData, borrowBook, getBorrowedBooksByCurrentUser, getCurrentUserBorrowingHistory} from "../Controller/student.controller.js";

const router = Router();

router.route("/student-dashboard-data/:userId").get(getStudentDashboardData)
router.route("/borrow").post(borrowBook)
router.route("/borrowedBooks/:userId").get(getBorrowedBooksByCurrentUser)
router.route("/borrowedBooksHistory/:userId").get(getCurrentUserBorrowingHistory)

export default router