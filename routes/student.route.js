import { Router } from "express";
import { getStudentDashboardData, borrowBook, getBorrowedBooksByCurrentUser, getCurrentUserBorrowingHistory, returnBook, overDueBooksRecord} from "../Controller/student.controller.js";

const router = Router();

router.route("/student-dashboard-data/:userId").get(getStudentDashboardData)
router.route("/borrow").post(borrowBook)
router.route("/borrowedBooks/:userId").get(getBorrowedBooksByCurrentUser)
router.route("/borrowedBooksHistory/:userId").get(getCurrentUserBorrowingHistory)
router.route("/returnBook").post(returnBook)
router.route("/over-due-books/:userId").get(overDueBooksRecord)

export default router