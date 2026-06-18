# ScanBorrow Backend

## Overview

ScanBorrow Backend provides REST APIs, authentication, authorization, and database operations for the QR Based Smart Library Borrowing System.

The backend handles student and admin authentication, JWT based secure sessions, QR based borrowing, QR based returns, fine calculation, overdue detection, recommendations, activity logging, admin reports, book management, and book copy management using Node.js, Express.js, and Microsoft SQL Server.

---

## Technology Stack

* Node.js
* Express.js
* Microsoft SQL Server (SSMS)
* mssql
* msnodesqlv8
* bcryptjs
* jsonwebtoken
* cookie-parser
* cors
* dotenv

---

## Authentication & Security

### Password Hashing

* User passwords are stored in hashed form using bcryptjs
* Login compares entered password with the hashed password stored in the database
* Plain text password comparison is no longer used

### JWT Authentication

* Access token generated on successful login
* Refresh token generated on successful login
* Refresh token stored in the database
* Access token and refresh token stored in HTTP only cookies
* Protected backend APIs use JWT verification middleware
* Secure logout clears cookies and removes refresh token from database

### Role Based Access Control

* Student routes are protected using student role middleware
* Admin routes are protected using admin role middleware
* Logged out users cannot access protected routes
* Students cannot access admin APIs
* Admins cannot access student APIs

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
* refreshToken

### Books

Stores book information.

Fields:

* bookId
* bookName
* author
* category
* bookDescription

### BookCopies

Stores physical book copies and QR values.

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

### ActivityLogs

Stores backend activity logs.

Fields:

* logId
* loginId
* userId
* actionType
* description
* createdAt

---

## API Modules

### Auth Routes

```text
POST /api/auth/login
GET  /api/auth/current-user
POST /api/auth/logout
```

### Student Routes

```text
GET  /api/student/student-dashboard-data
GET  /api/student/borrowedBooks
GET  /api/student/borrowedBooksHistory
GET  /api/student/over-due-books
GET  /api/student/suggest-books
POST /api/student/borrow
POST /api/student/returnBook
```

### Book Routes

```text
GET /api/books/books
```

### Admin Routes

```text
- GET /api/admin/admin-dashboard-data
- GET /api/admin/transactions-data
- GET /api/admin/admin-book-details
- GET /api/admin/admin-book-copies-details
- GET /api/admin/admin-records
- POST /api/admin/add-book
- POST /api/admin/add-book-copy
- POST /api/admin/update-book-info
- POST /api/admin/delete-book
- POST /api/admin/delete-book-copy

```

---

## Business Rules

### Borrowing Rules

* Student must exist
* Book copy must exist
* Book copy must be available
* Student cannot borrow more than 3 books
* Duplicate active borrowing is not allowed
* Transaction record is created after successful borrowing
* Book copy status changes to issued after borrowing

### Return Rules

* Transaction must exist
* Transaction must belong to the authenticated user
* Book must currently be issued
* Return date is automatically stored
* Book copy availability is restored after return
* Book status changes from ISSUED to RETURNED
* Fine is calculated if the return is late

### Fine Rules

* Fine is only applied when a book is returned after the due date
* Fine Rate = Rs. 20 per day
* Fine Amount = Days Late × 20
* Fine amount is stored in the transaction record
* Fine amount is shown in student return response and admin reports

### Overdue Rules

A book is considered overdue when:

```text
book_status = ISSUED
returnDate = NULL
dueDate < Current Date
```

### Recommendation Rules

* Recommendations are generated using previously borrowed categories
* Similar category books are recommended
* Most borrowed books are also included
* Currently borrowed books are excluded from recommendations
* Duplicate recommendations are removed

### Safe Delete Rules

#### Book Deletion

* A book cannot be deleted if any of its copies are currently issued
* If deletion is allowed, related unused book copies are deleted first
* Then the main book record is deleted

#### Book Copy Deletion

* A book copy cannot be deleted if it is currently issued
* A book copy cannot be deleted if it exists in transaction history
* Only unused copies with no transaction history can be deleted

---

## Assignment 1 Features

Implemented:

* Authentication
* Book Search
* QR Borrowing
* Student Dashboard
* Admin Dashboard
* Transaction Management
* My Books
* Borrowing History
* Books View
* Book Copies View

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

## Additional Enhancements

Implemented:

* Password Hashing with bcryptjs
* JWT Authentication
* Access Token and Refresh Token Generation
* HTTP Only Cookie Authentication
* Refresh Token Storage in Database
* Secure Logout
* JWT Verification Middleware
* Student Role Middleware
* Admin Role Middleware
* Activity Logging
* Recommendation Engine
* Admin Add Book API
* Admin Edit Book API
* Admin Delete Book API
* Admin Add Book Copy API
* Admin Delete Book Copy API
* Duplicate Copy Code Validation
* Duplicate QR Code Validation
* Safe Delete Validation

---

## Activity Logging

The backend records important system events:

* Successful Login
* Failed Login Attempt
* Book Issue
* Book Return
* Fine Generation

These logs are shown in the admin reports section.

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

For development with nodemon, if configured:

```bash
npm run dev
```

---

## Environment Variables

Create a `.env` file:

```env
PORT=8000
ACCESS_TOKEN_SECRET=your_access_token_secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRY=1y
```

---

## API Capabilities

### Student Module

* Login
* Logout
* View Current User
* View Dashboard
* Search Books
* Borrow Books
* Return Books
* View Borrowed Books
* View History
* View Overdue Warnings
* View Recommendations

### Admin Module

* Dashboard Analytics
* Books Management
* Book Copies Management
* Transactions Monitoring
* Reports Management
* Defaulters Monitoring
* Fine Monitoring
* Activity Logs Monitoring

---

## Testing Summary

The following backend workflows have been tested:

* Login
* Logout
* Password hash comparison
* JWT token generation
* JWT verification
* Student role protection
* Admin role protection
* QR based borrowing
* QR based return
* Fine calculation
* Overdue detection
* Recommendation API
* Activity logs insertion
* Admin dashboard data
* Admin reports data
* Add book
* Edit book
* Delete book
* Add book copy
* Delete book copy
* Duplicate copy validation
* Safe delete validation

---

## Authors

Muhammad Fuzail Ahmed

Roll No: 2024F-BCS-069

Section: A

DBMS PBL Project

QR Based Smart Library Borrowing System
