import sql from "../DB/db.js";

const getAdminDashboardData = async (req, res) => {
  const totalBooksResult =
    await sql.query`select count(*) AS totalBooksInLibrary from books`;

  const totalBooksCopiesResult =
    await sql.query`select count(*) AS totalBookCopiesInLibrary from book_copies`;

  const avalaibleBookCopies =
    await sql.query`select count(*) AS availableCopies from book_copies where isIssued = 0`;

  const issuedCopiesResult =
    await sql.query`select count(*) AS issuedCopies from transaction_records where book_status = 'ISSUED'`;

  const totalTransactionsRessult =
    await sql.query`select count(*) totalTransactions from transaction_records`;

  const activeBorrwersResult =
    await sql.query`select count(*) AS activeBorrowers from transaction_records where book_status = 'ISSUED'`;

  const userDataResult =
    await sql.query`select tr.transactionCode, tr.issueDate, tr.dueDate, tr.book_status, u.name, u.loginId, bc.copyCode, b.bookName from transaction_records tr JOIN users u ON tr.userId = u.userId JOIN book_copies bc ON bc.bookCopyID = tr.bookCopyId JOIN books b on b.bookId = bc.bookId`;

  const overDueBooksResult =
    await sql.query`SELECT COUNT(*) AS over_due_books FROM transaction_records WHERE returnDate IS NULL AND book_status = 'ISSUED' AND dueDate < CAST(GETDATE() AS DATE)`;

  const totalOverDueBooks = overDueBooksResult.recordset[0].over_due_books;

  const totalFineResult =
    await sql.query`select SUM(fineAmount) AS total_fine from transaction_records`;

  return res.status(200).json({
    success: true,
    message: "Admin dashboard data fetched successfully!",
    stats: {
      totalBooks: totalBooksResult.recordset[0].totalBooksInLibrary,
      totalCopies: totalBooksCopiesResult.recordset[0].totalBookCopiesInLibrary,
      availableCopies: avalaibleBookCopies.recordset[0].availableCopies,
      issuedCopies: issuedCopiesResult.recordset[0].issuedCopies,
      totalTransactions:
        totalTransactionsRessult.recordset[0].totalTransactions,
      activeBorrowers: activeBorrwersResult.recordset[0].activeBorrowers,
    },
    recentTransactions: userDataResult.recordset.slice(0, 10),
    totalOverDueBooks: totalOverDueBooks,
    totalFine: totalFineResult.recordset[0].total_fine,
  });
};

const getTransactionsPageData = async (req, res) => {
  const transactionPageDataResult =
    await sql.query`select tr.transactionCode, tr.issueDate, tr.dueDate, tr.transactionId, tr.book_status, tr.fineAmount, u.name, u.loginId, bc.copyCode, b.bookName from transaction_records tr JOIN users u ON tr.userId = u.userId JOIN book_copies bc ON bc.bookCopyID = tr.bookCopyId JOIN books b on b.bookId = bc.bookId`;

  res.status(200).json({
    success: true,
    message: "Admin transactions page data fetched successfully!",
    transactions: transactionPageDataResult.recordset,
  });
};

const getBookDetails = async (req, res) => {
  const getBookDetailsQueryResult =
    await sql.query`select bookId, bookName, author, category, bookDescription from books`;

  const books = [];

  for (const book of getBookDetailsQueryResult.recordset) {
    const totalCopiesResult =
      await sql.query`select count (*) AS totalCopies from book_copies where bookId = ${book.bookId}`;

    const availableCopiesResult =
      await sql.query`select count(*) AS availableCopies from book_copies where bookId = ${book.bookId} and isIssued = 0`;

    const issuedCopiesResult =
      await sql.query`select count(*) AS issuedCopies from book_copies where bookId = ${book.bookId} and isIssued = 1`;

    books.push({
      ...book,
      totalCopies: totalCopiesResult.recordset[0].totalCopies,
      availableCopies: availableCopiesResult.recordset[0].availableCopies,
      issuedCopies: issuedCopiesResult.recordset[0].issuedCopies,
    });
  }

  return res.status(200).json({
    success: true,
    message: "Book details fetched successfully!",
    books: books,
  });
};

