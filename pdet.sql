-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 12, 2026 at 10:42 PM
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
-- Database: `pdet`
--

-- --------------------------------------------------------

--
-- Table structure for table `addresses`
--

CREATE TABLE `addresses` (
  `id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `full_name` varchar(150) NOT NULL,
  `mobile` varchar(15) NOT NULL,
  `address_line1` varchar(255) NOT NULL,
  `address_line2` varchar(255) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `pincode` varchar(10) DEFAULT NULL,
  `landmark` varchar(150) DEFAULT NULL,
  `is_default` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `addresses`
--

INSERT INTO `addresses` (`id`, `user_id`, `full_name`, `mobile`, `address_line1`, `address_line2`, `city`, `state`, `pincode`, `landmark`, `is_default`, `created_at`, `updated_at`) VALUES
(3, 2, 'nab', '9820868352', 'chabdres god 12 dlat vit', NULL, 'dombivali', 'magastra', '421021', NULL, 0, '2026-10-10 06:23:31', '2026-10-10 06:23:31');

-- --------------------------------------------------------

--
-- Table structure for table `carts`
--

CREATE TABLE `carts` (
  `id` int(11) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `carts`
--

INSERT INTO `carts` (`id`, `user_id`, `created_at`, `updated_at`) VALUES
(5, 2, '2026-10-12 11:21:12', '2026-10-12 11:21:12');

-- --------------------------------------------------------

--
-- Table structure for table `cart_items`
--

CREATE TABLE `cart_items` (
  `id` int(11) NOT NULL,
  `cart_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `drive_id` int(11) NOT NULL,
  `product_name` varchar(255) NOT NULL,
  `product_image` text DEFAULT NULL,
  `drive_title` varchar(255) DEFAULT NULL,
  `price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` bigint(20) NOT NULL,
  `name` varchar(100) NOT NULL,
  `image` varchar(500) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`, `image`, `is_active`, `created_at`, `updated_at`) VALUES
(12, 'Electronics', 'Electronics', 0, '2026-10-12 09:59:55', '2026-10-12 09:59:55');

-- --------------------------------------------------------

--
-- Table structure for table `drives`
--

CREATE TABLE `drives` (
  `id` bigint(20) NOT NULL,
  `vendor_id` bigint(20) NOT NULL,
  `product_id` bigint(20) NOT NULL,
  `title` varchar(255) NOT NULL,
  `start_date` datetime NOT NULL,
  `end_date` datetime NOT NULL,
  `minimum_participants` int(11) NOT NULL DEFAULT 1,
  `maximum_participants` int(11) DEFAULT NULL,
  `current_participants` int(11) NOT NULL DEFAULT 0,
  `status` enum('DRAFT','ACTIVE','ENDED','SETTLED','CANCELLED') DEFAULT 'DRAFT',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `drives`
--

INSERT INTO `drives` (`id`, `vendor_id`, `product_id`, `title`, `start_date`, `end_date`, `minimum_participants`, `maximum_participants`, `current_participants`, `status`, `created_at`, `updated_at`) VALUES
(26, 2, 75, 'boAt Rockerz 113 Drive', '2026-10-12 12:39:54', '2026-11-12 16:09:55', 1, 6, 0, 'ACTIVE', '2026-10-12 10:40:41', '2026-10-12 10:40:41');

-- --------------------------------------------------------

--
-- Table structure for table `drive_price_tiers`
--

CREATE TABLE `drive_price_tiers` (
  `id` bigint(20) NOT NULL,
  `drive_id` bigint(20) NOT NULL,
  `minimum_participants` int(11) NOT NULL,
  `price` decimal(12,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `drive_price_tiers`
--

INSERT INTO `drive_price_tiers` (`id`, `drive_id`, `minimum_participants`, `price`, `created_at`, `updated_at`) VALUES
(104, 26, 1, 699.00, '2026-10-12 11:17:58', '2026-10-12 11:17:58'),
(105, 26, 2, 650.00, '2026-10-12 11:18:21', '2026-10-12 11:18:21'),
(106, 26, 4, 600.00, '2026-10-12 11:18:45', '2026-10-12 11:18:45'),
(107, 26, 6, 550.00, '2026-10-12 11:19:01', '2026-10-12 11:19:01');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` bigint(20) NOT NULL,
  `order_number` varchar(50) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `address_id` bigint(20) NOT NULL,
  `order_type` enum('NORMAL','DRIVE') DEFAULT 'NORMAL',
  `original_amount` decimal(12,2) NOT NULL,
  `final_amount` decimal(12,2) DEFAULT NULL,
  `drive_saving` decimal(12,2) DEFAULT 0.00,
  `delivery_charge` decimal(12,2) DEFAULT 0.00,
  `total_amount` decimal(12,2) NOT NULL,
  `payment_method` enum('ONLINE','COD') NOT NULL DEFAULT 'ONLINE',
  `payment_status` enum('PENDING','PAID','FAILED','REFUNDED') NOT NULL DEFAULT 'PENDING',
  `status` enum('PENDING','CONFIRMED','PROCESSING','SHIPPED','DELIVERED','CANCELLED','RETURN_REQUESTED','RETURNED','REFUNDED') DEFAULT 'PENDING',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `order_number`, `user_id`, `address_id`, `order_type`, `original_amount`, `final_amount`, `drive_saving`, `delivery_charge`, `total_amount`, `payment_method`, `payment_status`, `status`, `created_at`, `updated_at`) VALUES
