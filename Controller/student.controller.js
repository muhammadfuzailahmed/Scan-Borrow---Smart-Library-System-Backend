import sql from "../DB/db.js";

const getStudentDashboardData = async (req, res) => {
  const userId = req.user.userId;

  //borrowed books

  const borrowedBooksResult =
    await sql.query`select count(*) AS borrowed_books from transaction_records where userId = ${userId} and book_status = 'ISSUED'`;

  //total transactions

  const totalTransactionsResult = await sql.query(
    `select count(*) AS total_transactions from transaction_records where userId = ${userId}`,
  );

  const nextDueDateResult = await sql.query`
      SELECT TOP 1 dueDate
      FROM transaction_records
      WHERE userId = ${userId}
      AND book_status = 'ISSUED'
      ORDER BY dueDate ASC
    `;

  const currentIssuedBooksResult =
    await sql.query`select b.bookName, bc.copyCode, tr.transactionCode, tr.issueDate, tr.dueDate, tr.book_status AS status FROM transaction_records tr JOIN  book_copies bc ON tr.bookCopyId = bc.bookCopyId
      JOIN books b ON bc.bookId = b.bookId
      WHERE tr.userId = ${userId}
      AND tr.book_status = 'ISSUED'
      ORDER BY tr.issueDate DESC`;

  return res.status(200).json({
    success: true,
    message: "dashboard data fetched successfuly",
    stats: {
      borrowedBooks: borrowedBooksResult.recordset[0].borrowed_books,
      maxBooks: 3,
      totalTransactions:
        totalTransactionsResult.recordset[0].total_transactions,
      nextDueDate: nextDueDateResult.recordset[0]?.dueDate || null,
    },
    issuedBooks: currentIssuedBooksResult.recordset,
  });
};

const borrowBook = async (req, res) => {
  const { QRcode } = req.body;
  const userId = req.user?.userId;

  const numberOfBorrowedBooksResult =
    await sql.query`select count(*) AS totalBorrowedBooks from transaction_records where userId = ${userId} and book_status = 'ISSUED'`;

  const numberOfBorrowedBooks =
    numberOfBorrowedBooksResult.recordset[0].totalBorrowedBooks;

  if (numberOfBorrowedBooks >= 3) {
    return res.status(409).json({
      success: false,
      message: "You have reached maximum limit to borrow books.",
    });
  }

  const userResult =
    await sql.query`select * from users where userId = ${userId}`;

  if (userResult.recordset.length === 0) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  const user = userResult.recordset[0];

  if (user.isActive === 0) {
    return res.status(401).json({
      success: false,
      message: "User account is not active",
    });
  }

  const bookCopyIdResult =
    await sql.query`select bookCopyId from book_copies where QRcode = ${QRcode}`;
  const bookCopyId = bookCopyIdResult.recordset[0].bookCopyId;

  const QRcodeResult =
    await sql.query`select * from book_copies where bookCopyId = ${bookCopyId}`;

  if (QRcodeResult.recordset.length === 0) {
    return res.status(404).json({
      success: false,
      message: "Book copy not found",
    });
  }

  const bookCopy = QRcodeResult.recordset[0];

  if (bookCopy.isIssued == 1) {
    return res.status(404).json({
      success: false,
      message: "Book copy already issued",
    });
  }

  const bookIssuedToSameUserResult =
    await sql.query`select * from transaction_records where userId = ${userId} and bookCopyId = ${bookCopyId} and book_status = 'ISSUED'`;

  if (bookIssuedToSameUserResult.recordset.length !== 0) {
    return res.status(404).json({
      success: false,
      message: "Book copy is already issued to current user",
    });
  }

  const issueDate = new Date();

  const dueDate = new Date();
  dueDate.setDate(issueDate.getDate() + 7);

  const formatDate = (date) => {
    return date.toISOString().split("T")[0];
  };

  const formattedIssueDate = formatDate(issueDate);
  const formattedDueDate = formatDate(dueDate);

  const generateTransactionCode = () => {
    const date = new Date().toISOString().split("T")[0].replaceAll("-", "");
    const random = Math.floor(100000 + Math.random() * 900000);

    return `TXN-${date}-${random}`;
  };

  const transactionCode = generateTransactionCode();

  const issueBookToUser =
    await sql.query`insert into transaction_records (transactionCode, bookCopyId, userId, issueDate, dueDate, returnDate, book_status) values ( ${transactionCode}, ${bookCopy.bookCopyId}, ${userId}, ${formattedIssueDate}, ${formattedDueDate}, null, 'ISSUED')`;

  const updateIsIssued =
    await sql.query`update book_copies set isIssued = 1 where bookCopyId = ${bookCopyId}`;

  const userLoginIdResult =
    await sql.query`select loginId from users where userId = ${userId}`;
  const userLoginId = userLoginIdResult.recordset[0];

  await sql.query`insert into activity_logs (loginId, userId, actionType, description) values (${userLoginId.loginId}, ${userId}, 'BOOK ISSUE', 'Student issued/borrowed a book')`;

  const borrowedBookData =
    await sql.query`select * from transaction_records where userId = ${userId} and bookCopyId = ${bookCopyId}`;

  if (borrowedBookData.recordset.length === 0) {
    return res.status(402).json({
      success: false,
      message: "Error fetching borrowed book data",
    });
  }

  const getBorrowedBookCopyCodeResult =
    await sql.query`select copyCode from book_copies where bookCopyId = ${bookCopyId}`;

  if (getBorrowedBookCopyCodeResult.recordset.length === 0) {
    return res.status(403).json({
      success: false,
      message: "Error getting Book Copy Code",
    });
  }

  const getBorrowedBookCopyCode =
    getBorrowedBookCopyCodeResult.recordset[0].copyCode;

  const bookNameResult =
    await sql.query`select bookName from books where bookId = (select bookId from book_copies where bookCopyId = ${bookCopyId})`;

  if (bookNameResult.recordset.length === 0) {
    return res.status(403).json({
      success: false,
      message: "Error getting book name",
    });
  }

  const bookName = bookNameResult.recordset[0].bookName;

  return res.status(200).json({
    success: true,
    message: "Book Issued Successfully!",
    borrowedBook: borrowedBookData.recordset[0],
    bookCopyCode: getBorrowedBookCopyCode,
    bookName: bookName,
  });
};