const bookCopiesDetails = async (req, res) => {
  const bookCopyDetailsQueryResult =
    await sql.query`select bc.bookCopyId, bc.copyCode, bc.QRcode, bc.isIssued, b.bookName from book_copies bc JOIN books b ON bc.bookId = b.bookId`;

  return res.status(200).json({
    success: true,
    message: "Book copies data fetched successfully!",
    bookCopies: bookCopyDetailsQueryResult.recordset,
  });
};

const getAdminRecordsPageData = async (req, res) => {
  const mostBorrowedBooksResult =
    await sql.query`select b.bookName, b.author, COUNT(tr.transactionId) AS borrowCount FROM transaction_records tr JOIN book_copies bc ON tr.bookCopyId = bc.bookCopyId JOIN books b ON bc.bookId = b.bookId GROUP BY b.bookId, b.bookName, b.author ORDER BY borrowCount DESC`;

  let defaulterData = [];
  const defaultersListDueDateResult =
    await sql.query`SELECT dueDate, userId, bookCopyId, DATEDIFF(DAY, dueDate, CAST(GETDATE() AS DATE)) AS daysLate FROM transaction_records WHERE returnDate IS NULL AND book_status = 'ISSUED' AND dueDate < CAST(GETDATE() AS DATE)`;

  if (defaultersListDueDateResult.recordset.length === 0) {
    defaulterData = 0;
  }

  const defaultersListDueDate = defaultersListDueDateResult.recordset;
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  const MS_PER_DAY = 1000 * 60 * 60 * 24;

  for (const d of defaultersListDueDate) {
    const formattedDueDate = new Date(d.dueDate);
    const daysLate = Math.floor((currentDate - formattedDueDate) / MS_PER_DAY);
    if (currentDate > formattedDueDate) {
      const defaultersListNameResult =
        await sql.query`select name from users where userId = ${d.userId}`;
      const defaultersListLoginIdResult =
        await sql.query`select loginId from users where userId = ${d.userId}`;
      const defaultersListCopyCodeResult =
        await sql.query`select copyCode from book_copies where bookCopyId = ${d.bookCopyId}`;
      const defaultersListBookNameResult =
        await sql.query`select bookName from books where bookId = (select bookId from book_copies where bookCopyId = ${d.bookCopyId})`;

      defaulterData.push({
        name: defaultersListNameResult.recordset[0].name,
        loginId: defaultersListLoginIdResult.recordset[0].loginId,
        bookName: defaultersListBookNameResult.recordset[0].bookName,
        copyCode: defaultersListCopyCodeResult.recordset[0].copyCode,
        dueDate: d.dueDate,
        daysLate: d.daysLate,
        fineAmount: d.daysLate * 20,
      });
    } else {
      console.log("Not overdue");
    }
  }

  let fineReports = [];

  const fineReportsDueDateAndFineResult =
    await sql.query`select returnDate, fineAmount, bookCopyId, userId from transaction_records where returnDate is not Null and book_status = 'RETURNED' and fineAmount != 0`;

  const fineReportsDueDateAndFine = fineReportsDueDateAndFineResult.recordset;

  for (const fine of fineReportsDueDateAndFine) {
    const fineReportsBookNameResult =
      await sql.query`select bookName from books where bookId = (select bookId from book_copies where bookCopyId = ${fine.bookCopyId})`;
    const fineReportsStudentNameResult =
      await sql.query`select name from users where userId = ${fine.userId}`;
    const fineReportsStudentLoginIdResult =
      await sql.query`select loginId from users where userId = ${fine.userId}`;

    fineReports.push({
      name: fineReportsStudentNameResult.recordset[0].name,
      loginId: fineReportsStudentLoginIdResult.recordset[0].loginId,
      bookName: fineReportsBookNameResult.recordset[0].bookName,
      returnDate: fine.returnDate,
      fineAmount: fine.fineAmount,
    });
  }

  const latestTransactionRecords = [];

  const latestTransactionRecordsDataResult =
    await sql.query`select * from transaction_records order by transactionId DESC`;

  const latestTransactionRecordsData =
    latestTransactionRecordsDataResult.recordset.slice(0, 3);

  for (const t of latestTransactionRecordsData) {
    const transactionRecordsBookNameResult =
      await sql.query`select bookName from books where bookId = (select bookId from book_copies where bookCopyId = ${t.bookCopyId})`;
    const transactionRecordsCopyCodeResult =
      await sql.query`select copyCode from book_copies where bookCopyId = ${t.bookCopyId}`;
    const transactionRecordsStudentNameResult =
      await sql.query`select name from users where userId = ${t.userId}`;
    const transactionRecordsStudentLoginIdResult =
      await sql.query`select loginId from users where userId = ${t.userId}`;

    latestTransactionRecords.push({
      transactionCode: t.transactionCode,
      studentName: transactionRecordsStudentNameResult.recordset[0].name,
      loginId: transactionRecordsStudentLoginIdResult.recordset[0].loginId,
      bookName: transactionRecordsBookNameResult.recordset[0].bookName,
      copyCode: transactionRecordsCopyCodeResult.recordset[0].copyCode,
      issueDate: t.issueDate,
      returnDate: t.returnDate,
      status: t.book_status,
    });
  }

  const activityLogsResult = await sql.query`select * from activity_logs`;

  return res.status(200).json({
    success: true,
    message: "Records oage data fetched successfully!",
    mostBorrowedBooks: mostBorrowedBooksResult.recordset.slice(0, 3),
    defaultersList: defaulterData,
    fineReport: fineReports,
    recentTransactions: latestTransactionRecords,
    activityLogs: activityLogsResult.recordset,
  });
};

