import sql from "../DB/db.js";

const getStudentDashboardData = async (req, res) => {
  const { userId } = req.params;

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
  const { userId, QRcode } = req.body;

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
  const { userId } = req.params;

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
  const { userId } = req.params;

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

 const returnBook = async (req, res) => {
    const { transactionCode, userId } = req.body;

    const bookCopyIdResult =
      await sql.query`select bookCopyId from transaction_records where transactionCode = ${transactionCode}`;
    const bookCopyId = bookCopyIdResult.recordset[0].bookCopyId;

    await sql.query`update book_copies set isIssued = 0 where bookCopyId = ${bookCopyId}`;

    const date = new Date();

    const formattedDate = date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    await sql.query`update transaction_records set book_status = 'RETURNED' where bookCopyId = ${bookCopyId}`;
    await sql.query`update transaction_records set returnDate = ${formattedDate} where bookCopyId = ${bookCopyId}`;

    return res.status(200).json({
      success: true,
      message: "Book returned successfully!"
    })

  };

export {
  getStudentDashboardData,
  borrowBook,
  getBorrowedBooksByCurrentUser,
  getCurrentUserBorrowingHistory,
  returnBook
};
