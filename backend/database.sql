-- PharmaCare Database Schema
-- Phase 2: Backend Database

CREATE DATABASE IF NOT EXISTS pharmacare_db;
USE pharmacare_db;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  is_admin TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  description TEXT,
  stock INT DEFAULT 0,
  image VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Contact messages table
CREATE TABLE IF NOT EXISTS contact_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  message TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'new',
  reply TEXT DEFAULT NULL,
  replied_at TIMESTAMP NULL DEFAULT NULL,
  replied_by INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Purchase invoices table
CREATE TABLE IF NOT EXISTS purchase_invoices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  invoice_no VARCHAR(100) NOT NULL,
  supplier_name VARCHAR(200) NOT NULL,
  currency VARCHAR(10) NOT NULL,
  total_amount DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Purchase items table
CREATE TABLE IF NOT EXISTS purchase_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  purchase_id INT NOT NULL,
  product_id INT,
  product_name VARCHAR(200) NOT NULL,
  exp_date DATE DEFAULT NULL,
  quantity INT NOT NULL,
  net_price DECIMAL(10,2) NOT NULL,
  public_price DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (purchase_id) REFERENCES purchase_invoices(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

-- Insert sample products
INSERT INTO products (name, category, price, description, stock, image) VALUES
('Paracetamol 500mg', 'Medicines', 5.99, 'Pain relief and fever reducer', 100, '/assets/paracetamol.jpg'),
('Ibuprofen 400mg', 'Medicines', 7.99, 'Anti-inflammatory medication', 80, '/assets/ibuprofen.jpg'),
('Aspirin 100mg', 'Medicines', 4.99, 'Blood thinner and pain relief', 120, '/assets/aspirin.avif'),
('Amoxicillin 500mg', 'Medicines', 12.99, 'Antibiotic for bacterial infections', 50, '/assets/amoxicillin.jpeg'),
('Moisturizing Face Cream', 'Cosmetics', 24.99, 'Hydrating cream for all skin types', 60, '/assets/moisturizing cream.webp'),
('Anti-Aging Serum', 'Cosmetics', 35.99, 'Reduces wrinkles and fine lines', 40, '/assets/anti-aging serum.webp'),
('Sunscreen SPF 50', 'Cosmetics', 18.99, 'Broad spectrum sun protection', 75, '/assets/sunscreen spf.webp'),
('Vitamin C Face Mask', 'Cosmetics', 15.99, 'Brightening and rejuvenating mask', 55, '/assets/vitamin c mask.webp'),
('Vitamin D3 2000 IU', 'Vitamins', 14.99, 'Supports bone and immune health', 90, '/assets/vitamin d2 iu.jpg'),
('Multivitamin Complex', 'Vitamins', 22.99, 'Complete daily vitamin supplement', 70, '/assets/multi-vitamin.webp'),
('Omega-3 Fish Oil', 'Vitamins', 19.99, 'Heart and brain health support', 85, '/assets/omega 3.jpg'),
('Vitamin B Complex', 'Vitamins', 16.99, 'Energy and metabolism support', 95, '/assets/vitamin b complex.avif'),
('Antibacterial Hand Soap', 'Personal Care', 6.99, 'Kills 99.9% of germs', 150, '/assets/antibacterial hand soap.jpg'),
('Dental Care Kit', 'Personal Care', 12.99, 'Complete oral hygiene set', 65, '/assets/dental care kit.jpg'),
('Body Lotion', 'Personal Care', 11.99, 'Nourishing body moisturizer', 80, '/assets/BODY LOTION.webp'),
('Hair Care Shampoo', 'Personal Care', 9.99, 'Strengthening and volumizing', 100, '/assets/hair care shampoo.jpg');

-- Clear existing users and insert admin
DELETE FROM users;

-- Insert admin user (Email: admin@pharmacare.com, Password: admin123)
INSERT INTO users (name, email, password, phone, is_admin) VALUES
('Admin', 'admin@pharmacare.com', '$2a$10$UdJzejB5Of20OeroeE0c6u8QPumbZPWM1al3OZ3jBhW9JouFKmhvW', '+961 70 123 456', 1);