(12, 'ORD17918040908874569', 2, 3, 'DRIVE', 699.00, 699.00, 0.00, 0.00, 699.00, 'COD', 'PENDING', 'PENDING', '2026-10-12 11:21:30', '2026-10-12 11:21:35');

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `id` bigint(20) NOT NULL,
  `order_id` bigint(20) NOT NULL,
  `vendor_id` bigint(20) NOT NULL,
  `product_id` bigint(20) NOT NULL,
  `drive_id` bigint(20) NOT NULL,
  `product_name` varchar(255) NOT NULL,
  `product_image` text DEFAULT NULL,
  `drive_title` varchar(255) DEFAULT NULL,
  `price` decimal(12,2) NOT NULL,
  `quantity` int(11) NOT NULL,
  `total` decimal(12,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `vendor_id`, `product_id`, `drive_id`, `product_name`, `product_image`, `drive_title`, `price`, `quantity`, `total`, `created_at`, `updated_at`) VALUES
(11, 12, 1, 75, 26, 'boAt Rockerz 113 Wireless Neckband', '/uploads/products/1791800561164-b4e78b5f-7f9f-4bde-b294-4436336536ea.png', 'boAt Rockerz 113 Drive', 699.00, 1, 699.00, '2026-10-12 11:21:30', '2026-10-12 11:21:30');

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `id` bigint(20) NOT NULL,
  `order_id` bigint(20) NOT NULL,
  `payment_method` enum('RAZORPAY','COD') NOT NULL,
  `payment_id` varchar(255) DEFAULT NULL,
  `amount` decimal(12,2) NOT NULL,
  `status` enum('PENDING','SUCCESS','FAILED','REFUNDED') DEFAULT 'PENDING',
  `paid_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` bigint(20) NOT NULL,
  `category_id` bigint(20) NOT NULL,
  `subcategory_id` bigint(20) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(12,2) NOT NULL,
  `image` varchar(500) DEFAULT NULL,
  `stock` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `category_id`, `subcategory_id`, `name`, `description`, `price`, `image`, `stock`, `is_active`, `created_at`, `updated_at`) VALUES
(75, 12, 55, 'boAt Rockerz 113 Wireless Neckband', 'boAt Rockerz 113 wireless neckband with Bluetooth 5.3, 40 hours of playback, 10mm drivers, ENx technology, BEAST Mode with 60ms low latency, IPX5 water resistance, dual pairing and ASAP fast charging', 669.00, '/uploads/products/1791800561164-b4e78b5f-7f9f-4bde-b294-4436336536ea.png', 100, 1, '2026-10-12 10:22:41', '2026-10-12 10:22:41');

-- --------------------------------------------------------

--
-- Table structure for table `product_attributes`
--

