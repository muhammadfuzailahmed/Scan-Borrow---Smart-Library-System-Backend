# ScanBorrow Backend

## Overview

ScanBorrow Backend provides REST APIs and database operations for the QR Based Smart Library Borrowing System.

The backend handles authentication, QR based borrowing, QR based return processing, transaction management, fine calculation, overdue detection, reporting, and administrative operations.

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

Stores copies and QR values.

Fields:

* bookCopyId
* bookId
* copyCode
* QRcode
* isIssued

### TransactionRecords

Stores borrowing, return, and fine records.

Fields:

* transactionId
* transactionCode
* userId
* bookCopyId
* issueDate
* dueDate
* returnDate
* book_status
* fineAmount

---

## API Modules

### Auth Routes

```text
POST /api/auth/login
GET  /api/auth/current-user/:userId
```

### Student Routes

```text
GET  /api/student/student-dashboard-data/:userId
POST /api/student/borrow
GET  /api/student/borrowedBooks/:userId
GET  /api/student/borrowedBooksHistory/:userId
POST /api/student/returnBook
GET  /api/student/overdue-books/:userId
```

### Book Routes

```text
GET /api/books/books
```

### Admin Routes

```text
GET /api/admin/admin-dashboard-data
GET /api/admin/admin-transactions-data
GET /api/admin/admin-book-details
GET /api/admin/admin-book-copies-details
GET /api/admin/admin-records
```

---

## Business Rules

### Borrowing Rules

* Student must exist.
* Book copy must exist.
* Book copy must be available.
* Student cannot borrow more than 3 books.
* Duplicate active borrowing of the same copy is not allowed.

### Return Rules

* Transaction must exist.
* Transaction must belong to the requesting user.
* Book must currently be issued.
* Return date is automatically stored.
* Book copy availability is restored after return.
* Book status changes from ISSUED to RETURNED.

### Fine Rules

* Fine is only applied when a book is returned after its due date.
* Fine Rate = Rs. 20 per day.
* Fine Amount = Days Late × 20.
* Fine is stored in the transaction record.

### Overdue Rules

A book is considered overdue when:

```text
book_status = ISSUED
returnDate = NULL
dueDate < Current Date
```

---

## Assignment 1 Features

Implemented:

* Authentication
* Book Search
* QR Borrowing
* Student Dashboard
* Admin Dashboard
* Transaction Management

---

## Assignment 2 Features

Implemented:

* QR Based Book Return
* Return Date Management
* Book Availability Restoration
* Fine Calculation
* Fine Storage in Database
* Overdue Book Detection
* Student Overdue Warning
* Dashboard Overdue Notifications
* Admin Reports API
* Most Borrowed Books Report
* Defaulters List Report
* Fine Report
* Recent Transactions Report
* Fine Display in Transactions

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

## Authors

Muhammad Fuzail Ahmed

DBMS PBL Project

QR Based Smart Library Borrowing System
