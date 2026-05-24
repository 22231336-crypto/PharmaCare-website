const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
// Simple request logger for debugging route availability
app.use((req, res, next) => {
  try { console.log('REQ', req.method, req.originalUrl); } catch (e) {}
  next();
});

// Debug helper: list all registered routes (temporary)
app.get('/__routes', (req, res) => {
  try {
    const routes = [];
    app._router.stack.forEach(layer => {
      if (layer.route && layer.route.path) {
        const methods = Object.keys(layer.route.methods).join(',');
        routes.push({ path: layer.route.path, methods });
      }
    });
    return res.json(routes);
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
});
const multer = require('multer');
const fs = require('fs');
const { createWorker } = require('tesseract.js');
const axios = require('axios');
const nodemailer = require('nodemailer');
const twilioLib = require('twilio');

const upload = multer({ dest: 'uploads/' });
app.use('/uploads', express.static('uploads'));

// Initialize a persistent OCR worker at startup to avoid per-request
// language downloads and long delays. The worker will log progress.
const ocrWorker = createWorker ? createWorker({ logger: m => console.log('TESSERACT:', m) }) : null;
let ocrReady = false;
(async () => {
  try {
    if (!ocrWorker) {
      console.warn('Tesseract createWorker not available; OCR disabled');
      return;
    }

    // Some tesseract builds expose async init methods; guard against missing methods
    if (typeof ocrWorker.load === 'function') {
      await ocrWorker.load();
      if (typeof ocrWorker.loadLanguage === 'function') await ocrWorker.loadLanguage('eng');
      if (typeof ocrWorker.initialize === 'function') await ocrWorker.initialize('eng');
      ocrReady = true;
      console.log('✅ OCR worker initialized');
    } else {
      console.warn('OCR worker does not expose load(); OCR will use recognize() directly when available');
      // If the worker exposes recognize, mark ready so calls can attempt recognize with timeout
      if (typeof ocrWorker.recognize === 'function') {
        ocrReady = true;
        console.log('✅ OCR worker ready (recognize available)');
      }
    }
  } catch (e) {
    console.error('OCR worker init error:', e);
  }
})();

// MySQL Connection
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'pharmacare_db'
});

db.connect((err) => {
  if (err) {
    console.error('Database connection error:', err);
    return;
  }
  console.log('✅ Connected to MySQL database');
  // Ensure contact_messages has reply/replied_at/replied_by/status columns
  try {
    db.query("ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS reply TEXT DEFAULT NULL", (e1) => { if (e1) console.warn('Could not add contact_messages.reply column:', e1.message || e1); });
    db.query("ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS replied_at DATETIME DEFAULT NULL", (e2) => { if (e2) console.warn('Could not add contact_messages.replied_at column:', e2.message || e2); });
    db.query("ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS replied_by INT DEFAULT NULL", (e3) => { if (e3) console.warn('Could not add contact_messages.replied_by column:', e3.message || e3); });
    db.query("ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'new'", (e4) => { if (e4) console.warn('Could not add contact_messages.status column:', e4.message || e4); });
  } catch (e) {
    console.warn('Skipping ALTER TABLE for contact_messages columns:', e && e.message);
  }
});

// Twilio client (if configured)
let twilioClient = null;
const TWILIO_FROM = process.env.TWILIO_FROM;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  try {
    twilioClient = twilioLib(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    console.log('Twilio client initialized');
  } catch (e) {
    console.warn('Failed to initialize Twilio client:', e && e.message);
  }
} else {
  console.log('Twilio not configured (TWILIO_ACCOUNT_SID/TWILIO_AUTH_TOKEN missing)');
}

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token.' });
    }
    // Normalize token payload: support both `isAdmin` and legacy `is_admin`
    if (typeof user.isAdmin === 'undefined' && typeof user.is_admin !== 'undefined') {
      user.isAdmin = user.is_admin;
    }
    req.user = user;
    next();
  });
};

// ==================== ROUTES ====================

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'PharmaCare API is running!' });
});

// ==================== AUTH ROUTES ====================

// Register (Signup)
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, phone } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' });
  }
  
  try {
    // Check if user already exists
    db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
      if (err) {
        return res.status(500).json({ message: 'Database error', error: err });
      }
      
      if (results.length > 0) {
        return res.status(400).json({ message: 'User already exists' });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert new user (initial)
      const query = 'INSERT INTO users (name, email, password, phone) VALUES (?, ?, ?, ?)';
      db.query(query, [name, email, hashedPassword, phone || null], (err, result) => {
        if (err) {
          return res.status(500).json({ message: 'Error creating user', error: err });
        }

        const userId = result.insertId;
        // Registration complete — verification feature removed
        res.status(201).json({ message: 'User registered successfully.', userId });
      });
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }
  
  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Database error', error: err });
    }
    
    if (results.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    const user = results[0];
    
    // Compare password
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Email verification removed; allow login if credentials match

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, isAdmin: user.is_admin },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isAdmin: user.is_admin
      }
    });
  });
});

