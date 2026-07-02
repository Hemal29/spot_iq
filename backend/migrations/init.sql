-- =============================================================
-- SpotIQ Database Schema for MySQL
-- Run this in MySQL Workbench to create all tables
-- =============================================================

CREATE DATABASE IF NOT EXISTS spotiq CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE spotiq;

-- -----------------------------------------------------------
-- Users
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS Users (
  id                  INT             AUTO_INCREMENT PRIMARY KEY,
  name                VARCHAR(255)    NOT NULL,
  email               VARCHAR(255)    NOT NULL UNIQUE,
  password            VARCHAR(255)    NOT NULL,
  phone               VARCHAR(255)    DEFAULT NULL,
  role                ENUM('customer','admin') NOT NULL DEFAULT 'customer',
  isActive            TINYINT(1)      NOT NULL DEFAULT 1,
  googleId            VARCHAR(255)    DEFAULT NULL,
  facebookId          VARCHAR(255)    DEFAULT NULL,
  avatar              VARCHAR(255)    DEFAULT NULL,
  resetPasswordToken  VARCHAR(255)    DEFAULT NULL,
  resetPasswordExpire DATETIME        DEFAULT NULL,
  createdAt           DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt           DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_email (email),
  INDEX idx_users_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------------
-- ParkingOwners
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS ParkingOwners (
  id              INT             AUTO_INCREMENT PRIMARY KEY,
  userId          INT             NOT NULL UNIQUE,
  companyName     VARCHAR(255)    DEFAULT NULL,
  gstNumber       VARCHAR(255)    DEFAULT NULL,
  phone           VARCHAR(255)    DEFAULT NULL,
  address         TEXT            DEFAULT NULL,
  isApproved      TINYINT(1)      NOT NULL DEFAULT 0,
  commissionRate  DECIMAL(5,2)    NOT NULL DEFAULT 10.00,
  totalEarnings   DECIMAL(12,2)   NOT NULL DEFAULT 0,
  bankAccount     VARCHAR(255)    DEFAULT NULL,
  ifscCode        VARCHAR(255)    DEFAULT NULL,
  createdAt       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_owners_user (userId),
  INDEX idx_owners_approved (isApproved),
  CONSTRAINT fk_owners_user FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------------
-- Parkings
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS Parkings (
  id              INT             AUTO_INCREMENT PRIMARY KEY,
  userId          INT             DEFAULT NULL,
  parkingName     VARCHAR(255)    NOT NULL,
  address         VARCHAR(255)    NOT NULL,
  city            VARCHAR(255)    NOT NULL,
  state           VARCHAR(255)    DEFAULT NULL,
  zipCode         VARCHAR(255)    DEFAULT NULL,
  latitude        DECIMAL(10,7)   DEFAULT NULL,
  longitude       DECIMAL(10,7)   DEFAULT NULL,
  pricePerHour    DECIMAL(10,2)   NOT NULL,
  totalSlots      INT             NOT NULL,
  availableSlots  INT             NOT NULL,
  amenities       JSON            DEFAULT NULL,
  images          JSON            DEFAULT NULL,
  description     TEXT            DEFAULT NULL,
  operatingHours  JSON            DEFAULT NULL,
  rating          DECIMAL(3,2)    NOT NULL DEFAULT 0.00,
  numReviews      INT             NOT NULL DEFAULT 0,
  isActive        TINYINT(1)      NOT NULL DEFAULT 1,
  createdAt       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_parkings_city (city, isActive),
  INDEX idx_parkings_price (pricePerHour),
  INDEX idx_parkings_rating (rating DESC),
  CONSTRAINT fk_parkings_owner FOREIGN KEY (userId) REFERENCES ParkingOwners(userId) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------------
-- Coupons
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS Coupons (
  id                INT             AUTO_INCREMENT PRIMARY KEY,
  code              VARCHAR(255)    NOT NULL UNIQUE,
  description       TEXT            DEFAULT NULL,
  discountType      ENUM('percentage','fixed') NOT NULL,
  discountValue     DECIMAL(10,2)   NOT NULL,
  minBookingAmount  DECIMAL(10,2)   NOT NULL DEFAULT 0,
  maxDiscount       DECIMAL(10,2)   DEFAULT NULL,
  usageLimit        INT             DEFAULT NULL,
  usedCount         INT             NOT NULL DEFAULT 0,
  expiresAt         DATETIME        DEFAULT NULL,
  isActive          TINYINT(1)      NOT NULL DEFAULT 1,
  createdAt         DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt         DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_coupons_code (code),
  INDEX idx_coupons_active (isActive, expiresAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------------
-- Slots
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS Slots (
  id              INT             AUTO_INCREMENT PRIMARY KEY,
  parkingId       INT             NOT NULL,
  slotNumber      VARCHAR(255)    NOT NULL,
  type            ENUM('standard','ev','handicapped','compact') NOT NULL DEFAULT 'standard',
  status          ENUM('available','booked','maintenance') NOT NULL DEFAULT 'available',
  currentBooking  INT             DEFAULT NULL,
  createdAt       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE INDEX idx_slots_parking_number (parkingId, slotNumber),
  INDEX idx_slots_parking_status (parkingId, status),
  INDEX idx_slots_type_status (parkingId, type, status),
  CONSTRAINT fk_slots_parking FOREIGN KEY (parkingId) REFERENCES Parkings(id) ON DELETE CASCADE,
  CONSTRAINT fk_slots_booking FOREIGN KEY (currentBooking) REFERENCES Bookings(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------------
-- Vehicles
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS Vehicles (
  id              INT             AUTO_INCREMENT PRIMARY KEY,
  userId          INT             NOT NULL,
  vehicleNumber   VARCHAR(255)    NOT NULL,
  vehicleType     ENUM('sedan','suv','hatchback','motorcycle','truck') NOT NULL DEFAULT 'sedan',
  brand           VARCHAR(255)    DEFAULT NULL,
  model           VARCHAR(255)    DEFAULT NULL,
  color           VARCHAR(255)    DEFAULT NULL,
  isDefault       TINYINT(1)      NOT NULL DEFAULT 0,
  createdAt       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_vehicles_user (userId),
  INDEX idx_vehicles_user_default (userId, isDefault),
  CONSTRAINT fk_vehicles_user FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------------
-- Bookings
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS Bookings (
  id              INT             AUTO_INCREMENT PRIMARY KEY,
  userId          INT             NOT NULL,
  parkingId       INT             NOT NULL,
  slotId          INT             DEFAULT NULL,
  vehicleId       INT             DEFAULT NULL,
  couponId        INT             DEFAULT NULL,
  startTime       DATETIME        NOT NULL,
  endTime         DATETIME        NOT NULL,
  totalAmount     DECIMAL(10,2)   NOT NULL,
  discountAmount  DECIMAL(10,2)   DEFAULT 0,
  paymentMethod   ENUM('razorpay','cash') DEFAULT NULL,
  paymentStatus   ENUM('pending','paid','failed','refunded') NOT NULL DEFAULT 'pending',
  bookingStatus   ENUM('upcoming','active','completed','cancelled') NOT NULL DEFAULT 'upcoming',
  qrCode          TEXT            DEFAULT NULL,
  createdAt       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_bookings_user (userId, bookingStatus),
  INDEX idx_bookings_parking (parkingId, bookingStatus),
  INDEX idx_bookings_time (startTime, endTime, parkingId),
  INDEX idx_bookings_status_time (bookingStatus, startTime),
  INDEX idx_bookings_coupon (couponId),
  CONSTRAINT fk_bookings_user FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE,
  CONSTRAINT fk_bookings_parking FOREIGN KEY (parkingId) REFERENCES Parkings(id) ON DELETE CASCADE,
  CONSTRAINT fk_bookings_slot FOREIGN KEY (slotId) REFERENCES Slots(id) ON DELETE SET NULL,
  CONSTRAINT fk_bookings_vehicle FOREIGN KEY (vehicleId) REFERENCES Vehicles(id) ON DELETE SET NULL,
  CONSTRAINT fk_bookings_coupon FOREIGN KEY (couponId) REFERENCES Coupons(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------------
-- Payments
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS Payments (
  id                INT             AUTO_INCREMENT PRIMARY KEY,
  bookingId         INT             NOT NULL,
  userId            INT             NOT NULL,
  amount            DECIMAL(10,2)   NOT NULL,
  paymentMethod     ENUM('razorpay','cash') DEFAULT NULL,
  transactionId     VARCHAR(255)    DEFAULT NULL,
  razorpayOrderId   VARCHAR(255)    DEFAULT NULL,
  razorpayPaymentId VARCHAR(255)    DEFAULT NULL,
  status            ENUM('pending','success','failed','refunded') NOT NULL DEFAULT 'pending',
  createdAt         DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt         DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_payments_booking (bookingId),
  INDEX idx_payments_user (userId),
  INDEX idx_payments_order (razorpayOrderId),
  INDEX idx_payments_status_date (status, createdAt),
  CONSTRAINT fk_payments_booking FOREIGN KEY (bookingId) REFERENCES Bookings(id) ON DELETE CASCADE,
  CONSTRAINT fk_payments_user FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------------
-- Reviews
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS Reviews (
  id          INT             AUTO_INCREMENT PRIMARY KEY,
  userId      INT             NOT NULL,
  parkingId   INT             NOT NULL,
  bookingId   INT             DEFAULT NULL,
  rating      INT             NOT NULL,
  comment     TEXT            DEFAULT NULL,
  isApproved  TINYINT(1)      NOT NULL DEFAULT 0,
  createdAt   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_reviews_parking (parkingId, isApproved),
  INDEX idx_reviews_user_parking (userId, parkingId),
  INDEX idx_reviews_rating (parkingId, rating DESC),
  CONSTRAINT fk_reviews_user FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE,
  CONSTRAINT fk_reviews_parking FOREIGN KEY (parkingId) REFERENCES Parkings(id) ON DELETE CASCADE,
  CONSTRAINT fk_reviews_booking FOREIGN KEY (bookingId) REFERENCES Bookings(id) ON DELETE SET NULL,
  CONSTRAINT chk_reviews_rating CHECK (rating >= 1 AND rating <= 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------------
-- Notifications
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS Notifications (
  id          INT             AUTO_INCREMENT PRIMARY KEY,
  userId      INT             DEFAULT NULL,
  type        ENUM('booking','payment','system','promo') NOT NULL DEFAULT 'system',
  title       VARCHAR(255)    NOT NULL,
  message     TEXT            NOT NULL,
  isRead      TINYINT(1)      NOT NULL DEFAULT 0,
  sendToAll   TINYINT(1)      NOT NULL DEFAULT 0,
  createdAt   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_notifications_user (userId, isRead),
  INDEX idx_notifications_type (type),
  CONSTRAINT fk_notifications_user FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------------
-- SupportTickets
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS SupportTickets (
  id          INT             AUTO_INCREMENT PRIMARY KEY,
  userId      INT             NOT NULL,
  subject     VARCHAR(255)    NOT NULL,
  message     TEXT            NOT NULL,
  status      ENUM('open','assigned','resolved','closed') NOT NULL DEFAULT 'open',
  priority    ENUM('low','medium','high') NOT NULL DEFAULT 'medium',
  assignedTo  INT             DEFAULT NULL,
  resolution  TEXT            DEFAULT NULL,
  createdAt   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_tickets_user (userId),
  INDEX idx_tickets_status (status),
  INDEX idx_tickets_priority (priority),
  INDEX idx_tickets_assigned (assignedTo, status),
  CONSTRAINT fk_tickets_user FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE,
  CONSTRAINT fk_tickets_assignee FOREIGN KEY (assignedTo) REFERENCES Users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------------
-- ActivityLogs
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS ActivityLogs (
  id          INT             AUTO_INCREMENT PRIMARY KEY,
  userId      INT             DEFAULT NULL,
  action      VARCHAR(255)    NOT NULL,
  description TEXT            DEFAULT NULL,
  ipAddress   VARCHAR(45)     DEFAULT NULL,
  userAgent   TEXT            DEFAULT NULL,
  createdAt   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_activity_user (userId),
  INDEX idx_activity_action (action),
  INDEX idx_activity_created (createdAt),
  CONSTRAINT fk_activity_user FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