const addBook = async (req, res) => {
  const { bookData } = req.body;

  await sql.query`insert into books (bookName, category, author, bookDescription) values (${bookData.bookName}, ${bookData.category}, ${bookData.author}, ${bookData.bookDescription})`;

  return res.status(200).json({
    success: true,
    message: "Book added successfuly!",
  });
};

const addBookCopy = async (req, res) => {
  const { bookId, copyCode, QRcode } = req.body;

  const oldBookCopiesResult =
    await sql.query`select copyCode, QRcode from book_copies where bookId = ${bookId}`;

  const oldBookCopies = oldBookCopiesResult.recordset;

  for (const b of oldBookCopies) {
    if (b.copyCode == copyCode) {
      return res.status(409).json({
        success: false,
        message: "Copy code already exists against same book",
      });
      break;
    }
  }

  for (const b of oldBookCopies) {
    if (b.QRcode == QRcode) {
      return res.status(409).json({
        success: false,
        message: "QRcode already exists against same book",
      });
      break;
    }
  }

  await sql.query`insert into book_copies (bookId, copyCode, QRcode) values (${bookId}, ${copyCode}, ${QRcode})`;

  return res.status(200).json({
    success: true,
    message: "Book copy added successfully",
  });
};

const updateBookInfo = async (req, res) => {
  const { bookId, bookName, author, category, bookDescription } = req.body;

  await sql.query`update books set bookName = ${bookName}, author = ${author}, category = ${category}, bookDescription = ${bookDescription} where bookId = ${bookId}`;

  return res.status(200).json({
    success: true,

    message: "Book info updated successfully!",
  });
};

const deleteBook = async (req, res) => {
  const { bookId } = req.body;

  const issuedCopiesResult =
    await sql.query`SELECT COUNT(*) AS issuedCount FROM book_copies WHERE bookId = ${bookId} AND isIssued = 1`;

  if (issuedCopiesResult.recordset[0].issuedCount > 0) {
    return res.status(400).json({
      success: false,
      message: "Cannot delete book because some copies are currently issued",
    });
  }

  await sql.query`delete from book_copies where bookId = ${bookId}`;
  await sql.query`delete from books where bookId = ${bookId}`;

  return res.status(200).json({
    success: true,
    message: "bbok deleted successfully!",
  });
};

const deleteBookCopy = async (req, res) => {
  const {bookCopyId} = req.body;

  const bookCopyIsIssuedResult = await sql.query`select isIssued from book_copies where bookCopyId = ${bookCopyId}`

  if(bookCopyIsIssuedResult.recordset[0].isIssued === 1) {
    return res.status(409).json({
      success: false,
      message: "Book copy is already issued"
    })
  }

  await sql.query`delete from book_copies where bookCopyId = ${bookCopyId}`

  return res.status(200).json({
    success: true,
    message: "Book deleted successfully!"
  })
}

export {
  getAdminDashboardData,
  getTransactionsPageData,
  getBookDetails,
  bookCopiesDetails,
  getAdminRecordsPageData,
  addBook,
  addBookCopy,
  updateBookInfo,
  deleteBook,
  deleteBookCopy
};