// ==================== USER PROFILE ROUTES ====================

// Get current user's profile
app.get('/api/users/profile', authenticateToken, (req, res) => {
  const userId = req.user.id;

  db.query('SELECT id, name, email, phone, is_admin FROM users WHERE id = ?', [userId], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err });
    if (!results || results.length === 0) return res.status(404).json({ message: 'User not found' });

    const u = results[0];
    res.json({ id: u.id, name: u.name, email: u.email, phone: u.phone, isAdmin: u.is_admin });
  });
});

// Update current user's profile
app.put('/api/users/profile', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { name, email, phone, password } = req.body;

  console.log('PUT /api/users/profile called by userId=', userId, 'body=', { name, email, phone: phone ? '[REDACTED]' : phone, password: password ? '[REDACTED]' : undefined });

  if (!name && !email && typeof phone === 'undefined' && !password) {
    return res.status(400).json({ message: 'At least one field (name, email, phone, password) is required to update' });
  }

  try {
    // If email is being changed, ensure it's not taken by another user
    if (email) {
      const emailCheck = await new Promise((resolve, reject) => {
        db.query('SELECT id FROM users WHERE email = ? AND id != ?', [email, userId], (err, results) => {
          if (err) {
            console.error('Error checking email uniqueness', { userId, email, err });
            return reject(err);
          }
          resolve(results);
        });
      });
      if (emailCheck && emailCheck.length > 0) {
        return res.status(400).json({ message: 'Email already in use by another account' });
      }
    }

    const fields = [];
    const values = [];

    if (name) { fields.push('name = ?'); values.push(name); }
    if (email) { fields.push('email = ?'); values.push(email); }
    if (typeof phone !== 'undefined') { fields.push('phone = ?'); values.push(phone); }
    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      fields.push('password = ?');
      values.push(hashed);
    }

    if (fields.length === 0) return res.status(400).json({ message: 'No valid fields to update' });

    values.push(userId);
    const query = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;

    db.query(query, values, (err, result) => {
      if (err) {
        console.error('Error updating users table', { userId, query, values, err });
        return res.status(500).json({ message: 'Error updating profile', error: err });
      }

      // Return updated user and a fresh token to keep client in sync
      db.query('SELECT id, name, email, phone, is_admin FROM users WHERE id = ?', [userId], (err2, results2) => {
        if (err2) {
          console.error('Error selecting updated user', { userId, err: err2 });
          return res.status(500).json({ message: 'Database error', error: err2 });
        }
        const updated = results2[0];
        const token = jwt.sign(
          { id: updated.id, email: updated.email, name: updated.name, isAdmin: updated.is_admin },
          JWT_SECRET,
          { expiresIn: '24h' }
        );

        console.log('Profile updated successfully for userId=', userId);

        res.json({ message: 'Profile updated successfully', user: { id: updated.id, name: updated.name, email: updated.email, phone: updated.phone, isAdmin: updated.is_admin }, token });
      });
    });
  } catch (e) {
    console.error('Profile update error:', e);
    res.status(500).json({ message: 'Server error', error: e.message });
  }
});

// Verify code endpoint
// Email verification routes removed per request

// ==================== PRODUCTS ROUTES ====================

// Get all products
app.get('/api/products', (req, res) => {
  const query = 'SELECT * FROM products';
  
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Database error', error: err });
    }
    // Return products with image paths as-is (frontend will handle them)
    res.json(results);
  });
});

// Get product by ID
app.get('/api/products/:id', (req, res) => {
  const { id } = req.params;
  
  db.query('SELECT * FROM products WHERE id = ?', [id], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Database error', error: err });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(results[0]);
  });
});

// Create product (Admin only - accept optional image upload)
app.post('/api/products', authenticateToken, upload.single('image'), (req, res) => {
  const { name, category, price, description, stock } = req.body;
  console.log('POST /api/products received. body:', req.body, 'file:', req.file && { originalname: req.file.originalname, filename: req.file.filename, size: req.file.size });

  if (!name || !category || !price) {
    return res.status(400).json({ message: 'Name, category, and price are required' });
  }

  // If an image file was uploaded, save its public path
  let imagePath = req.body.image || '/assets/default.jpg';
  if (req.file) {
    const host = req.get('host');
    imagePath = `${req.protocol}://${host}/uploads/${req.file.filename}`;
  }

  const query = 'INSERT INTO products (name, category, price, description, stock, image) VALUES (?, ?, ?, ?, ?, ?)';

  db.query(query, [name, category, price, description, stock || 0, imagePath], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error creating product', error: err });
    }
    const newId = result.insertId;
    db.query('SELECT * FROM products WHERE id = ?', [newId], (err2, rows) => {
      if (err2) {
        return res.status(201).json({ message: 'Product created successfully', productId: newId });
      }
      const created = rows && rows[0] ? rows[0] : null;
      res.status(201).json({ message: 'Product created successfully', productId: newId, product: created });
    });
  });
});

