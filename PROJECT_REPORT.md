# PharmaCare Project Report - Phase 1
## CSCI426: Advanced Web Programming

---

## Title Page

**Project Title:** PharmaCare - Online Pharmacy Store  
**Course:** CSCI426 - Advanced Web Programming  
**Phase:** 1 (Frontend Development)  
**Date:** December 2025  
**Team Members:**
- Student Name 1 - Student ID 1
- Student Name 2 - Student ID 2 (if applicable)

**GitHub Repository:** https://github.com/yourusername/pharmacy-store  
**Live Demo:** [To be added after deployment]

---

## Abstract

PharmaCare is a modern, responsive web application designed to provide a convenient online platform for purchasing pharmaceutical products, cosmetics, vitamins, and personal care items. This project represents Phase 1 of a two-phase development plan, focusing on frontend implementation using React.js.

The application features a user-friendly interface with five main pages: Home, About, Products, Contact, and Shopping Cart. Users can browse products by category, search for specific items, add products to their cart, and manage their orders. The design is fully responsive, ensuring optimal viewing experience across desktop, tablet, and mobile devices.

Key technologies used include React.js for component-based architecture, React Router for navigation, and Tailwind CSS for responsive styling. The application demonstrates modern web development practices including component composition, state management, local storage integration, and responsive design principles.

---

## System Design

### Architecture Overview

The application follows a single-page application (SPA) architecture with client-side routing:

```
┌─────────────────────────────────────┐
│         User Interface              │
│  (React Components + Tailwind CSS)  │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│      React Router                   │
│  (Navigation & Route Management)    │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│      State Management               │
│  (React Hooks + Local Storage)      │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│      Data Layer                     │
│  (Static Product Data)              │
└─────────────────────────────────────┘
```

### Component Structure

```
App (Root Component)
├── Navbar (Navigation)
├── Pages
│   ├── Home
│   ├── About
│   ├── Products
│   ├── Contact
│   └── Cart
└── Footer
```

### Data Flow

1. **Product Listing:** Static product data → Products component → UI
2. **Cart Management:** User actions → State update → Local storage → UI update
3. **Form Submission:** User input → Form validation → State update → Success message

### Page Structure

#### 1. Home Page
- Hero section with call-to-action
- Product categories grid (4 categories)
- Features section (3 benefits)
- Responsive layout with mobile hamburger menu

#### 2. About Page
- Company overview
- Mission and vision statements
- Core values (3 cards)
- Team introduction

#### 3. Products Page
- Search bar with real-time filtering
- Category filter buttons (5 categories)
- Product grid (16 products)
- Add to cart functionality
- Stock status indicators

#### 4. Contact Page
- Contact form with validation
- Company contact information
- Location and hours
- Form submission with success message

#### 5. Cart Page
- Cart items list with product details
- Quantity adjustment controls
- Remove item functionality
- Order summary with calculations
- Empty cart state

### State Management

The application uses React Hooks for state management:
- `useState` for component-level state
- `useEffect` for side effects and local storage sync
- Props drilling for passing cart data to child components

### Responsive Design Breakpoints

- Mobile: 320px - 767px
- Tablet: 768px - 1023px
- Desktop: 1024px - 1279px
- Large Desktop: 1280px+

---

## Technologies Used

### Frontend Framework
- **React.js (v18.3.1):** Component-based JavaScript library for building user interfaces
- **React Router DOM (v7.x):** Declarative routing for React applications

### Styling
- **Tailwind CSS (v3.4.1):** Utility-first CSS framework for rapid UI development
- **PostCSS:** CSS processing tool
- **Autoprefixer:** Automatically adds vendor prefixes to CSS

### Development Tools
- **Create React App:** Project bootstrapping and build configuration
- **Node.js & npm:** Runtime environment and package management
- **Git:** Version control system
- **VS Code:** Integrated development environment

### Additional Libraries
- **Web Vitals:** Performance monitoring

---

## Code Snippets

### 1. App Component with Routing

```javascript
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
// ... other imports

function App() {
  const [cartItems, setCartItems] = useState([]);

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('pharmacyCart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem('pharmacyCart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product) => {
    const existingItem = cartItems.find(item => item.id === product.id);
    if (existingItem) {
      setCartItems(cartItems.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCartItems([...cartItems, { ...product, quantity: 1 }]);
    }
  };

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar cartCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)} />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products onAddToCart={addToCart} />} />
            {/* ... other routes */}
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}
```

### 2. Responsive Navbar Component

```javascript
function Navbar({ cartCount }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-primary text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold">PharmaCare</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="hover:text-gray-200">Home</Link>
            <Link to="/products" className="hover:text-gray-200">Products</Link>
            <Link to="/cart" className="relative">
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile menu button */}
          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden">
            {/* Hamburger icon */}
          </button>
        </div>
      </div>
    </nav>
  );
}
```

### 3. Product Filtering Logic

```javascript
function Products({ onAddToCart }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = allProducts.filter(product => {
    const matchesCategory = selectedCategory === 'All' || 
                           product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase()
                                 .includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div>
      <input
        type="text"
        placeholder="Search products..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {/* Category filters and product grid */}
    </div>
  );
}
```

### 4. Cart Management