const getBorrowedBooksByCurrentUser = async (req, res) => {
  const userId = req.user?.userId;

  const getBooksQueryResult =
    await sql.query`select b.bookName, bc.copyCode, tr.transactionCode, tr.issueDate, tr.dueDate, tr.book_status AS status from transaction_records tr JOIN book_copies bc ON tr.bookCopyId = bc.bookCopyId JOIN books b ON bc.bookId = b.bookId where tr.book_status = 'ISSUED' and tr.userId = ${userId}`;

  if (getBooksQueryResult.recordset.length === 0) {
    return res.status(201).json({
      success: true,
      message: "Currently you have no books borrowed",
    });
  }

  const getBooksQuery = getBooksQueryResult.recordset;

  res.status(200).json({
    success: true,
    message: "Borrowed books fetched successfully!",
    issuedBooks: getBooksQuery,
  });
};

const getCurrentUserBorrowingHistory = async (req, res) => {
  const userId = req.user?.userId;

  const getBooksQueryResult =
    await sql.query`select b.bookName, bc.copyCode, tr.transactionCode, tr.issueDate, tr.dueDate, tr.book_status AS status from transaction_records tr JOIN book_copies bc ON tr.bookCopyId = bc.bookCopyId JOIN books b ON bc.bookId = b.bookId where tr.userId = ${userId}`;

  if (getBooksQueryResult.recordset.length === 0) {
    return res.status(201).json({
      success: true,
      message: "Currently you have no books borrowed",
    });
  }

  const getBooksQuery = getBooksQueryResult.recordset;

  res.status(200).json({
    success: true,
    message: "Borrowed books fetched successfully!",
    borrowedBooksHistory: getBooksQuery,
  });
};