// Update product (Admin only - accept optional image upload)
app.put('/api/products/:id', authenticateToken, upload.single('image'), (req, res) => {
  const { id } = req.params;
  console.log('PUT /api/products/' + id + ' received. body:', req.body, 'file:', req.file && { originalname: req.file.originalname, filename: req.file.filename, size: req.file.size });

  // Support both JSON body updates and multipart/form-data
  const { name, category, price, description, stock } = req.body;

  const fields = [];
  const values = [];

  if (typeof name !== 'undefined') { fields.push('name = ?'); values.push(name); }
  if (typeof category !== 'undefined') { fields.push('category = ?'); values.push(category); }
  if (typeof price !== 'undefined') { fields.push('price = ?'); values.push(price); }
  if (typeof description !== 'undefined') { fields.push('description = ?'); values.push(description); }
  if (typeof stock !== 'undefined') { fields.push('stock = ?'); values.push(stock); }

  if (req.file) {
    const host = req.get('host');
    fields.push('image = ?');
    values.push(`${req.protocol}://${host}/uploads/${req.file.filename}`);
  } else if (typeof req.body.image !== 'undefined') {
    fields.push('image = ?');
    values.push(req.body.image);
  }

  if (fields.length === 0) return res.status(400).json({ message: 'No valid fields to update' });

  values.push(id);
  const query = `UPDATE products SET ${fields.join(', ')} WHERE id = ?`;

  db.query(query, values, (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error updating product', error: err });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Return the updated product row so frontend can update immediately
    db.query('SELECT * FROM products WHERE id = ?', [id], (err2, rows) => {
      if (err2) {
        return res.json({ message: 'Product updated successfully' });
      }
      const updated = rows && rows[0] ? rows[0] : null;
      res.json({ message: 'Product updated successfully', product: updated });
    });
  });
});

// Delete product
app.delete('/api/products/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  
  db.query('DELETE FROM products WHERE id = ?', [id], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error deleting product', error: err });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json({ message: 'Product deleted successfully' });
  });
});

// ==================== PURCHASES ROUTES ====================

// Create purchase invoice (Admin only)
app.post('/api/purchases', authenticateToken, (req, res) => {
  const { invoice_no, supplier_name, currency, items } = req.body;

  console.log('POST /api/purchases called by user=', req.user && req.user.id, 'body=', JSON.stringify(req.body));
  if (!invoice_no || !supplier_name || !currency || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'invoice_no, supplier_name, currency and items are required' });
  }

  // Start transaction
  db.beginTransaction(err => {
    if (err) {
      console.error('DB transaction start error for purchases', err);
      return res.status(500).json({ message: 'Database transaction error', error: err });
    }

    const totalAmount = items.reduce((s, it) => s + (parseFloat(it.net_price || 0) * (parseInt(it.quantity || 0) || 0)), 0);

    db.query('INSERT INTO purchase_invoices (invoice_no, supplier_name, currency, total_amount) VALUES (?, ?, ?, ?)', [invoice_no, supplier_name, currency, totalAmount], (err, result) => {
      if (err) {
        console.error('Error creating purchase invoice', { err, invoice_no, supplier_name, currency, totalAmount });
        db.rollback(() => {});
        return res.status(500).json({ message: 'Error creating purchase invoice', error: err });
      }

      const purchaseId = result.insertId;

      // Insert items sequentially and update product stock
      const insertItem = (index) => {
        if (index >= items.length) {
          // commit
          db.commit(err2 => {
            if (err2) {
              db.rollback(() => {});
              return res.status(500).json({ message: 'Error committing transaction', error: err2 });
            }
            return res.status(201).json({ message: 'Purchase invoice created', purchaseId });
          });
          return;
        }
        // No-op: verification columns removed per configuration

        const it = items[index];
        const productId = it.product_id || null;
        const productName = it.product_name || it.name || '';
        const expDate = it.exp_date || null;
        const quantity = parseInt(it.quantity || 0) || 0;
        const netPrice = parseFloat(it.net_price || 0) || 0;
        const publicPrice = parseFloat(it.public_price || 0) || 0;

        db.query('INSERT INTO purchase_items (purchase_id, product_id, product_name, exp_date, quantity, net_price, public_price) VALUES (?, ?, ?, ?, ?, ?, ?)', [purchaseId, productId, productName, expDate, quantity, netPrice, publicPrice], (err3) => {
          if (err3) {
            console.error('Error inserting purchase item', { err: err3, item: it, purchaseId });
            db.rollback(() => {});
            return res.status(500).json({ message: 'Error inserting purchase item', error: err3 });
          }

          if (productId) {
            // Increase product stock
            db.query('UPDATE products SET stock = stock + ? WHERE id = ?', [quantity, productId], (err4) => {
              if (err4) {
                console.error('Error updating product stock', { err: err4, productId, quantity });
                db.rollback(() => {});
                return res.status(500).json({ message: 'Error updating product stock', error: err4 });
              }
              insertItem(index + 1);
            });
          } else {
            insertItem(index + 1);
          }
        });
      };

      insertItem(0);
    });
  });
});