CREATE TABLE `product_attributes` (
  `id` bigint(20) NOT NULL,
  `product_id` int(11) NOT NULL,
  `attribute_key` varchar(255) NOT NULL,
  `attribute_value` text NOT NULL,
  `sort_order` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `subcategories`
--

CREATE TABLE `subcategories` (
  `id` bigint(20) NOT NULL,
  `category_id` bigint(20) NOT NULL,
  `name` varchar(100) NOT NULL,
  `image` varchar(500) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `subcategories`
--

INSERT INTO `subcategories` (`id`, `category_id`, `name`, `image`, `is_active`, `created_at`, `updated_at`) VALUES
(55, 12, 'Headphones', 'boat-headphone.png', 1, '2026-10-12 10:16:49', '2026-10-12 10:16:49');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) NOT NULL,
  `mobile` varchar(15) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `mobile`, `name`, `email`, `created_at`, `updated_at`) VALUES
(2, '9820868352', 'nab', 'ne@gmail.com', '2026-10-02 11:51:29', '2026-10-10 06:22:43');

-- --------------------------------------------------------

--
-- Table structure for table `user_otps`
--

CREATE TABLE `user_otps` (
  `id` bigint(20) NOT NULL,
  `mobile` varchar(15) NOT NULL,
  `otp` varchar(6) NOT NULL,
  `expires_at` datetime NOT NULL,
  `is_verified` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user_otps`
--

INSERT INTO `user_otps` (`id`, `mobile`, `otp`, `expires_at`, `is_verified`, `created_at`) VALUES
(1, '9922992299', '779501', '2026-09-29 00:52:38', 0, '2026-09-27 19:22:38'),
(2, '9922992299', '516101', '2026-10-03 16:52:17', 0, '2026-10-02 11:22:17'),
(3, '9820868352', '650919', '2026-10-03 17:05:07', 0, '2026-10-02 11:35:07'),
(4, '9820868352', '422285', '2026-10-03 17:15:41', 0, '2026-10-02 11:45:41'),
(5, '9820868352', '510616', '2026-10-03 17:17:10', 0, '2026-10-02 11:47:10'),
(6, '9820868352', '268901', '2026-10-03 17:19:02', 0, '2026-10-02 11:49:02'),
(7, '9820868352', '811978', '2026-10-03 17:21:20', 0, '2026-10-02 11:51:20'),
(8, '9820868353', '242349', '2026-10-03 17:21:53', 0, '2026-10-02 11:51:53'),
(9, '9922992299', '729426', '2026-10-04 11:59:28', 0, '2026-10-03 06:29:28'),
(10, '9922992293', '999153', '2026-10-04 11:59:45', 0, '2026-10-03 06:29:45'),
(11, '9822332233', '291358', '2026-10-04 12:08:45', 0, '2026-10-03 06:38:45'),
(12, '9820868352', '161109', '2026-10-05 15:29:29', 0, '2026-10-04 09:59:29'),
(13, '9820868356', '130324', '2026-10-05 15:30:28', 0, '2026-10-04 10:00:28'),
(14, '9820868352', '668951', '2026-10-11 11:37:46', 0, '2026-10-10 06:07:46'),
(15, '9820868352', '252677', '2026-10-11 11:42:47', 0, '2026-10-10 06:12:47'),
(16, '9820868352', '384106', '2026-10-11 14:18:31', 0, '2026-10-10 08:48:31'),
(17, '9820868352', '583289', '2026-10-13 16:20:22', 0, '2026-10-12 10:50:22'),
(18, '9820868352', '400779', '2026-10-14 02:00:24', 0, '2026-10-12 20:30:24');

-- --------------------------------------------------------

--
-- Table structure for table `vendors`
--

CREATE TABLE `vendors` (
  `id` bigint(20) NOT NULL,
  `name` varchar(150) NOT NULL,
  `mobile` varchar(15) NOT NULL,
  `email` varchar(150) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `vendors`
--

INSERT INTO `vendors` (`id`, `name`, `mobile`, `email`, `is_active`, `created_at`, `updated_at`) VALUES
(2, 'Raymon Electronics', '9867315361', 'raymonelectronics12@gmail.com', 1, '2026-10-12 10:32:12', '2026-10-12 10:32:12');

-- --------------------------------------------------------

--
-- Table structure for table `wallets`
--

CREATE TABLE `wallets` (
  `id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `balance` decimal(12,2) NOT NULL DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `wallet_transactions`
--

CREATE TABLE `wallet_transactions` (
  `id` bigint(20) NOT NULL,
  `wallet_id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `type` enum('DRIVE_SAVING','REFUND','CREDIT','DEBIT') NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `reference_type` varchar(50) DEFAULT NULL,
  `reference_id` bigint(20) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `addresses`
--
ALTER TABLE `addresses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_address_user` (`user_id`);

--
-- Indexes for table `carts`
--
ALTER TABLE `carts`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `cart_items`
--
ALTER TABLE `cart_items`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `drives`
--
ALTER TABLE `drives`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_drive_vendor` (`vendor_id`),
  ADD KEY `fk_drive_product` (`product_id`);

--
-- Indexes for table `drive_price_tiers`
--
ALTER TABLE `drive_price_tiers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_drive_participant_tier` (`drive_id`,`minimum_participants`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `order_number` (`order_number`),
  ADD KEY `fk_order_user` (`user_id`),
  ADD KEY `fk_order_address` (`address_id`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_order_item_order` (`order_id`),
  ADD KEY `fk_order_item_product` (`product_id`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_payment_order` (`order_id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_product_category` (`category_id`),
  ADD KEY `fk_product_subcategory` (`subcategory_id`);

--
-- Indexes for table `product_attributes`
--
ALTER TABLE `product_attributes`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `subcategories`
--
ALTER TABLE `subcategories`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_subcategory_category` (`category_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `mobile` (`mobile`);

--
-- Indexes for table `user_otps`
--
ALTER TABLE `user_otps`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_mobile` (`mobile`),
  ADD KEY `idx_mobile_otp` (`mobile`,`otp`);

--
-- Indexes for table `vendors`
--
ALTER TABLE `vendors`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `mobile` (`mobile`);

--
-- Indexes for table `wallets`
--
ALTER TABLE `wallets`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`);

--
-- Indexes for table `wallet_transactions`
--
ALTER TABLE `wallet_transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_wallet_transaction_wallet` (`wallet_id`),
  ADD KEY `fk_wallet_transaction_user` (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `addresses`
--
ALTER TABLE `addresses`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `carts`
--
ALTER TABLE `carts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `cart_items`
--
ALTER TABLE `cart_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `drives`
--
ALTER TABLE `drives`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT for table `drive_price_tiers`
--
ALTER TABLE `drive_price_tiers`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=108;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=76;

--
-- AUTO_INCREMENT for table `product_attributes`
--
ALTER TABLE `product_attributes`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `subcategories`
--
ALTER TABLE `subcategories`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=56;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `user_otps`
--
ALTER TABLE `user_otps`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `vendors`
--
ALTER TABLE `vendors`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `wallets`
--
ALTER TABLE `wallets`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `wallet_transactions`
--
ALTER TABLE `wallet_transactions`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `addresses`
--
ALTER TABLE `addresses`
  ADD CONSTRAINT `fk_address_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `drives`
--
ALTER TABLE `drives`
  ADD CONSTRAINT `fk_drive_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_drive_vendor` FOREIGN KEY (`vendor_id`) REFERENCES `vendors` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `drive_price_tiers`
--
ALTER TABLE `drive_price_tiers`
  ADD CONSTRAINT `fk_price_tier_drive` FOREIGN KEY (`drive_id`) REFERENCES `drives` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `fk_order_address` FOREIGN KEY (`address_id`) REFERENCES `addresses` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_order_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `fk_order_item_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_order_item_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `fk_payment_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `fk_product_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_product_subcategory` FOREIGN KEY (`subcategory_id`) REFERENCES `subcategories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `subcategories`
--
ALTER TABLE `subcategories`
  ADD CONSTRAINT `fk_subcategory_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `wallets`
--
ALTER TABLE `wallets`
  ADD CONSTRAINT `fk_wallet_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `wallet_transactions`
--
ALTER TABLE `wallet_transactions`
  ADD CONSTRAINT `fk_wallet_transaction_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_wallet_transaction_wallet` FOREIGN KEY (`wallet_id`) REFERENCES `wallets` (`id`) ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
