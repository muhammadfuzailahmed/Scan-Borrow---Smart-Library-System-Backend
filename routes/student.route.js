import { Router } from "express";
import { getStudentDashboardData, borrowBook, getBorrowedBooksByCurrentUser, getCurrentUserBorrowingHistory, returnBook, overDueBooksRecord, suggestBookToUser} from "../Controller/student.controller.js";
import verifyJWT from "../Middleware/verifyjwt.js";
import { verifyStudent } from "../Middleware/verifyRole.js";
const router = Router();

router.route("/student-dashboard-data").get(verifyJWT, verifyStudent, getStudentDashboardData)
router.route("/borrow").post(verifyJWT, verifyStudent, borrowBook)
router.route("/borrowedBooks").get(verifyJWT, verifyStudent, getBorrowedBooksByCurrentUser)
router.route("/borrowedBooksHistory").get(verifyJWT, verifyStudent, getCurrentUserBorrowingHistory)
router.route("/returnBook").post(verifyJWT, verifyStudent, returnBook)
router.route("/over-due-books").get(verifyJWT, verifyStudent, overDueBooksRecord)
router.route("/recommended-books").get(verifyJWT, verifyStudent, suggestBookToUser)


export default router