// Get all purchases (Admin)
app.get('/api/purchases', authenticateToken, (req, res) => {
  db.query('SELECT * FROM purchase_invoices ORDER BY created_at DESC', (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err });
    res.json(results);
  });
});

// Get items for a specific purchase invoice
app.get('/api/purchases/:id/items', authenticateToken, (req, res) => {
  const { id } = req.params;
  db.query('SELECT pi.*, p.image as product_image FROM purchase_items pi LEFT JOIN products p ON pi.product_id = p.id WHERE pi.purchase_id = ? ORDER BY pi.id ASC', [id], (err, rows) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err });
    res.json(Array.isArray(rows) ? rows : []);
  });
});

// ==================== ORDERS ROUTES ====================

// Create order
app.post('/api/orders', authenticateToken, (req, res) => {
  const { items, total } = req.body;
  const userId = req.user.id;
  
  if (!items || !total) {
    return res.status(400).json({ message: 'Items and total are required' });
  }
  
  // Use a transaction to ensure order, order_items and stock updates are atomic
  db.beginTransaction((err) => {
    if (err) return res.status(500).json({ message: 'Error starting transaction', error: err });

    const insertOrder = 'INSERT INTO orders (user_id, total, status) VALUES (?, ?, ?)';
    db.query(insertOrder, [userId, total, 'pending'], (err, result) => {
      if (err) return db.rollback(() => res.status(500).json({ message: 'Error creating order', error: err }));

      const orderId = result.insertId;
      const itemsQuery = 'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ?';
      const itemsValues = items.map(item => [orderId, item.id, item.quantity, item.price]);

      db.query(itemsQuery, [itemsValues], (err) => {
        if (err) return db.rollback(() => res.status(500).json({ message: 'Error adding order items', error: err }));

        // Sequentially decrement stock for each ordered item and ensure enough stock exists
        const updateStockForItem = (index) => {
          if (index >= items.length) {
            // All stock updates succeeded, commit transaction
            return db.commit((err) => {
              if (err) return db.rollback(() => res.status(500).json({ message: 'Error committing transaction', error: err }));
              return res.status(201).json({ message: 'Order created successfully', orderId });
            });
          }

          const item = items[index];
          const updateQuery = 'UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?';
          db.query(updateQuery, [item.quantity, item.id, item.quantity], (err, result) => {
            if (err) return db.rollback(() => res.status(500).json({ message: 'Error updating stock', error: err }));

            // If no rows affected, there wasn't enough stock for this product
            if (result.affectedRows === 0) {
              return db.rollback(() => res.status(400).json({ message: `Insufficient stock for product id ${item.id}` }));
            }

            // Continue with next item
            updateStockForItem(index + 1);
          });
        };

        updateStockForItem(0);
      });
    });
  });
});

// Get user orders
app.get('/api/orders', authenticateToken, (req, res) => {
  const userId = req.user.id;

  // Admins can fetch all orders; regular users only their own
  const params = [];
  let whereClause = '';
  if (!req.user.isAdmin) {
    whereClause = 'WHERE o.user_id = ?';
    params.push(userId);
  }

  const query = `
    SELECT o.id as order_id, o.user_id as order_user_id, o.total, o.status, o.created_at, o.updated_at,
           oi.quantity, oi.price as item_price, p.id as product_id, p.name as product_name, p.image as product_image,
           u.name as user_name, u.email as user_email
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    LEFT JOIN products p ON oi.product_id = p.id
    LEFT JOIN users u ON o.user_id = u.id
    ${whereClause}
    ORDER BY o.created_at DESC
  `;

  db.query(query, params, (err, rows) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err });

    // Group rows into orders with items array
    const ordersMap = new Map();
    rows.forEach(r => {
      if (!ordersMap.has(r.order_id)) {
        ordersMap.set(r.order_id, {
          id: r.order_id,
          user_id: r.order_user_id,
          user_name: r.user_name,
          user_email: r.user_email,
          total: r.total,
          status: r.status,
          created_at: r.created_at,
          updated_at: r.updated_at,
          items: []
        });
      }
      if (r.product_id) {
        ordersMap.get(r.order_id).items.push({ id: r.product_id, name: r.product_name, image: r.product_image, quantity: r.quantity, price: r.item_price });
      }
    });

    const orders = Array.from(ordersMap.values());
    res.json(orders);
  });
});

