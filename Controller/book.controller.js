import sql from "../DB/db.js";

const getBooks = async (req, res) => {
  const booksReult = await sql.query`select * from books`;
  const books = [];

  for (const book of booksReult.recordset) {
    const copiesResult =
      await sql.query`select bookCopyId, copyCode, QRcode, isIssued FROM book_copies where bookId = ${book.bookId}`;

    const copies = copiesResult.recordset;

    const availableCopiesOfCurrentBook = await sql.query`select COUNT(*) AS total_remaining_copies from book_copies where isIssued = 0 and bookId = ${book.bookId}`

    books.push({
      ...book,
      totalCopies: copies.length,
      availableCopies: availableCopiesOfCurrentBook.recordset[0].total_remaining_copies,
      copies: copies,
    });
  }

  return res.status(200).json({
    success: true,
    message: "books fetched successfully!",
    books: books,
  });
};

export {getBooks}