# PharmaCare Backend - Setup Guide

## Prerequisites

### 1. Install MySQL
**Option A: XAMPP (Recommended for Development)**
1. Download from: https://www.apachefriends.org/download.html
2. Install XAMPP
3. Open XAMPP Control Panel
4. Start "MySQL" service

**Option B: MySQL Community Server**
1. Download from: https://dev.mysql.com/downloads/mysql/
2. Install MySQL Server
3. Remember your root password

### 2. Create Database

**If using XAMPP:**
1. Open http://localhost/phpmyadmin
2. Click "New" to create database
3. Name it: `pharmacare_db`
4. Click "Create"
5. Go to "SQL" tab
6. Copy and paste content from `database.sql`
7. Click "Go"

**If using MySQL command line:**
```bash
mysql -u root -p
# Enter your password
```

Then run:
```sql
source C:/Users/Ahmad/Desktop/csci426/pharmacy-store/backend/database.sql
```

Or copy-paste the SQL from database.sql file.

## Running the Backend

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment
Edit `.env` file and update MySQL password if you set one:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=YOUR_MYSQL_PASSWORD
DB_NAME=pharmacare_db
PORT=5000
JWT_SECRET=pharmacare-2025-secret-key-csci426-project
```

### 3. Start the Server
```bash
npm start
```

You should see:
```
✅ Connected to MySQL database
🚀 Server running on http://localhost:5000
```

## Testing the API

### Test with Browser
Open: http://localhost:5000

You should see:
```json
{"message": "PharmaCare API is running!"}
```

### Test Endpoints

**Get all products:**
```
GET http://localhost:5000/api/products
```

**Register new user:**
```
POST http://localhost:5000/api/auth/register
Body: {
  "name": "Test User",
  "email": "test@test.com",
  "password": "test123",
  "phone": "+961 70 123 456"
}
```

**Login:**
```
POST http://localhost:5000/api/auth/login
Body: {
  "email": "test@test.com",
  "password": "test123"
}
```

## API Endpoints Summary

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Products (Public)
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID

### Products (Admin - Requires Token)
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Orders (Requires Token)
- `POST /api/orders` - Create order
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get order details

### Contact
- `POST /api/contact` - Submit contact message

## Troubleshooting

### Error: "Database connection error"
- Make sure MySQL is running (check XAMPP or Services)
- Verify credentials in `.env` file
- Test MySQL connection: `mysql -u root -p`

### Error: "Access denied for user 'root'"
- Update `DB_PASSWORD` in `.env` with your MySQL password

### Port 5000 already in use
- Change `PORT=5001` in `.env` file
- Or stop the process using port 5000

## Next Steps

1. ✅ Install MySQL
2. ✅ Create database using `database.sql`
3. ✅ Update `.env` file
4. ✅ Run `npm install` in backend folder
5. ✅ Start backend with `npm start`
6. ⏭️ Connect React frontend to backend API
7. ⏭️ Test all features
8. ⏭️ Deploy to Render or Railway