// Get order by ID
app.get('/api/orders/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  // Admins can fetch any order; regular users only their own
  const params = [id];
  let whereUser = 'AND o.user_id = ?';
  if (req.user.isAdmin) whereUser = '';
  else params.push(userId);

  const query = `
    SELECT o.id as order_id, o.user_id as order_user_id, o.total, o.status, o.created_at, o.updated_at,
           oi.quantity, oi.price as item_price, p.id as product_id, p.name as product_name, p.image as product_image,
           u.name as user_name, u.email as user_email
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    LEFT JOIN products p ON oi.product_id = p.id
    LEFT JOIN users u ON o.user_id = u.id
    WHERE o.id = ? ${whereUser}
  `;

  db.query(query, params, (err, rows) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err });
    if (!rows || rows.length === 0) return res.status(404).json({ message: 'Order not found' });

    const order = {
      id: rows[0].order_id,
      user_id: rows[0].order_user_id,
      user_name: rows[0].user_name,
      user_email: rows[0].user_email,
      total: rows[0].total,
      status: rows[0].status,
      created_at: rows[0].created_at,
      updated_at: rows[0].updated_at,
      items: []
    };

    rows.forEach(r => {
      if (r.product_id) order.items.push({ id: r.product_id, name: r.product_name, image: r.product_image, quantity: r.quantity, price: r.item_price });
    });

    res.json(order);
  });
});

// ==================== CONTACT ROUTES ====================

// Submit contact form
app.post('/api/contact', (req, res) => {
  const { name, email, phone, message } = req.body;
  
  if (!name || !email || !message) {
    return res.status(400).json({ message: 'Name, email, and message are required' });
  }
  
  const query = 'INSERT INTO contact_messages (name, email, phone, message) VALUES (?, ?, ?, ?)';
  
  db.query(query, [name, email, phone, message], (err, result) => {
    if (err) {
      console.error('Error inserting contact message:', err);
      return res.status(500).json({ message: 'Database error', error: err });
    }

    res.status(201).json({ message: 'Message sent successfully', messageId: result.insertId });
  });
});


