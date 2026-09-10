-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 10, 2026 at 09:11 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `librarydb`
--

-- --------------------------------------------------------

--
-- Table structure for table `authors`
--

CREATE TABLE `authors` (
  `author_id` int(11) NOT NULL,
  `author_name` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `authors`
--

INSERT INTO `authors` (`author_id`, `author_name`) VALUES
(1, 'Jose Rizal'),
(2, 'Bob Ong'),
(3, 'F. Sionil Jose'),
(4, 'Nick Joaquin'),
(5, 'J.K. Rowling'),
(6, 'Isaac Asimov'),
(7, 'Neil Gaiman'),
(8, 'Yuval Noah Harari');

-- --------------------------------------------------------

--
-- Table structure for table `books`
--

CREATE TABLE `books` (
  `book_id` int(11) NOT NULL,
  `category_id` int(11) DEFAULT NULL,
  `genre_id` int(11) DEFAULT NULL,
  `book_title` varchar(100) DEFAULT NULL,
  `publisher_id` int(11) DEFAULT NULL,
  `shelf_location` varchar(50) DEFAULT NULL,
  `added_by` int(11) DEFAULT NULL,
  `added_at` datetime DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `books`
--

INSERT INTO `books` (`book_id`, `category_id`, `genre_id`, `book_title`, `publisher_id`, `shelf_location`, `added_by`, `added_at`, `is_active`) VALUES
(1, 2, 3, 'Noli Me Tangere', 1, 'A1-01', 1, '2026-09-10 00:51:04', 1),
(2, 2, 3, 'El Filibusterismo', 1, 'A1-02', 1, '2026-09-10 00:51:04', 1),
(3, 2, 3, 'ABNKKBSNPLAko?!', 3, 'A1-03', 1, '2026-09-10 00:51:04', 1),
(4, 2, 6, 'Foundation', 5, 'B2-01', 1, '2026-09-10 00:51:04', 1),
(5, 2, 5, 'Harry Potter and the Sorcerer\'s Stone', 5, 'B2-02', 1, '2026-09-10 00:51:04', 1),
(6, 1, 8, 'Sapiens: A Brief History of Humankind', 2, 'C3-01', 1, '2026-09-10 00:51:04', 1),
(7, 1, 2, 'Philippine History and Government', 4, 'C3-02', 1, '2026-09-10 00:51:04', 1),
(8, 1, 1, 'Introduction to Computer Science', 6, 'C3-03', 1, '2026-09-10 00:51:04', 1);

-- --------------------------------------------------------

--
-- Table structure for table `book_authors`
--

CREATE TABLE `book_authors` (
  `authors_list_id` int(11) NOT NULL,
  `book_id` int(11) DEFAULT NULL,
  `author_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `book_authors`
--

INSERT INTO `book_authors` (`authors_list_id`, `book_id`, `author_id`) VALUES
(1, 1, 1),
(2, 2, 1),
(3, 3, 2),
(4, 4, 6),
(5, 5, 5),
(6, 6, 8),
(7, 7, 3),
(8, 7, 4);

-- --------------------------------------------------------

--
-- Table structure for table `book_copies`
--

CREATE TABLE `book_copies` (
  `copy_id` int(11) NOT NULL,
  `book_id` int(11) DEFAULT NULL,
  `accession_number` int(11) DEFAULT NULL,
  `status_id` int(11) DEFAULT NULL,
  `condition_id` int(11) DEFAULT NULL,
  `condition_notes` varchar(100) DEFAULT NULL,
  `added_by` int(11) DEFAULT NULL,
  `added_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `book_copies`
--

INSERT INTO `book_copies` (`copy_id`, `book_id`, `accession_number`, `status_id`, `condition_id`, `condition_notes`, `added_by`, `added_at`) VALUES
(1, 1, 1001, 1, 1, NULL, 1, '2026-09-10 00:51:04'),
(2, 1, 1002, 1, 2, 'slightly worn cover', 1, '2026-09-10 00:51:04'),
(3, 2, 1003, 1, 1, NULL, 1, '2026-09-10 00:51:04'),
(4, 3, 1004, 2, 1, NULL, 1, '2026-09-10 00:51:04'),
(5, 4, 1005, 1, 1, NULL, 1, '2026-09-10 00:51:04'),
(6, 5, 1006, 1, 1, NULL, 1, '2026-09-10 00:51:04'),
(7, 5, 1007, 2, 2, 'loose spine', 1, '2026-09-10 00:51:04'),
(8, 6, 1008, 1, 1, NULL, 1, '2026-09-10 00:51:04'),
(9, 7, 1009, 1, 1, NULL, 1, '2026-09-10 00:51:04'),
(10, 8, 1010, 1, 1, NULL, 1, '2026-09-10 00:51:04');

-- --------------------------------------------------------

--
-- Table structure for table `borrow_items`
--

CREATE TABLE `borrow_items` (
  `borrow_item_id` int(11) NOT NULL,
  `transaction_id` int(11) DEFAULT NULL,
  `copy_id` int(11) DEFAULT NULL,
  `expires_at` datetime DEFAULT NULL,
  `is_returned` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `borrow_transactions`
--

CREATE TABLE `borrow_transactions` (
  `transaction_id` int(11) NOT NULL,
  `borrower_id` int(11) DEFAULT NULL,
  `processed_by` int(11) DEFAULT NULL,
  `borrowed_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `category_id` int(11) NOT NULL,
  `category_type` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`category_id`, `category_type`) VALUES
(1, 'Educational'),
(2, 'Fiction');

-- --------------------------------------------------------

--
-- Table structure for table `conditions`
--

CREATE TABLE `conditions` (
  `condition_id` int(11) NOT NULL,
  `condition_desc` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `conditions`
--

INSERT INTO `conditions` (`condition_id`, `condition_desc`) VALUES
(1, 'Good'),
(2, 'Fair'),
(3, 'Damaged'),
(4, 'Lost');

-- --------------------------------------------------------

--
-- Table structure for table `departments`
--

CREATE TABLE `departments` (
  `department_id` int(11) NOT NULL,
  `department_name` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `departments`
--

INSERT INTO `departments` (`department_id`, `department_name`) VALUES
(1, 'CITE'),
(2, 'COED'),
(3, 'CMA'),
(4, 'CEA'),
(5, 'CAHS'),
(6, 'SCCJ'),
(7, 'CAS');

-- --------------------------------------------------------

--
-- Table structure for table `disposal_reasons`
--

CREATE TABLE `disposal_reasons` (
  `reason_id` int(11) NOT NULL,
  `reason_desc` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `disposal_reasons`
--

INSERT INTO `disposal_reasons` (`reason_id`, `reason_desc`) VALUES
(1, 'Damaged beyond repair'),
(2, 'Lost'),
(3, 'Donated out'),
(4, 'Outdated edition');

-- --------------------------------------------------------

--
-- Table structure for table `disposal_records`
--

CREATE TABLE `disposal_records` (
  `disposal_id` int(11) NOT NULL,
  `copy_id` int(11) DEFAULT NULL,
  `reason_id` int(11) DEFAULT NULL,
  `disposed_by` int(11) DEFAULT NULL,
  `disposed_at` datetime DEFAULT NULL,
  `remarks` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `fine_records`
--

CREATE TABLE `fine_records` (
  `fine_id` int(11) NOT NULL,
  `borrow_item_id` int(11) DEFAULT NULL,
  `days_late` int(11) DEFAULT NULL,
  `fine_amount` decimal(10,2) DEFAULT NULL,
  `is_paid` tinyint(1) DEFAULT 0,
  `paid_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `genres`
--

CREATE TABLE `genres` (
  `genre_id` int(11) NOT NULL,
  `genre_name` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `genres`
--

INSERT INTO `genres` (`genre_id`, `genre_name`) VALUES
(1, 'Science'),
(2, 'History'),
(3, 'Novel'),
(4, 'Reference'),
(5, 'Fantasy'),
(6, 'Mystery'),
(7, 'Biography'),
(8, 'Technology');

-- --------------------------------------------------------

--
-- Table structure for table `publishers`
--

CREATE TABLE `publishers` (
  `publisher_id` int(11) NOT NULL,
  `publisher_name` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `publishers`
--

INSERT INTO `publishers` (`publisher_id`, `publisher_name`) VALUES
(1, 'Rex Book Store'),
(2, 'Anvil Publishing'),
(3, 'Adarna House'),
(4, 'Vibal Group'),
(5, 'Penguin Random House'),
(6, 'Pearson Education');

-- --------------------------------------------------------

--
-- Table structure for table `renewal_records`
--

CREATE TABLE `renewal_records` (
  `renewal_record_id` int(11) NOT NULL,
  `borrow_item_id` int(11) DEFAULT NULL,
  `old_due_date` datetime DEFAULT NULL,
  `new_due_date` datetime DEFAULT NULL,
  `renewed_at` datetime DEFAULT NULL,
  `renewed_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `return_items`
--

CREATE TABLE `return_items` (
  `return_item_id` int(11) NOT NULL,
  `return_transaction_id` int(11) DEFAULT NULL,
  `borrow_item_id` int(11) DEFAULT NULL,
  `condition_on_return` int(11) DEFAULT NULL,
  `condition_notes` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `return_transactions`
--

CREATE TABLE `return_transactions` (
  `return_transaction_id` int(11) NOT NULL,
  `received_by` int(11) DEFAULT NULL,
  `returned_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `role_id` int(11) NOT NULL,
  `role_type` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`role_id`, `role_type`) VALUES
(1, 'Head Librarian'),
(2, 'Student Assistant'),
(3, 'Student'),
(4, 'Faculty');

-- --------------------------------------------------------

--
-- Table structure for table `statuses`
--

CREATE TABLE `statuses` (
  `status_id` int(11) NOT NULL,
  `status_desc` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `statuses`
--

INSERT INTO `statuses` (`status_id`, `status_desc`) VALUES
(1, 'Available'),
(2, 'Borrowed'),
(3, 'Disposed');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `role_id` int(11) DEFAULT NULL,
  `id_number` varchar(20) DEFAULT NULL,
  `last_name` varchar(50) DEFAULT NULL,
  `first_name` varchar(50) DEFAULT NULL,
  `contact_number` varchar(20) DEFAULT NULL,
  `email_address` varchar(50) DEFAULT NULL,
  `username` varchar(20) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `department_id` int(11) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `role_id`, `id_number`, `last_name`, `first_name`, `contact_number`, `email_address`, `username`, `password`, `department_id`, `is_active`) VALUES
(1, 2, '02-2223-00058', 'Halibas', 'Paul Angelo', '09454658987', 'ulti.halibas.coc@phinmaed.com', 'beefslapkw', '$2y$10$evN5n8zRWyVGkTuxm/z5V.q9oT7Etd70P/X/bqXaTUJmHtGH9/xRa', 1, 1),
(2, 4, 'F02-2222-2222', 'faculty', 'test', '09123456789', 'testfaculty@gmail.com', 'faculty', '$2y$10$wfQ5LAWwVqysPfksjY30ZOABCLxcLm/Kxm89WLQto/Zc0iYQI3sq.', 2, 0),
(3, 1, '02-9999-9999', 'Batolata', 'Pitok', '09999999999', 'pitokbatolata@gmail.com', 'pitok', '$2y$10$4H/thW7g7POk01ODLRX5WOGd9h7nyQiI39hZN341nH1WxLJ5ju7gG', 1, 1),
(4, 4, 'test2', 'test2', 'test2', 'test2', 'test2@gmail.com', 'test2', '$2y$10$Y/xGYkD3LOpzm6sXVjL9R.ISxNe0TNfd/I422mcPjiS/K7FbdOX1i', 5, 1),
(5, 1, 'H02-2224-00059', 'librarian', 'head', '0942353249', 'headlibrariantest@gmail.com', 'head', '$2y$10$3xQ9fQ.xfmo6xxKhrNX1ee/1P/MKYqxclj5Te8ayLYDurcBXllkpm', 7, 1),
(6, 2, '02-9999-9988', 'anothertest1', 'anothertest1', '092350932', 'anothertest@gmail.com', 'anothertest', '$2y$10$KfTJfyAqDF7BqF4WR10IteBvy.gtli2Z9wZWDvkfKsE00ydLlAqhO', 1, 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `authors`
--
ALTER TABLE `authors`
  ADD PRIMARY KEY (`author_id`);

--
-- Indexes for table `books`
--
ALTER TABLE `books`
  ADD PRIMARY KEY (`book_id`),
  ADD KEY `category_id` (`category_id`),
  ADD KEY `genre_id` (`genre_id`),
  ADD KEY `publisher_id` (`publisher_id`),
  ADD KEY `added_by` (`added_by`);

--
-- Indexes for table `book_authors`
--
ALTER TABLE `book_authors`
  ADD PRIMARY KEY (`authors_list_id`),
  ADD UNIQUE KEY `book_id` (`book_id`,`author_id`),
  ADD KEY `author_id` (`author_id`) USING BTREE;

--
-- Indexes for table `book_copies`
--
ALTER TABLE `book_copies`
  ADD PRIMARY KEY (`copy_id`),
  ADD UNIQUE KEY `accession_number` (`accession_number`),
  ADD KEY `book_id` (`book_id`),
  ADD KEY `status_id` (`status_id`),
  ADD KEY `condition_id` (`condition_id`),
  ADD KEY `added_by` (`added_by`);

--
-- Indexes for table `borrow_items`
--
ALTER TABLE `borrow_items`
  ADD PRIMARY KEY (`borrow_item_id`),
  ADD KEY `transaction_id` (`transaction_id`),
  ADD KEY `copy_id` (`copy_id`);

--
-- Indexes for table `borrow_transactions`
--
ALTER TABLE `borrow_transactions`
  ADD PRIMARY KEY (`transaction_id`),
  ADD KEY `borrower_id` (`borrower_id`),
  ADD KEY `processed_by` (`processed_by`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`category_id`);

--
-- Indexes for table `conditions`
--
ALTER TABLE `conditions`
  ADD PRIMARY KEY (`condition_id`);

--
-- Indexes for table `departments`
--
ALTER TABLE `departments`
  ADD PRIMARY KEY (`department_id`);

--
-- Indexes for table `disposal_reasons`
--
ALTER TABLE `disposal_reasons`
  ADD PRIMARY KEY (`reason_id`);

--
-- Indexes for table `disposal_records`
--
ALTER TABLE `disposal_records`
  ADD PRIMARY KEY (`disposal_id`),
  ADD UNIQUE KEY `copy_id` (`copy_id`),
  ADD KEY `reason_id` (`reason_id`),
  ADD KEY `disposed_by` (`disposed_by`);

--
-- Indexes for table `fine_records`
--
ALTER TABLE `fine_records`
  ADD PRIMARY KEY (`fine_id`),
  ADD KEY `borrow_item_id` (`borrow_item_id`);

--
-- Indexes for table `genres`
--
ALTER TABLE `genres`
  ADD PRIMARY KEY (`genre_id`);

--
-- Indexes for table `publishers`
--
ALTER TABLE `publishers`
  ADD PRIMARY KEY (`publisher_id`);

--
-- Indexes for table `renewal_records`
--
ALTER TABLE `renewal_records`
  ADD PRIMARY KEY (`renewal_record_id`),
  ADD KEY `borrow_item_id` (`borrow_item_id`),
  ADD KEY `renewed_by` (`renewed_by`);

--
-- Indexes for table `return_items`
--
ALTER TABLE `return_items`
  ADD PRIMARY KEY (`return_item_id`),
  ADD UNIQUE KEY `borrow_item_id` (`borrow_item_id`),
  ADD KEY `return_transaction_id` (`return_transaction_id`),
  ADD KEY `condition_on_return` (`condition_on_return`);

--
-- Indexes for table `return_transactions`
--
ALTER TABLE `return_transactions`
  ADD PRIMARY KEY (`return_transaction_id`),
  ADD KEY `received_by` (`received_by`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`role_id`);

--
-- Indexes for table `statuses`
--
ALTER TABLE `statuses`
  ADD PRIMARY KEY (`status_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD KEY `role_id` (`role_id`),
  ADD KEY `department_id` (`department_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `authors`
--
ALTER TABLE `authors`
  MODIFY `author_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `books`
--
ALTER TABLE `books`
  MODIFY `book_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `book_authors`
--
ALTER TABLE `book_authors`
  MODIFY `authors_list_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `book_copies`
--
ALTER TABLE `book_copies`
  MODIFY `copy_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `borrow_items`
--
ALTER TABLE `borrow_items`
  MODIFY `borrow_item_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `borrow_transactions`
--
ALTER TABLE `borrow_transactions`
  MODIFY `transaction_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `category_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `conditions`
--
ALTER TABLE `conditions`
  MODIFY `condition_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `departments`
--
ALTER TABLE `departments`
  MODIFY `department_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `disposal_reasons`
--
ALTER TABLE `disposal_reasons`
  MODIFY `reason_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `disposal_records`
--
ALTER TABLE `disposal_records`
  MODIFY `disposal_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `fine_records`
--
ALTER TABLE `fine_records`
  MODIFY `fine_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `genres`
--
ALTER TABLE `genres`
  MODIFY `genre_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `publishers`
--
ALTER TABLE `publishers`
  MODIFY `publisher_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `renewal_records`
--
ALTER TABLE `renewal_records`
  MODIFY `renewal_record_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `return_items`
--
ALTER TABLE `return_items`
  MODIFY `return_item_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `return_transactions`
--
ALTER TABLE `return_transactions`
  MODIFY `return_transaction_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `role_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `statuses`
--
ALTER TABLE `statuses`
  MODIFY `status_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `books`
--
ALTER TABLE `books`
  ADD CONSTRAINT `books_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`),
  ADD CONSTRAINT `books_ibfk_2` FOREIGN KEY (`genre_id`) REFERENCES `genres` (`genre_id`),
  ADD CONSTRAINT `books_ibfk_3` FOREIGN KEY (`publisher_id`) REFERENCES `publishers` (`publisher_id`),
  ADD CONSTRAINT `books_ibfk_4` FOREIGN KEY (`added_by`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `book_authors`
--
ALTER TABLE `book_authors`
  ADD CONSTRAINT `book_authors_ibfk_1` FOREIGN KEY (`book_id`) REFERENCES `books` (`book_id`),
  ADD CONSTRAINT `book_authors_ibfk_2` FOREIGN KEY (`author_id`) REFERENCES `authors` (`author_id`);

--
-- Constraints for table `book_copies`
--
ALTER TABLE `book_copies`
  ADD CONSTRAINT `book_copies_ibfk_1` FOREIGN KEY (`book_id`) REFERENCES `books` (`book_id`),
  ADD CONSTRAINT `book_copies_ibfk_2` FOREIGN KEY (`status_id`) REFERENCES `statuses` (`status_id`),
  ADD CONSTRAINT `book_copies_ibfk_3` FOREIGN KEY (`condition_id`) REFERENCES `conditions` (`condition_id`),
  ADD CONSTRAINT `book_copies_ibfk_4` FOREIGN KEY (`added_by`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `borrow_items`
--
ALTER TABLE `borrow_items`
  ADD CONSTRAINT `borrow_items_ibfk_1` FOREIGN KEY (`transaction_id`) REFERENCES `borrow_transactions` (`transaction_id`),
  ADD CONSTRAINT `borrow_items_ibfk_2` FOREIGN KEY (`copy_id`) REFERENCES `book_copies` (`copy_id`);

--
-- Constraints for table `borrow_transactions`
--
ALTER TABLE `borrow_transactions`
  ADD CONSTRAINT `borrow_transactions_ibfk_1` FOREIGN KEY (`borrower_id`) REFERENCES `users` (`user_id`),
  ADD CONSTRAINT `borrow_transactions_ibfk_2` FOREIGN KEY (`processed_by`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `disposal_records`
--
ALTER TABLE `disposal_records`
  ADD CONSTRAINT `disposal_records_ibfk_1` FOREIGN KEY (`copy_id`) REFERENCES `book_copies` (`copy_id`),
  ADD CONSTRAINT `disposal_records_ibfk_2` FOREIGN KEY (`reason_id`) REFERENCES `disposal_reasons` (`reason_id`),
  ADD CONSTRAINT `disposal_records_ibfk_3` FOREIGN KEY (`disposed_by`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `fine_records`
--
ALTER TABLE `fine_records`
  ADD CONSTRAINT `fine_records_ibfk_1` FOREIGN KEY (`borrow_item_id`) REFERENCES `borrow_items` (`borrow_item_id`);

--
-- Constraints for table `renewal_records`
--
ALTER TABLE `renewal_records`
  ADD CONSTRAINT `renewal_records_ibfk_1` FOREIGN KEY (`borrow_item_id`) REFERENCES `borrow_items` (`borrow_item_id`),
  ADD CONSTRAINT `renewal_records_ibfk_2` FOREIGN KEY (`renewed_by`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `return_items`
--
ALTER TABLE `return_items`
  ADD CONSTRAINT `return_items_ibfk_1` FOREIGN KEY (`return_transaction_id`) REFERENCES `return_transactions` (`return_transaction_id`),
  ADD CONSTRAINT `return_items_ibfk_2` FOREIGN KEY (`borrow_item_id`) REFERENCES `borrow_items` (`borrow_item_id`),
  ADD CONSTRAINT `return_items_ibfk_3` FOREIGN KEY (`condition_on_return`) REFERENCES `conditions` (`condition_id`);

--
-- Constraints for table `return_transactions`
--
ALTER TABLE `return_transactions`
  ADD CONSTRAINT `return_transactions_ibfk_1` FOREIGN KEY (`received_by`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`),
  ADD CONSTRAINT `users_ibfk_2` FOREIGN KEY (`department_id`) REFERENCES `departments` (`department_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
