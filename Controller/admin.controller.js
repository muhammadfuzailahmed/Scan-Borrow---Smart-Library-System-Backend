import sql from "../DB/db.js";

const getAdminDashboardData = async (req, res) => {
    const totalBooksResult = await sql.query`select count(*) AS totalBooksInLibrary from books`

    const totalBooksCopiesResult = await sql.query`select count(*) AS totalBookCopiesInLibrary from book_copies`

    const avalaibleBookCopies = await sql.query`select count(*) AS availableCopies from book_copies where isIssued = 0` 

    const issuedCopiesResult = await sql.query`select count(*) AS issuedCopies from transaction_records where book_status = 'ISSUED'`

    const totalTransactionsRessult = await sql.query`select count(*) totalTransactions from transaction_records`

    const activeBorrwersResult = await sql.query`select count(*) AS activeBorrowers from transaction_records where book_status = 'ISSUED'`

    const userDataResult = await sql.query`select tr.transactionCode, tr.issueDate, tr.dueDate, tr.book_status, u.name, u.loginId, bc.copyCode, b.bookName from transaction_records tr JOIN users u ON tr.userId = u.userId JOIN book_copies bc ON bc.bookCopyID = tr.bookCopyId JOIN books b on b.bookId = bc.bookId`


    return res.status(200).json({
      success: true,
      message: "Admin dashboard data fetched successfully!",
      stats: {
        totalBooks: totalBooksResult.recordset[0].totalBooksInLibrary,
        totalCopies: totalBooksCopiesResult.recordset[0].totalBookCopiesInLibrary,
        availableCopies: avalaibleBookCopies.recordset[0].availableCopies,
        issuedCopies: issuedCopiesResult.recordset[0]. issuedCopies,
        totalTransactions: totalTransactionsRessult.recordset[0].totalTransactions,
        activeBorrowers: activeBorrwersResult.recordset[0].activeBorrowers
      },
      recentTransactions: userDataResult.recordset
    })
}

const getTransactionsPageData = async (req, res) => {
  const transactionPageDataResult = await sql.query`select tr.transactionCode, tr.issueDate, tr.dueDate, tr.transactionId, tr.book_status, u.name, u.loginId, bc.copyCode, b.bookName from transaction_records tr JOIN users u ON tr.userId = u.userId JOIN book_copies bc ON bc.bookCopyID = tr.bookCopyId JOIN books b on b.bookId = bc.bookId`

  res.status(200).json({
    success: true,
      message: "Admin transactions page data fetched successfully!",
      transactions: transactionPageDataResult.recordset
  })

}

const getBookDetails = async (req, res) => {
  const getBookDetailsQueryResult = await sql.query`select bookId, bookName, author, category, bookDescription from books`

  const books = [];

  for(const book of getBookDetailsQueryResult.recordset) {
    const totalCopiesResult = await sql.query`select count (*) AS totalCopies from book_copies where bookId = ${book.bookId}`

    const availableCopiesResult = await sql.query`select count(*) AS availableCopies from book_copies where bookId = ${book.bookId} and isIssued = 0`

    const issuedCopiesResult = await sql.query`select count(*) AS issuedCopies from book_copies where bookId = ${book.bookId} and isIssued = 1`

    books.push({
      ...book,
      totalCopies: totalCopiesResult.recordset[0].totalCopies,
      availableCopies: availableCopiesResult.recordset[0].availableCopies,
      issuedCopies: issuedCopiesResult.recordset[0].issuedCopies
    })

  }


  return res.status(200).json({
    success: true,
    message: "Book details fetched successfully!",
    books: books
  })
}

const bookCopiesDetails = async (req, res) => {
  const bookCopyDetailsQueryResult = await sql.query`select bc.bookCopyId, bc.copyCode, bc.QRcode, bc.isIssued, b.bookName from book_copies bc JOIN books b ON bc.bookId = b.bookId`

  return res.status(200).json({
    success: true,
    message: "Book copies data fetched successfully!",
    bookCopies: bookCopyDetailsQueryResult.recordset
  })

}

export {getAdminDashboardData, getTransactionsPageData, getBookDetails, bookCopiesDetails}