```javascript
const updateQuantity = (productId, newQuantity) => {
  if (newQuantity <= 0) {
    removeFromCart(productId);
  } else {
    setCartItems(cartItems.map(item =>
      item.id === productId
        ? { ...item, quantity: newQuantity }
        : item
    ));
  }
};

const total = cartItems.reduce((sum, item) => 
  sum + (item.price * item.quantity), 0
);
```

---

## Features Implementation

### Phase 1 Completed Features ✅

1. **Home Page**
   - Responsive hero section
   - Category showcase (4 cards)
   - Features section (3 benefits)
   - Call-to-action buttons

2. **About Page**
   - Company information
   - Mission/Vision statements
   - Core values display
   - Team section

3. **Products Page**
   - 16 products across 4 categories
   - Real-time search functionality
   - Category filtering
   - Add to cart with stock validation
   - Responsive product grid

4. **Contact Page**
   - Contact form with validation
   - Company contact details
   - Working hours display
   - Success message handling

5. **Shopping Cart**
   - Cart items display
   - Quantity controls (+/-)
   - Remove item functionality
   - Order summary with tax calculation
   - Local storage persistence
   - Empty cart state

6. **Navigation**
   - Responsive navbar
   - Mobile hamburger menu
   - Cart badge with item count
   - Active page highlighting

7. **Additional Features**
   - Local storage integration
   - Responsive design (mobile-first)
   - Loading states
   - Form validation
   - Error handling

---

## Screenshots

### Desktop View

**Home Page:**
[Screenshot showing hero section, categories, and features]

**Products Page:**
[Screenshot showing product grid with filters and search]

**Shopping Cart:**
[Screenshot showing cart items and order summary]

### Mobile View

**Mobile Navigation:**
[Screenshot showing hamburger menu]

**Mobile Products:**
[Screenshot showing responsive product grid]

---

## Challenges and Solutions

### Challenge 1: State Management Across Components
**Problem:** Sharing cart state between multiple components  
**Solution:** Lifted state to App component and passed down via props

### Challenge 2: Local Storage Sync
**Problem:** Cart data persistence across page refreshes  
**Solution:** Implemented useEffect hooks to sync with localStorage

### Challenge 3: Responsive Design
**Problem:** Creating mobile-friendly layouts  
**Solution:** Used Tailwind's responsive utilities and mobile-first approach

### Challenge 4: Product Filtering
**Problem:** Multiple filter criteria (category + search)  
**Solution:** Implemented combined filter logic using JavaScript array methods

---

## Testing

### Manual Testing Performed

1. **Navigation Testing**
   - ✅ All links work correctly
   - ✅ Active page highlighting
   - ✅ Mobile menu toggle

2. **Product Functionality**
   - ✅ Search filter works
   - ✅ Category filter works
   - ✅ Add to cart updates count
   - ✅ Out-of-stock items disabled

3. **Cart Operations**
   - ✅ Add items to cart
   - ✅ Update quantities
   - ✅ Remove items
   - ✅ Calculate totals correctly
   - ✅ Persist in local storage

4. **Responsive Design**
   - ✅ Mobile (320px - 767px)
   - ✅ Tablet (768px - 1023px)
   - ✅ Desktop (1024px+)

5. **Form Validation**
   - ✅ Required fields validation
   - ✅ Email format validation
   - ✅ Success message display

---

## Future Enhancements (Phase 2)

### Backend Development
- Node.js server setup
- RESTful API endpoints
- MySQL database integration

### Database Schema
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  password VARCHAR(255),
  created_at TIMESTAMP
);

CREATE TABLE products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100),
  category VARCHAR(50),
  price DECIMAL(10, 2),
  description TEXT,
  stock INT,
  image_url VARCHAR(255)
);

CREATE TABLE orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  total DECIMAL(10, 2),
  status VARCHAR(50),
  created_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Planned Features
- User authentication (Login/Signup)
- Order management system
- Admin dashboard
- Email notifications
- Payment gateway integration
- Order tracking
- User profile management
- Product reviews and ratings

---

## Conclusion

Phase 1 of the PharmaCare project successfully delivers a fully functional, responsive frontend application that meets all project requirements. The application demonstrates modern web development practices using React.js and provides an excellent foundation for Phase 2 backend integration.

### Key Achievements
- ✅ 5+ responsive pages implemented
- ✅ Complete shopping cart functionality
- ✅ Product search and filtering
- ✅ Mobile-first responsive design
- ✅ Clean, maintainable code structure
- ✅ Git version control with regular commits
- ✅ Comprehensive documentation

### Learning Outcomes
- Mastered React.js component architecture
- Implemented client-side routing with React Router
- Applied responsive design principles with Tailwind CSS
- Practiced state management and data flow
- Gained experience with version control using Git

The project is ready for deployment to GitHub Pages, Vercel, or Netlify, and provides a solid foundation for Phase 2 backend development with Node.js and MySQL.

---

## References

1. React Documentation - https://react.dev
2. React Router Documentation - https://reactrouter.com
3. Tailwind CSS Documentation - https://tailwindcss.com
4. MDN Web Docs - https://developer.mozilla.org
5. CSCI426 Course Materials

---

**Project Repository:** https://github.com/yourusername/pharmacy-store  
**Submission Date:** [Add date]  
**Course:** CSCI426 - Advanced Web Programming  
**Institution:** Department of Computer Science and Information Technology
