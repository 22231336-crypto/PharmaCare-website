# PharmaCare - Phase 2 Report
## Backend Development with Node.js & MySQL

---

**Course:** CSCI426 - Advanced Web Programming  
**Project Phase:** 2 (Backend Integration)  
**Date:** December 2025  
**Developed by:** Ahmad Seif Deen & Rayan Zaarour

---

## Table of Contents

1. [Abstract](#abstract)
2. [System Architecture](#system-architecture)
3. [Technologies Used](#technologies-used)
4. [Database Design](#database-design)
5. [API Endpoints](#api-endpoints)
6. [Implementation](#implementation)
7. [Frontend Integration](#frontend-integration)
8. [Testing](#testing)
9. [Conclusion](#conclusion)

---

## Abstract

PharmaCare Phase 2 introduces a complete backend system using Node.js, Express.js, and MySQL database. This phase transforms the static frontend into a fully functional full-stack web application with user authentication, database integration, and RESTful API architecture.

The backend provides secure user authentication using JWT tokens, CRUD operations for products and orders, contact message storage, and proper data validation. The system follows industry best practices for API design, security, and database relationships.

---

## System Architecture

### Full-Stack Architecture

```
┌─────────────────────────────────────────────────────┐
│              Client (Browser)                       │
│                                                     │
│  React.js Frontend (Port 3000)                     │
│  - UI Components                                    │
│  - API Service Layer                                │
│  - State Management                                 │
└──────────────────┬──────────────────────────────────┘
                   │
                   │ HTTP/HTTPS Requests
                   │ (JSON)
                   │
┌──────────────────▼──────────────────────────────────┐
│         Backend Server (Port 5000)                  │
│                                                     │
│  Node.js + Express.js                              │
│  ├── Authentication Middleware (JWT)               │
│  ├── API Routes                                     │
│  │   ├── /api/auth (Login/Register)               │
│  │   ├── /api/products (CRUD)                     │
│  │   ├── /api/orders (CRUD)                       │
│  │   └── /api/contact (Submit)                    │
│  ├── Database Connection (mysql2)                  │
│  └── Error Handling                                │
└──────────────────┬──────────────────────────────────┘
                   │
                   │ SQL Queries
                   │
┌──────────────────▼──────────────────────────────────┐
│         MySQL Database (XAMPP)                      │
│                                                     │
│  pharmacare_db                                      │
│  ├── users                                          │
│  ├── products                                       │
│  ├── orders                                         │
│  ├── order_items                                    │
│  └── contact_messages                               │
└─────────────────────────────────────────────────────┘
```

### Request Flow

1. **User Action** → Frontend sends HTTP request
2. **API Service** → Formats request with headers/body
3. **Express Server** → Receives and validates request
4. **Authentication** → Verifies JWT token (if required)
5. **Database Query** → Executes SQL operation
6. **Response** → Returns JSON data to frontend
7. **UI Update** → Frontend displays result

---

## Technologies Used

### Backend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | Latest | JavaScript runtime environment |
| **Express.js** | 4.18.2 | Web application framework |
| **MySQL** | 8.0+ | Relational database |
| **mysql2** | 3.6.5 | MySQL client for Node.js |
| **bcryptjs** | 2.4.3 | Password hashing |
| **jsonwebtoken** | 9.0.2 | JWT authentication |
| **cors** | 2.8.5 | Cross-origin requests |
| **dotenv** | 16.3.1 | Environment variables |

### Development Tools

- **XAMPP**: Local MySQL server
- **phpMyAdmin**: Database management
- **Postman/Thunder Client**: API testing
- **nodemon**: Auto-restart server (dev)

---

## Database Design

### Entity Relationship Diagram

```
┌─────────────┐
│    users    │
│─────────────│
│ id (PK)     │
│ name        │
│ email       │◄─────┐
│ password    │      │
│ phone       │      │
│ created_at  │      │
│ updated_at  │      │
└─────────────┘      │
                     │
                     │ Foreign Key
                     │
┌─────────────┐      │
│   orders    │      │
│─────────────│      │
│ id (PK)     │      │
│ user_id (FK)├──────┘
│ total       │
│ status      │◄─────┐
│ created_at  │      │
│ updated_at  │      │
└─────────────┘      │
                     │
                     │ Foreign Key
                     │
┌──────────────┐     │
│ order_items  │     │
│──────────────│     │
│ id (PK)      │     │
│ order_id (FK)├─────┘
│ product_id   ├─────┐
│ quantity     │     │
│ price        │     │
└──────────────┘     │
                     │
                     │ Foreign Key
                     │
┌─────────────┐      │
│  products   │      │
│─────────────│      │
│ id (PK)     │◄─────┘
│ name        │
│ category    │
│ price       │
│ description │
│ stock       │
│ image       │
│ created_at  │
│ updated_at  │
└─────────────┘

┌───────────────────┐
│ contact_messages  │
│───────────────────│
│ id (PK)          │
│ name             │
│ email            │
│ phone            │
│ message          │
│ status           │
│ created_at       │
└───────────────────┘
```

### Database Schema

#### users Table
```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### products Table
```sql
CREATE TABLE products (
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
```

#### orders Table
```sql
CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

#### order_items Table
```sql
CREATE TABLE order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);
```

#### contact_messages Table
```sql
CREATE TABLE contact_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  message TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'new',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## API Endpoints

### Authentication Endpoints

#### POST /api/auth/register
Register a new user

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+961 70 123 456"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "userId": 1
}
```

#### POST /api/auth/login
Login existing user

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+961 70 123 456"
  }
}
```

### Products Endpoints

#### GET /api/products
Get all products (Public)

**Response:**
```json
[
  {
    "id": 1,
    "name": "Paracetamol 500mg",
    "category": "Medicines",
    "price": 5.99,
    "description": "Pain relief and fever reducer",
    "stock": 100,
    "image": "/assets/paracetamol.jpg",
    "created_at": "2025-12-31T00:00:00.000Z",
    "updated_at": "2025-12-31T00:00:00.000Z"
  }
]
```

#### GET /api/products/:id
Get single product by ID (Public)

#### POST /api/products
Create new product (Requires Auth)

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "New Product",
  "category": "Medicines",
  "price": 10.99,
  "description": "Product description",
  "stock": 50,
  "image": "/assets/image.jpg"
}
```

#### PUT /api/products/:id
Update product (Requires Auth)

#### DELETE /api/products/:id
Delete product (Requires Auth)

### Orders Endpoints

#### POST /api/orders
Create new order (Requires Auth)

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "items": [
    { "id": 1, "quantity": 2, "price": 5.99 },
    { "id": 2, "quantity": 1, "price": 7.99 }
  ],
  "total": 19.97
}
```

**Response:**
```json
{
  "message": "Order created successfully",
  "orderId": 1
}
```

#### GET /api/orders
Get all user orders (Requires Auth)

#### GET /api/orders/:id
Get order details (Requires Auth)

### Contact Endpoint

#### POST /api/contact
Submit contact message (Public)

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+961 70 123 456",
  "message": "Hello, I have a question..."
}
```

**Response:**
```json
{
  "message": "Message sent successfully",
  "messageId": 1
}
```

---

## Implementation

### Server Configuration (server.js)

```javascript
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
});

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
```

### Authentication Middleware

```javascript
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ 
      message: 'Access denied. No token provided.' 
    });
  }
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ 
        message: 'Invalid token.' 
      });
    }
    req.user = user;
    next();
  });
};
```

### Password Hashing

```javascript
// Registration
const hashedPassword = await bcrypt.hash(password, 10);

// Login
const isValidPassword = await bcrypt.compare(password, user.password);
```

### Environment Variables (.env)

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=pharmacare_db

# Server Configuration
PORT=5000

# JWT Secret
JWT_SECRET=pharmacare-2025-secret-key-csci426-project
```

---

## Frontend Integration

### API Service (src/services/api.js)

```javascript
const API_URL = 'http://localhost:5000/api';

const getToken = () => localStorage.getItem('token');

export const authAPI = {
  register: async (userData) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return response.json();
  },

  login: async (credentials) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    const data = await response.json();
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

export const productsAPI = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/products`);
    return response.json();
  }
};
```

### Products Page Integration

```javascript
import { productsAPI } from '../services/api';

const [products, setProducts] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  fetchProducts();
}, []);

const fetchProducts = async () => {
  try {
    setLoading(true);
    const data = await productsAPI.getAll();
    setProducts(data);
  } catch (error) {
    console.error('Error fetching products:', error);
  } finally {
    setLoading(false);
  }
};
```

### Login Page

```javascript
const handleLogin = async (e) => {
  e.preventDefault();
  try {
    const response = await authAPI.login(formData);
    if (response.token) {
      navigate('/');
      window.location.reload();
    }
  } catch (error) {
    console.error('Login error:', error);
  }
};
```

---

## Testing

### API Testing Results

✅ **Authentication**
- User registration: SUCCESS
- User login: SUCCESS
- JWT token generation: SUCCESS
- Password hashing: SUCCESS

✅ **Products**
- GET all products: SUCCESS (16 products)
- GET product by ID: SUCCESS
- POST create product: SUCCESS (with auth)
- PUT update product: SUCCESS (with auth)
- DELETE product: SUCCESS (with auth)

✅ **Orders**
- POST create order: SUCCESS (with auth)
- GET user orders: SUCCESS (with auth)
- Order items relationship: SUCCESS

✅ **Contact**
- POST contact message: SUCCESS
- Data stored in database: SUCCESS

### Database Integration

✅ MySQL connection successful  
✅ All tables created  
✅ Foreign keys working  
✅ Sample data inserted (16 products)  
✅ Queries executing correctly

---

## Conclusion

### Phase 2 Achievements

✅ **Backend Requirements Met:**
- Node.js backend implemented
- Express.js RESTful API
- MySQL database integration
- CRUD operations functional
- User authentication (Login/Signup)

✅ **Database Requirements Met:**
- Multiple related entities (5 tables)
- Proper relationships (Foreign Keys)
- Data validation
- Error handling

✅ **Integration Requirements Met:**
- Frontend connected to backend
- API service layer created
- Authentication flow working
- Real-time data from database

### Technical Skills Demonstrated

- Node.js & Express.js development
- RESTful API design
- MySQL database design
- SQL queries and relationships
- JWT authentication
- Password hashing with bcrypt
- CORS configuration
- Environment variables
- Error handling
- Full-stack integration

### Security Features

- Password hashing (bcrypt)
- JWT token authentication
- Protected API routes
- SQL injection prevention (parameterized queries)
- CORS policy
- Environment variable protection

### Deployment Considerations

**Backend Deployment Options:**
- Render.com (Recommended)
- Railway.app
- Heroku
- DigitalOcean

**Database Options:**
- Railway MySQL
- PlanetScale
- AWS RDS
- Clever Cloud

---

## References

1. Node.js Documentation - https://nodejs.org/docs/
2. Express.js Guide - https://expressjs.com/
3. MySQL Documentation - https://dev.mysql.com/doc/
4. JWT.io - https://jwt.io/
5. bcrypt.js - https://www.npmjs.com/package/bcryptjs
6. CSCI426 Course Materials

---

**Project Status:** ✅ Phase 2 Complete  
**Grade Criteria Met:** Functionality, Code Quality, Database Integration, Documentation

---

*End of Phase 2 Report*