// Admin: get contact messages (admin-only)
app.get('/api/contact-messages', authenticateToken, (req, res) => {
  // require admin
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ message: 'Access denied. Admins only.' });
  }

  // Join with users table (if email matches) to surface registered user info
  const query = `
        SELECT cm.id, cm.name, cm.email, cm.phone, cm.message, cm.status, cm.reply, cm.replied_at, cm.replied_by, cm.created_at,
          u.id AS user_id, u.name AS user_name,
          a.id AS admin_id, a.name AS admin_name
        FROM contact_messages cm
        LEFT JOIN users u ON u.email = cm.email
        LEFT JOIN users a ON a.id = cm.replied_by
        ORDER BY cm.created_at DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('GET /api/contact-messages: Database error', err, err && err.stack);
      return res.status(500).json({ message: 'Database error', error: err && err.message ? err.message : String(err), stack: process.env.NODE_ENV !== 'production' ? (err && err.stack) : undefined });
    }
    try {
      res.json(results.map(r => ({
        id: r.id,
        name: r.name,
        email: r.email,
        phone: r.phone,
        message: r.message,
        status: r.status,
        reply: r.reply || null,
        replied_at: r.replied_at || null,
        replied_by: r.replied_by || null,
        created_at: r.created_at,
        user_id: r.user_id || null,
        user_name: r.user_name || null,
        replied_by_name: r.admin_name || null
      })));
    } catch (mapErr) {
      console.error('GET /api/contact-messages: mapping error', mapErr && mapErr.stack || mapErr);
      return res.status(500).json({ message: 'Response mapping error', error: mapErr && mapErr.message ? mapErr.message : String(mapErr), stack: process.env.NODE_ENV !== 'production' ? (mapErr && mapErr.stack) : undefined });
    }
  });
});


// Admin: reply to a contact message (sends email to the original sender)
app.post('/api/contact-messages/:id/reply', authenticateToken, (req, res) => {
  // require admin
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ message: 'Access denied. Admins only.' });
  }

  const { id } = req.params;
  const { reply } = req.body;

  if (!reply || typeof reply !== 'string') {
    return res.status(400).json({ message: 'Reply text is required' });
  }

  // Lookup the original message to get recipient email
  db.query('SELECT id, name, email, message FROM contact_messages WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err });
    if (!results || results.length === 0) return res.status(404).json({ message: 'Contact message not found' });

    const msgRow = results[0];
    const recipientEmail = msgRow.email;
    const recipientName = msgRow.name || '';

    // Ensure SMTP config exists
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const sender = process.env.SENDER_EMAIL || smtpUser;

    // If SMTP is configured, try to send email; otherwise, just save the reply and return success.
    const adminId = req.user && req.user.id ? req.user.id : null;
    const updQuery = 'UPDATE contact_messages SET status = ?, reply = ?, replied_at = NOW(), replied_by = ? WHERE id = ?';

    const finalize = (sendInfo) => {
      db.query(updQuery, ['replied', reply, adminId, id], (updErr) => {
        if (updErr) console.warn('Failed to update contact message with reply:', updErr);
        if (sendInfo && sendInfo.error) {
          return res.json({ message: 'Reply saved, but email send failed', info: sendInfo });
        }
        if (sendInfo && sendInfo.info) {
          return res.json({ message: 'Reply sent', info: sendInfo.info });
        }
        return res.json({ message: 'Reply saved (email not sent - SMTP not configured)' });
      });
    };

    if (!smtpHost || !smtpPort || !smtpUser || !smtpPass || !sender) {
      console.warn('SMTP not configured — saving reply without sending email');
      return finalize();
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: Number(smtpPort),
      secure: Number(smtpPort) === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    });

    const mailOptions = {
      from: sender,
      to: recipientEmail,
      subject: `Reply from PharmaCare`,
      text: `Hello ${recipientName},\n\n${reply}\n\n---\nThis is a reply from PharmaCare support.`,
      html: `<p>Hello ${recipientName},</p><p>${reply.replace(/\n/g, '<br/>')}</p><hr/><p>This is a reply from PharmaCare support.</p>`
    };

    transporter.sendMail(mailOptions, (mailErr, info) => {
      if (mailErr) {
        console.error('Error sending reply email:', mailErr);
        return finalize({ error: mailErr.toString() });
      }
      return finalize({ info });
    });
  });
});

// For Gemini-only mode: hoisted handler used by both `/api/chatbot` and `/api/chatbot-gemini`.
async function handleGeminiChat(req, res) {
  try {
    let { message } = req.body || {};
    let prescriptionText = req.body?.prescriptionText || '';

    // If an image is uploaded, run OCR to extract text
    if (req.file) {
      try {
        if (!ocrReady) console.warn('OCR worker not ready yet — processing may be slow or fail');

        const recognizeWithTimeout = (path, ms = process.env.OCR_TIMEOUT_MS ? Number(process.env.OCR_TIMEOUT_MS) : 8000) => {
          return Promise.race([
            ocrWorker.recognize(path).then(r => (r && r.data && r.data.text) ? r.data.text : ''),
            new Promise((_, reject) => setTimeout(() => reject(new Error('OCR timeout')), ms))
          ]);
        };

        let text = '';
        try {
          text = await recognizeWithTimeout(req.file.path);
        } catch (ocrErr) {
          console.warn('OCR recognize timed out or failed:', ocrErr.message || ocrErr);
          text = '';
        }

        if (text) prescriptionText = (prescriptionText ? prescriptionText + '\n' : '') + String(text || '');
      } catch (ocrErr) {
        console.error('OCR error:', ocrErr);
      } finally {
        fs.unlink(req.file.path, () => {});
      }
    }

    if (!message && !prescriptionText) {
      return res.status(400).json({ message: 'Provide a message, prescriptionText, or an image' });
    }

    // Build a prompt for the LLM
    const promptParts = [];
    if (message) promptParts.push(`User: ${message}`);
    if (prescriptionText) promptParts.push(`PrescriptionText: ${prescriptionText}`);
    promptParts.push('Instructions: Extract medication names from prescription text when present. Answer user questions about product availability, and for medical dosing always include a disclaimer and recommend consulting a licensed pharmacist or physician. Do NOT provide definitive medical advice.');
    const prompt = promptParts.join('\n\n');

    const geminiUrl = process.env.GEMINI_API_URL;
    const geminiKey = process.env.GEMINI_API_KEY;
    const geminiModel = process.env.GEMINI_MODEL || 'gemini-1';

    if (!geminiUrl || !geminiKey) {
      return res.status(500).json({ message: 'Gemini integration not configured. Set GEMINI_API_URL and GEMINI_API_KEY in env.' });
    }

    const body = { model: geminiModel, prompt };

    const headers = {
      'Authorization': `Bearer ${geminiKey}`,
      'Content-Type': 'application/json'
    };

    let llmRes = null;
    let resp = null;
    try {
      // If provider is Google Generative API, use its request shape and API key handling
      const provider = (process.env.GEMINI_PROVIDER || '').toLowerCase();
      if (provider === 'google' || (geminiUrl && geminiUrl.includes('generativelanguage.googleapis.com'))) {
        // Google GenAI: POST to https://generativelanguage.googleapis.com/v1/models/{model}:generate?key=API_KEY
        const googleUrl = `https://generativelanguage.googleapis.com/v1/models/${geminiModel}:generate?key=${encodeURIComponent(geminiKey)}`;
        const googleBody = {
          prompt: {
            text: prompt
          }
        };
        resp = await axios.post(googleUrl, googleBody, { headers: { 'Content-Type': 'application/json' }, timeout: 20000 });
        llmRes = resp.data;
      } else {
        resp = await axios.post(geminiUrl, body, { headers, timeout: 20000 });
        llmRes = resp.data;
      }
    } catch (e) {
      console.error('Gemini request error:', e && e.toString ? e.toString() : e);
      return res.status(502).json({ message: 'Failed to contact Gemini API', error: e && e.toString ? e.toString() : String(e) });
    }

    const extractText = (d) => {
      if (!d) return '';
      if (typeof d === 'string') return d;
      if (d.output_text) return d.output_text;
      if (d.reply) return d.reply;
      if (d.text) return d.text;
      // Google Generative API shapes
      if (d.candidates && Array.isArray(d.candidates) && d.candidates[0]) {
        const c = d.candidates[0];
        if (c.output) return c.output;
        if (c.output_text) return c.output_text;
        if (c.content && Array.isArray(c.content)) {
          // content pieces may contain `text`
          return c.content.map(p => p.text || '').join('\n');
        }
        if (c.text) return c.text;
      }
      if (d.choices && Array.isArray(d.choices) && d.choices[0]) {
        if (d.choices[0].text) return d.choices[0].text;
        if (d.choices[0].message && d.choices[0].message.content) return d.choices[0].message.content;
      }
      try { return JSON.stringify(d); } catch (e) { return String(d); }
    };

    let replyText = extractText(llmRes);

    // Try to detect medication names by comparing to product list and include prices
    db.query('SELECT name, description, price FROM products', (err, results) => {
      if (err) return res.status(500).json({ message: 'Database error', error: err });

      const medications = [];
      const textLower = String(prescriptionText || replyText || '').toLowerCase();
      results.forEach((row) => {
        const nameLower = String(row.name).toLowerCase();
        const simpleName = nameLower.split(' ')[0];
        if (textLower.includes(simpleName) || textLower.includes(nameLower)) {
          medications.push({ name: row.name, description: row.description, price: row.price });
        }
      });

      // Detect whether the user is asking about price (English and simple Arabic keywords)
      const userMsg = String(req.body?.message || message || '').toLowerCase();
      const priceIntent = /price|how much|cost|si3r|سعر|كم/.test(userMsg) || /price|how much|cost|si3r|سعر|كم/.test(replyText.toLowerCase());

      if (priceIntent && medications.length > 0) {
        const currency = process.env.DEFAULT_CURRENCY || 'USD';
        const priceLines = medications.map(m => `${m.name}: ${Number(m.price).toFixed(2)} ${currency}`);
        replyText = `${replyText}\n\nPrice information:\n${priceLines.join('\n')}`;
      }

      return res.json({ reply: replyText, llmRaw: llmRes, medications, disclaimer: 'I am not a medical professional. For dosing and medical advice, consult a licensed pharmacist or physician.' });
    });

  } catch (err) {
    console.error('Chatbot-Gemini error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// Register Gemini-only routes
app.post('/api/chatbot', upload.single('image'), handleGeminiChat);
app.post('/api/chatbot-gemini', upload.single('image'), handleGeminiChat);

// === Gemini-backed chatbot proxy ===
// This endpoint forwards user input to a configured Gemini-compatible API.
// Required env vars: GEMINI_API_KEY, GEMINI_API_URL. Optionally GEMINI_MODEL.
app.post('/api/chatbot-gemini', upload.single('image'), async (req, res) => {
  try {
    let { message } = req.body || {};
    let prescriptionText = req.body?.prescriptionText || '';

    // If an image is uploaded, run OCR to extract text
    if (req.file) {
      try {
        if (!ocrReady) console.warn('OCR worker not ready yet — processing may be slow or fail');

        const recognizeWithTimeout = (path, ms = process.env.OCR_TIMEOUT_MS ? Number(process.env.OCR_TIMEOUT_MS) : 8000) => {
          return Promise.race([
            ocrWorker.recognize(path).then(r => (r && r.data && r.data.text) ? r.data.text : ''),
            new Promise((_, reject) => setTimeout(() => reject(new Error('OCR timeout')), ms))
          ]);
        };

        let text = '';
        try {
          text = await recognizeWithTimeout(req.file.path);
        } catch (ocrErr) {
          console.warn('OCR recognize timed out or failed:', ocrErr.message || ocrErr);
          text = '';
        }

        if (text) prescriptionText = (prescriptionText ? prescriptionText + '\n' : '') + String(text || '');
      } catch (ocrErr) {
        console.error('OCR error:', ocrErr);
      } finally {
        fs.unlink(req.file.path, () => {});
      }
    }

    if (!message && !prescriptionText) {
      return res.status(400).json({ message: 'Provide a message, prescriptionText, or an image' });
    }

    // Build a prompt for the LLM
    const promptParts = [];
    if (message) promptParts.push(`User: ${message}`);
    if (prescriptionText) promptParts.push(`PrescriptionText: ${prescriptionText}`);
    promptParts.push('Instructions: Extract medication names from prescription text when present. Answer user questions about product availability, and for medical dosing always include a disclaimer and recommend consulting a licensed pharmacist or physician. Do NOT provide definitive medical advice.');
    const prompt = promptParts.join('\n\n');

    const geminiUrl = process.env.GEMINI_API_URL;
    const geminiKey = process.env.GEMINI_API_KEY;
    const geminiModel = process.env.GEMINI_MODEL || 'gemini-1';

    if (!geminiUrl || !geminiKey) {
      return res.status(500).json({ message: 'Gemini integration not configured. Set GEMINI_API_URL and GEMINI_API_KEY in env.' });
    }

    // Attempt a generic request — many Gemini-compatible APIs accept a JSON body
    // with a model and prompt or input. Adjust as needed for your provider.
    const body = { model: geminiModel, prompt };

    const headers = {
      'Authorization': `Bearer ${geminiKey}`,
      'Content-Type': 'application/json'
    };

    let llmRes = null;
    let resp = null;
    try {
      resp = await axios.post(geminiUrl, body, { headers, timeout: 20000 });
      llmRes = resp.data;
    } catch (e) {
      console.error('Gemini request error:', e && e.toString ? e.toString() : e);
      return res.status(502).json({ message: 'Failed to contact Gemini API', error: e && e.toString ? e.toString() : String(e) });
    }

    // Extract text from common response shapes
    const extractText = (d) => {
      if (!d) return '';
      if (typeof d === 'string') return d;
      if (d.output_text) return d.output_text;
      if (d.reply) return d.reply;
      if (d.text) return d.text;
      if (d.choices && Array.isArray(d.choices) && d.choices[0]) {
        if (d.choices[0].text) return d.choices[0].text;
        if (d.choices[0].message && d.choices[0].message.content) return d.choices[0].message.content;
      }
      // Fallback: stringify
      try { return JSON.stringify(d); } catch (e) { return String(d); }
    };

    let replyText = extractText(llmRes);

    // Optionally, try to detect medication names by comparing to product list and include prices
    db.query('SELECT name, description, price FROM products', (err, results) => {
      if (err) return res.status(500).json({ message: 'Database error', error: err });

      const medications = [];
      const textLower = String(prescriptionText || replyText || '').toLowerCase();
      results.forEach((row) => {
        const nameLower = String(row.name).toLowerCase();
        const simpleName = nameLower.split(' ')[0];
        if (textLower.includes(simpleName) || textLower.includes(nameLower)) {
          medications.push({ name: row.name, description: row.description, price: row.price });
        }
      });

      const userMsg = String(req.body?.message || message || '').toLowerCase();
      const priceIntent = /price|how much|cost|si3r|سعر|كم/.test(userMsg) || /price|how much|cost|si3r|سعر|كم/.test(replyText.toLowerCase());

      if (priceIntent && medications.length > 0) {
        const currency = process.env.DEFAULT_CURRENCY || 'USD';
        const priceLines = medications.map(m => `${m.name}: ${Number(m.price).toFixed(2)} ${currency}`);
        replyText = `${replyText}\n\nPrice information:\n${priceLines.join('\n')}`;
      }

      return res.json({ reply: replyText, llmRaw: llmRes, medications, disclaimer: 'I am not a medical professional. For dosing and medical advice, consult a licensed pharmacist or physician.' });
    });

  } catch (err) {
    console.error('Chatbot-Gemini error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
