# Library Management System (LMS)

A web-based library management system for a school library. It handles cataloging, multi-book borrow and return transactions, renewals, reservations, fines, and role-based access for library staff, students, and faculty.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [User Roles & Permissions](#user-roles--permissions)
- [Business Rules](#business-rules)
- [Reservations](#reservations)
- [Database Overview](#database-overview)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [Authentication & Authorization](#authentication--authorization)
- [Design Decisions](#design-decisions)
- [Author](#author)

## Features

- **Catalog management** - title-level Books separated from physical Book Copies (accession number, shelf location, status)
- **Lookup/master tables** - Authors, Publishers, Categories, Genres, Conditions, Statuses, Disposal Reasons
- **Borrow & return transactions** - multiple books per transaction, with per-item return tracking and condition on return
- **Renewals** - blocked while the borrower has unpaid fines
- **Reservations** - students and faculty can reserve available copies and cancel them; staff fulfill a reservation through the normal borrow procedure, and only the reserver can borrow the reserved copy (see [Reservations](#reservations))
- **Fines** - automatic computation for overdue items, with payment recording
- **Disposal records** - permanent write-off of library property (Head Librarian only)
- **User management** - create accounts, assign roles, deactivate accounts
- **Reports** - fines collected, overdue items, and more
- **Server-side pagination** - 10 records per page on the books and book copies lists
- **Role-based dashboards** - separate interfaces for Head Librarian, Student Assistant, Student, and Faculty

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | PHP |
| Frontend | HTML, Vanilla JavaScript |
| HTTP client | [Axios](https://axios-http.com/) |
| UI framework | [Bootstrap](https://getbootstrap.com/) |
| Alerts | [SweetAlert2](https://sweetalert2.github.io/) |
| Database | MySQL / MariaDB |

## User Roles & Permissions

### Head Librarian - full control (admin)

- Full CRUD on all lookup/master tables (Books, Authors, Publishers, Categories, Genres, Conditions, Statuses, Disposal Reasons)
- Add, edit, and deactivate Book Copies, including Disposal Records
- Process borrow/return transactions
- Fulfill reservations as borrow transactions
- Approve renewals; view and manage fine records
- Manage users: create accounts, assign roles, deactivate accounts
- View reports

### Student Assistant - front-desk operations, no structural changes

- Full CRUD on Books, Book Copies, Authors, and Publishers
- Process borrow/return transactions
- Fulfill reservations as borrow transactions
- Record fine payments
- Process renewals
- **Cannot:** manage users, delete/deactivate other accounts, or touch Disposal Records

### Student - self-service, read-only

- View own borrow history and currently borrowed items
- View own fine balance and payment status
- Search the book catalog by availability
- Reserve copies and cancel their own reservations
- **Cannot:** edit any lookup table, process transactions, or see other students' records

### Faculty - same permissions as Student

Faculty has the same self-service permissions as Student, including making and cancelling reservations. The only difference is in the borrowing business rules (see below), which are enforced in the borrow-transaction validation rather than through role permissions.

## Business Rules

| Rule | Student | Faculty |
|------|---------|---------|
| Max books per borrow | 3 | 10 |
| Loan period | Based on category (`borrow_duration`), e.g. 3 days for educational and 7 days for fiction | Semester-long (3 months) |
| Fine | 5 PHP per day overdue | 5 PHP per day overdue |

- Fines are paid in full on return; partial payments are not supported.
- Renewals require all unpaid fines to be settled first.
- Loan and renewal periods come from the `borrow_duration` column (in days) on the `categories` table.
- Reserved copies are blocked from regular borrowing by a "Reserved" status.
- Only librarians add books to the catalog.

## Reservations

Students and faculty can reserve a book copy ahead of time. Reservations follow the same procedure as a regular borrow, so the usual borrowing rules and validation still apply.

### How it works

1. **Reserve** - a student or faculty member picks an available copy from the catalog and reserves it. The copy's status changes to **Reserved**, which blocks anyone else from borrowing it.
2. **Hold period** - each reservation has an expiry date (`expires_at`). If it isn't picked up in time, the reservation expires and the copy becomes available again.
3. **Cancel** - the reserver can cancel their own reservation before it is fulfilled, which releases the copy.
4. **Fulfill** - when the reserver comes to the library, the Head Librarian or Student Assistant processes it as a normal borrow transaction. The resulting borrow item is linked back to the reservation item (`borrow_item_id`).
5. **Borrow rules apply** - the borrower's limit (3 books for students, 10 for faculty), loan period, and unpaid-fine checks are validated as usual.

### Who can do what

| Action | Student / Faculty | Student Assistant | Head Librarian |
|--------|:-----------------:|:-----------------:|:--------------:|
| Make a reservation | Yes (own) | No | No |
| Cancel a reservation | Yes (own) | Yes | Yes |
| Fulfill a reservation (borrow) | No | Yes | Yes |

Only the reserver can borrow a reserved copy.

### Data model

- **Reservation_Transactions** - `borrower_id`, `reserved_at`, `expires_at`
- **Reservation_Items** - `copy_id`, `reservation_status_id`, nullable `borrow_item_id`
- **Reservation_Statuses** - lookup table for the reservation lifecycle

## Database Overview

Main entities:

- **Users / Roles / Departments**
- **Books** (title-level) and **Book_Copies** (physical copies)
- **Categories, Genres, Authors, Publishers, Conditions, Statuses, Disposal Reasons**
- **Borrow_Transactions** (header) and **Borrow_Items** (line items)
- **Return_Transactions** (header) and **Return_Items** (line items)
- **Renewal_Records** and **Fine_Records**, both keyed to `borrow_item_id`
- **Reservation_Transactions** and **Reservation_Items**, plus a **Reservation_Statuses** lookup
- **Disposal_Records**

> Add your ERD image here, for example: `![ERD](docs/erd.png)`

## Project Structure

> Adjust this to match your actual folders and files.

```
lms/
├── api/                    # PHP API endpoints (books.php, bookcopies.php, ...)
├── config/                 # Database connection and shared config
├── js/                     # Vanilla JS (headLibrarian.js, auth-guard.js, ...)
├── css/                    # Custom styles
├── database/               # SQL schema and seed data
├── index.html              # Login page
├── headLibrarian.html      # Head Librarian dashboard
├── studentAssistant.html   # Student Assistant dashboard
├── student.html            # Student dashboard
├── faculty.html            # Faculty dashboard
└── README.md
```

## Getting Started

### Prerequisites

- PHP 8.0 or higher
- MySQL or MariaDB
- A local server stack such as XAMPP, WAMP, or Laragon (or Apache/Nginx with PHP)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/<your-username>/<your-repo>.git
   ```

2. **Move the project into your server's web root**

   - XAMPP: `C:\xampp\htdocs\lms`
   - Laragon: `C:\laragon\www\lms`

3. **Create the database**

   - Open phpMyAdmin (or your MySQL client)
   - Create a database, e.g. `lms_db`
   - Import the SQL file from `database/`

4. **Configure the database connection**

   Update the credentials in your PHP config file (see [Configuration](#configuration)).

5. **Run the app**

   Start Apache and MySQL, then open:

   ```
   http://localhost/lms/
   ```

### Default Accounts

> Replace with your seeded accounts, and change the passwords before any real deployment.

| Role | Username | Password |
|------|----------|----------|
| Head Librarian | `<username>` | `<password>` |
| Student Assistant | `<username>` | `<password>` |
| Student | `<username>` | `<password>` |
| Faculty | `<username>` | `<password>` |

## Configuration

Database settings (example):

```php
<?php
$host = "localhost";
$db   = "lms_db";
$user = "root";
$pass = "";
```

The frontend builds its API base URL from `location.origin`, so it works on `localhost`, over a local network, or when deployed online without code changes.

## Authentication & Authorization

- **Server-side PHP sessions** handle login state.
- Every API file performs its own **role-based access check**, so permissions are enforced on the server, not just hidden in the UI.
- `auth-guard.js` redirects users away from pages that don't match their role.
- Page templates (`headLibrarian`, `studentAssistant`, `student`, `faculty`, `index`) are plain `.html` files; the `api/` files are `.php`.

## Design Decisions

- **No delete function for transaction-related tables** - this preserves historical accuracy.
- **`ON DELETE RESTRICT`** foreign keys, with **`is_active` soft-delete flags** on lookup tables instead of cascading deletes.
- **Header/line-item split** for borrows, returns, and reservations, so one transaction can include multiple books.
- **Business rules live in validation logic**, not in role permissions (for example, the Student vs Faculty borrow limits).

## Author

**Paul** - B.S. Information Technology, PHINMA Cagayan de Oro College

---

*Developed as a school library management system project.*