const formatDate = (date) => {
  if (!date) return "No Borrowed Books";

  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const returnBook = async (req, res) => {
  const { transactionCode } = req.body;
  const userId = req.user?.userId;

  const bookCopyIdResult =
    await sql.query`select bookCopyId from transaction_records where transactionCode = ${transactionCode}`;
  const bookCopyId = bookCopyIdResult.recordset[0].bookCopyId;

  await sql.query`update book_copies set isIssued = 0 where bookCopyId = ${bookCopyId}`;

  const userLoginIdResult =
    await sql.query`select loginId from users where userId = ${userId}`;
  const userLoginId = userLoginIdResult.recordset[0];

  await sql.query`insert into activity_logs (loginId, userId, actionType, description) values (${userLoginId.loginId}, ${userId}, 'BOOK RETURN', 'Student returned a book')`;

  const date = new Date();

  const formattedDate = date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const dueDateResult =
    await sql.query`select dueDate from transaction_records where transactionCode = ${transactionCode}`;
  const dueDate = dueDateResult.recordset[0].dueDate;
  const returnDate = new Date();

  // remove time part so only date is compared
  dueDate.setHours(0, 0, 0, 0);
  returnDate.setHours(0, 0, 0, 0);

  const diffTime = returnDate - dueDate;
  const lateDays = Math.max(Math.ceil(diffTime / (1000 * 60 * 60 * 24)), 0);
  const finePerDay = 20;
  let totalFine = 0;

  if (lateDays !== 0) {
    totalFine = finePerDay * lateDays;
    await sql.query`insert into activity_logs (loginId, userId, actionType, description) values (${userLoginId.loginId}, ${userId}, 'FINE GENERATED', 'Fine generated on late return')`;
  } else {
    console.log("No fee charged");
  }

  await sql.query`update transaction_records set book_status = 'RETURNED' where bookCopyId = ${bookCopyId}`;
  await sql.query`update transaction_records set returnDate = ${formattedDate} where bookCopyId = ${bookCopyId}`;
  await sql.query`update transaction_records set fineAmount = ${totalFine} where transactionCode = ${transactionCode}`;
  const bookInfo =
    await sql.query`select transactionCode, issueDate, returnDate, dueDate, fineAmount from transaction_records where transactionCode = ${transactionCode}`;

  return res.status(200).json({
    success: true,
    message: "Book returned successfully!",
    bookInfo: bookInfo.recordset[0],
  });
};

const overDueBooksRecord = async (req, res) => {
  const userId = req.user?.userId;
  const currentFormattedDate = new Date();

  currentFormattedDate.setHours(0, 0, 0, 0);

  const dueBookDataResult =
    await sql.query`select bookCopyId, dueDate from transaction_records where userId = ${userId} and book_status = 'ISSUED'`;
  const bookDueDate = dueBookDataResult.recordset;
  const booksName = [];

  for (const b of bookDueDate) {
    if (currentFormattedDate > b.dueDate?.setHours(0, 0, 0, 0)) {
      let bookNameResult =
        await sql.query`select bookName from books where bookId = (select bookId from book_copies where bookCopyId = ${b.bookCopyId})`;
      let bookDataResult =
        await sql.query`select transactionCode, issueDate, dueDate, book_status AS status from transaction_records where bookCopyId = ${b.bookCopyId} and book_status = 'ISSUED'`;
      let bookCopyCodeResult =
        await sql.query`select copyCode from book_copies where bookCopyId = ${b.bookCopyId}`;
      let booksData = {
        bookName: bookNameResult.recordset[0].bookName,
        bookCopyCode: bookCopyCodeResult.recordset[0].copyCode,
        bookData: bookDataResult.recordset[0],
      };
      booksName.push(booksData);
    }
  }

  res.status(200).json({
    success: true,
    message: "Books with expired due date fetched successfully!",
    books: booksName,
  });
};

const suggestBookToUser = async (req, res) => {
  const userId = req.user?.userId;

  const userDepartmentAndSemester =
    await sql.query`select department, semester from users where userId = ${userId}`;

  const userBorrowedBooksResult =
    await sql.query`select bookCopyId from transaction_records where userId = ${userId} and book_status = 'ISSUED'`;
  const userBorrowedBooks = userBorrowedBooksResult.recordset;
  let bookCategories = [];

  for (const b of userBorrowedBooks) {
    const bookCopyIdDataResult =
      await sql.query`select category from books where bookId = (select bookId from book_copies where bookCopyId = ${b.bookCopyId})`;
    const bookCopyIdData = bookCopyIdDataResult.recordset;
    bookCategories.push(bookCopyIdData[0].category);
  }

  const currentBorrowedBooksByUserResult =
    await sql.query`select bookName from books where bookId IN (select bookId from book_copies where bookCopyId IN (select bookCopyId from transaction_records where userId = ${userId}))`;

  const currentBorrowedBooksByUser = currentBorrowedBooksByUserResult.recordset;

  let recommendedBookCategories = [];

  for (const c of bookCategories) {
    const allBooksCategoriesResult =
      await sql.query`select * from books`;

    for (const b of allBooksCategoriesResult.recordset) {
      if (c == b.category) {
        recommendedBookCategories.push(b);
      }
    }
  }

  const mostBorrowedBooksResult = await sql.query`SELECT b.bookId, b.bookName, b.author, b.category, b.bookDescription FROM  transaction_records tr JOIN book_copies bc ON tr.bookCopyId = bc.bookCopyId JOIN books b ON bc.bookId = b.bookId GROUP BY b.bookId, b.bookName, b.author, b.category, b.bookDescription ORDER BY COUNT(tr.transactionId) DESC`;

  const mostBorrowedBooks = mostBorrowedBooksResult.recordset;

  recommendedBookCategories = recommendedBookCategories.concat(mostBorrowedBooks);
  
  for (const b of currentBorrowedBooksByUser) {
    recommendedBookCategories = recommendedBookCategories.filter(rb => rb.bookName !== b.bookName)
  }

  return res.status(200).json({
    success: true,
    message: "Book suggestion Fetched",
    suggestedBooks: recommendedBookCategories,
  });
};

export {
  getStudentDashboardData,
  borrowBook,
  getBorrowedBooksByCurrentUser,
  getCurrentUserBorrowingHistory,
  returnBook,
  overDueBooksRecord,
  suggestBookToUser,
};
