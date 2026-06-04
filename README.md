# ScanBorrow Backend

## Overview

ScanBorrow Backend provides REST APIs and database operations for the QR-Based Smart Library Borrowing System.

---

## Technology Stack

* Node.js
* Express.js
* Microsoft SQL Server (SSMS)
* mssql
* msnodesqlv8

---

## Database Tables

### Users

Stores student and administrator accounts.

Fields:

* userId
* name
* loginId
* password
* role
* isActive
* department
* semester
* batch

### Books

Stores book information.

Fields:

* bookId
* bookName
* author
* category
* bookDescription

### BookCopies

Stores physical copies and QR values.

Fields:

* bookCopyId
* bookId
* copyCode
* QRcode
* isIssued

### TransactionRecords

Stores borrowing transactions.

Fields:

* transactionId
* transactionCode
* userId
* bookCopyId
* issueDate
* dueDate
* returnDate
* book_status

---

## API Modules

### Auth Routes

```text
POST /api/auth/login
GET  /api/auth/current-user/:userId
```

### Student Routes

```text
GET  /api/student/dashboard/:userId
GET  /api/student/my-books/:userId
GET  /api/student/history/:userId
POST /api/student/borrow
```

### Book Routes

```text
GET /api/books
```

### Admin Routes

```text
GET /api/admin/dashboard
GET /api/admin/books
GET /api/admin/book-copies
GET /api/admin/transactions
```

---

## Business Rules

### Borrowing Rules

* Student must exist.
* Book copy must exist.
* Book copy must be available.
* Student cannot borrow more than 3 books.
* Duplicate active borrowing of the same copy is not allowed.

---

## Installation

Install dependencies:

```bash
npm install
```

Run server:

```bash
npm start
```

---

## Phase 1 Scope

Implemented:

* Authentication
* Book Search
* QR Borrowing
* Student Dashboard
* Admin Dashboard
* Transaction Management

Future Assignments:

* Return Books
* Fine Calculation
* Notifications
* Reservations
