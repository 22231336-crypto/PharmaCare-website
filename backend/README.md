# PharmaCare Backend API

## Phase 2 - Backend Development

### Setup Instructions

#### 1. Install MySQL
Make sure you have MySQL installed and running on your computer.

#### 2. Create Database
Run the SQL script to create the database and tables:
```bash
mysql -u root -p < database.sql
```

Or open MySQL Workbench and run the `database.sql` file.

#### 3. Install Dependencies
```bash
cd backend
npm install
```

#### 4. Configure Environment
The `.env` file is already configured with default values:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=pharmacare_db
PORT=5000
```

Update `DB_PASSWORD` if your MySQL has a password.

#### 5. Start the Server
```bash
npm start
```

Or for development with auto-restart:
```bash
npm run dev
```

The server will run on: **http://localhost:5000**

---

## API Endpoints

### Authentication

#### Register (Signup)
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+961 70 123 456"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

Returns a JWT token to use for authenticated requests.

---

### Products (CRUD)

#### Get All Products
```http
GET /api/products
```

#### Get Product by ID
```http
GET /api/products/:id
```

#### Create Product (Authenticated)
```http
POST /api/products
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "name": "New Medicine",
  "category": "Medicines",
  "price": 15.99,
  "description": "Product description",
  "stock": 50,
  "image": "💊"
}
```

#### Update Product (Authenticated)
```http
PUT /api/products/:id
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "name": "Updated Name",
  "category": "Medicines",
  "price": 20.99,
  "description": "Updated description",
  "stock": 75
}
```

#### Delete Product (Authenticated)
```http
DELETE /api/products/:id
Authorization: Bearer YOUR_JWT_TOKEN
```

---

### Orders

#### Create Order (Authenticated)
```http
POST /api/orders
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "items": [
    {
      "id": 1,
      "quantity": 2,
      "price": 5.99
    }
  ],
  "total": 11.98
}
```

#### Get User Orders (Authenticated)
```http
GET /api/orders
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Get Order by ID (Authenticated)
```http
GET /api/orders/:id
Authorization: Bearer YOUR_JWT_TOKEN
```

---

### Contact

#### Submit Contact Message
```http
POST /api/contact
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+961 70 123 456",
  "message": "Your message here"
}
```

---

## Testing the API

### Using Postman or Thunder Client

1. **Test Connection**
   - GET http://localhost:5000/

2. **Register a User**
   - POST http://localhost:5000/api/auth/register
   - Body: { "name": "Test User", "email": "test@test.com", "password": "test123" }

3. **Login**
   - POST http://localhost:5000/api/auth/login
   - Body: { "email": "test@test.com", "password": "test123" }
   - Copy the token from response

4. **Get Products**
   - GET http://localhost:5000/api/products

5. **Create Order**
   - POST http://localhost:5000/api/orders
   - Headers: Authorization: Bearer YOUR_TOKEN
   - Body: { "items": [...], "total": 50.00 }

---

## Database Schema

### Users Table
```sql
- id (Primary Key)
- name
- email (Unique)
- password (Hashed)
- phone
- created_at
- updated_at
```

### Products Table
```sql
- id (Primary Key)
- name
- category
- price
- description
- stock
- image
- created_at
- updated_at
```

### Orders Table
```sql
- id (Primary Key)
- user_id (Foreign Key → users)
- total
- status
- created_at
- updated_at
```

### Order Items Table
```sql
- id (Primary Key)
- order_id (Foreign Key → orders)
- product_id (Foreign Key → products)
- quantity
- price
```

### Contact Messages Table
```sql
- id (Primary Key)
- name
- email
- phone
- message
- status
- created_at
```

---

## Security Features

- ✅ Password hashing with bcrypt
- ✅ JWT authentication
- ✅ CORS enabled
- ✅ SQL injection prevention (parameterized queries)
- ✅ Input validation

---

## Technologies Used

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MySQL2** - Database driver
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variables

---

## Project Structure

```
backend/
├── server.js           # Main server file
├── database.sql        # Database schema
├── package.json        # Dependencies
├── .env               # Environment variables
├── .env.example       # Example environment file
└── README.md          # This file
```

---

## Troubleshooting

### MySQL Connection Error
- Make sure MySQL is running
- Check username and password in `.env`
- Verify database `pharmacare_db` exists

### Port Already in Use
- Change PORT in `.env` file
- Or kill process using port 5000

### JWT Token Errors
- Make sure to include token in Authorization header
- Format: `Authorization: Bearer YOUR_TOKEN`

## Gemini (LLM) Integration

The backend can forward chatbot requests to a Gemini-compatible LLM. To enable it, set these environment variables (in `backend/.env` or your environment):

```
GEMINI_API_URL=https://your-gemini-endpoint.example.com/v1/generate
GEMINI_API_KEY=your_api_key_here
GEMINI_MODEL=gemini-1   # optional, default: gemini-1

# If you use Google Generative API, set provider and model like:
```
GEMINI_PROVIDER=google
GEMINI_MODEL=gemini-2.5-flash   # or models/gemini-2.5-flash depending on provider
# If using Google API key the backend will call:
# https://generativelanguage.googleapis.com/v1/models/{GEMINI_MODEL}:generate?key={GEMINI_API_KEY}
```
```

After setting the vars, restart the backend. Use the endpoint:

```
POST /api/chatbot-gemini
```

The endpoint accepts the same fields as `/api/chatbot`: `message`, `prescriptionText`, and an optional `image` file (multipart/form-data). The server will run OCR on uploaded images, build a prompt, forward to the configured Gemini URL, and return a JSON response containing `reply`, `llmRaw`, `medications`, and a `disclaimer`.

Note: The integration attempts a generic JSON body { model, prompt } when calling the configured `GEMINI_API_URL`. If your provider requires a different request shape, update `server.js` to match the provider's API format.

---

**Phase 2 Complete!** 🎉
