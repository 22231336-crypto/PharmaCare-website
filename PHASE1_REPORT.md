# PharmaCare - Phase 1 Report
## Frontend Development with React.js

---

**Course:** CSCI426 - Advanced Web Programming  
**Project Phase:** 1 (Frontend)  
**Date:** December 2025  
**Developed by:** Ahmad Seif Deen & Rayan Zaarour

---

## Table of Contents

1. [Abstract](#abstract)
2. [System Design](#system-design)
3. [Technologies Used](#technologies-used)
4. [Implementation](#implementation)
5. [Features](#features)
6. [Code Snippets](#code-snippets)
7. [Screenshots](#screenshots)
8. [Conclusion](#conclusion)

---

## List of Tables

- Table 1 – Login functionality
- Table 2 – Search functionality
- Table 3 – Browse functionality
- Table 4 – Signup functionality
- Table 5 – Category selection functionality
- Table 6 – View products details
- Table 7 – Place order process
- Table 8 – About us information
- Table 9 – Contact form handling
- Table 10 – Checkout process
- Table 11 – Edit size/quantity/details
- Table 12 – Favorites and purchase history
- Table 13 – View messages
- Table 14 – View orders
- Table 15 – Manage admins
- Table 16 – Manage products and categories
- Table 17 – Payment methods
- Table 18 – Inventory data fields
- Table 19 – User roles and permissions
- Table 20 – API endpoints

## Abstract

PharmaCare Phase 1 is a fully responsive frontend web application built using React.js and Tailwind CSS. The application provides users with an intuitive interface to browse pharmaceutical products, manage a shopping cart, and contact the pharmacy. This phase demonstrates proficiency in modern frontend development, responsive design principles, and component-based architecture.

The application consists of five main pages: Home, About, Products, Contact, and Shopping Cart. Users can search and filter products by category, add items to their cart with persistent storage, and submit contact inquiries. The design follows a mobile-first approach and works seamlessly across all device sizes.

---

## System Design

### Application Architecture

```
PharmaCare Frontend
│
├── Components (Reusable)
│   ├── Navbar (Navigation + Cart Badge)
│   └── Footer (Contact Info + Links)
│
├── Pages (Routes)
│   ├── Home (Hero + Features)
│   ├── About (Company Info)
│   ├── Products (Browse + Search + Filter)
│   ├── Contact (Form + Info)
│   └── Cart (Manage Items + Checkout)
│
├── Data
│   └── products.js (Product Catalog)
│
└── State Management
    └── React Hooks (useState, useEffect)
```

### Component Hierarchy

```
App (Root)
│
├── Router (React Router DOM)
│   │
│   ├── Navbar Component
│   │   ├── Logo
│   │   ├── Navigation Links
│   │   └── Cart Badge (Item Count)
│   │
│   ├── Routes
│   │   ├── Home Page
│   │   ├── About Page
│   │   ├── Products Page
│   │   ├── Contact Page
│   │   └── Cart Page
│   │
│   └── Footer Component
│       ├── Contact Information
│       ├── Quick Links
│       └── Social Media
```

### Data Flow

1. **Product Data**: Static array stored in `src/data/products.js`
2. **Cart State**: Managed in `App.js` using `useState` hook
3. **Local Storage**: Cart data persists across sessions
4. **Props**: Data flows from parent to child components

---

## Technologies Used

### Core Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **React.js** | 19.2.3 | JavaScript library for building UI |
| **React Router DOM** | 7.11.0 | Client-side routing |
| **Tailwind CSS** | 3.4.1 | Utility-first CSS framework |
| **PostCSS** | 8.5.6 | CSS transformations |
| **Autoprefixer** | 10.4.23 | CSS vendor prefixes |

### Development Tools

- **Node.js**: JavaScript runtime
- **npm**: Package manager
- **Create React App**: Project bootstrapping
- **VS Code**: Code editor
- **Git**: Version control
- **GitHub Pages**: Deployment platform

---

## Implementation

### Project Structure

```
pharmacy-store/
├── public/
│   ├── index.html
│   ├── manifest.json
│   └── assets/
│       └── (product images)
├── src/
│   ├── components/
│   │   ├── Navbar.js
│   │   └── Footer.js
│   ├── pages/
│   │   ├── Home.js
│   │   ├── About.js
│   │   ├── Products.js
│   │   ├── Contact.js
│   │   └── Cart.js
│   ├── data/
│   │   └── products.js
│   ├── App.js
│   ├── App.css
│   ├── index.js
│   └── index.css
├── package.json
├── tailwind.config.js
└── README.md
```

### Routing Configuration

```javascript
<Router>
  <Navbar cartCount={cartItems.length} />
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/about" element={<About />} />
    <Route path="/products" element={<Products addToCart={addToCart} />} />
    <Route path="/contact" element={<Contact />} />
    <Route path="/cart" element={<Cart cartItems={cartItems} />} />
  </Routes>
  <Footer />
</Router>
```

### State Management

**Cart State in App.js:**
```javascript
const [cartItems, setCartItems] = useState([]);

// Load from localStorage on mount
useEffect(() => {
  const savedCart = localStorage.getItem('pharmacyCart');
  if (savedCart) {
    setCartItems(JSON.parse(savedCart));
  }
}, []);

// Save to localStorage on change
useEffect(() => {
  localStorage.setItem('pharmacyCart', JSON.stringify(cartItems));
}, [cartItems]);
```

---

## Features

### 1. Home Page
- **Hero Section**: Welcome banner with call-to-action
- **Featured Categories**: Medicines, Cosmetics, Vitamins, Personal Care
- **Benefits Section**: Quality Products, Fast Delivery, 24/7 Support
- **Responsive Design**: Adapts to mobile, tablet, desktop

### 2. About Page
- **Company Mission**: Healthcare accessibility
- **Team Information**: Founders and developers
- **Values**: Trust, Quality, Care, Innovation
- **Visual Design**: Professional layout with icons

### 3. Products Page (Dynamic)
- **Product Grid**: 16+ products displayed
- **Search Functionality**: Real-time search by name/description
- **Category Filters**: All, Medicines, Cosmetics, Vitamins, Personal Care
- **Product Cards**: Image, name, price, description, stock status
- **Add to Cart**: Button with feedback

### 4. Contact Page
- **Contact Form**: Name, email, phone, message fields
- **Form Validation**: Required field checks
- **Success Message**: Confirmation on submission
- **Contact Information**: Address, phone, email, hours
- **Map Section**: Location display

### 5. Shopping Cart
- **Cart Items List**: All added products
- **Quantity Controls**: Increase/decrease buttons
- **Remove Items**: Delete from cart
- **Total Calculation**: Automatic price sum
- **Empty State**: Message when cart is empty
- **Persistent Storage**: Data saved in localStorage

### 6. Responsive Navigation
- **Desktop Menu**: Horizontal navigation bar
- **Mobile Menu**: Hamburger icon with dropdown
- **Active Links**: Highlighted current page
- **Cart Badge**: Shows item count
- **Smooth Transitions**: Animated interactions

---

## Code Snippets

### Product Filtering Logic

```javascript
const [searchTerm, setSearchTerm] = useState('');
const [selectedCategory, setSelectedCategory] = useState('All');

const filteredProducts = products.filter(product => {
  const matchesSearch = 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase());
  
  const matchesCategory = 
    selectedCategory === 'All' || 
    product.category === selectedCategory;
  
  return matchesSearch && matchesCategory;
});
```

### Add to Cart Function

```javascript
const addToCart = (product) => {
  const existingItem = cartItems.find(item => item.id === product.id);
  
  if (existingItem) {
    // Update quantity if item exists
    setCartItems(cartItems.map(item =>
      item.id === product.id
        ? { ...item, quantity: item.quantity + 1 }
        : item
    ));
  } else {
    // Add new item to cart
    setCartItems([...cartItems, { ...product, quantity: 1 }]);
  }
  
  alert(`${product.name} added to cart!`);
};
```

### Cart Total Calculation

```javascript
const calculateTotal = () => {
  return cartItems
    .reduce((total, item) => total + (item.price * item.quantity), 0)
    .toFixed(2);
};
```

### Responsive Product Card

```javascript
<div className="bg-white border rounded-lg overflow-hidden hover:shadow-xl transition">
  <div className="h-48">
    <img 
      src={product.image} 
      alt={product.name}
      className="w-full h-full object-cover"
    />
  </div>
  <div className="p-4">
    <span className="text-xs font-semibold text-primary bg-green-100 px-2 py-1 rounded">
      {product.category}
    </span>
    <h3 className="text-lg font-bold mt-2">{product.name}</h3>
    <p className="text-gray-600 text-sm mb-3">{product.description}</p>
    <div className="flex items-center justify-between">
      <span className="text-2xl font-bold text-primary">${product.price}</span>
      <button
        onClick={() => addToCart(product)}
        className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-secondary transition"
      >
        Add to Cart
      </button>
    </div>
  </div>
</div>
```

---

## Responsive Design

### Breakpoints

```css
/* Tailwind CSS Breakpoints */
sm: 640px   /* Small devices (phones) */
md: 768px   /* Medium devices (tablets) */
lg: 1024px  /* Large devices (laptops) */
xl: 1280px  /* Extra large devices (desktops) */
```

### Mobile Design (< 768px)
- Single column layout
- Hamburger menu navigation
- Full-width cards
- Stacked content sections
- Touch-friendly buttons

### Tablet Design (768px - 1024px)
- Two-column product grid
- Collapsible menu
- Optimized spacing
- Larger touch targets

### Desktop Design (> 1024px)
- Three/four-column product grid
- Full horizontal navigation
- Hover effects
- Maximum width containers (7xl)

---

## Testing

### Functional Testing

✅ **Navigation**
- All links work correctly
- Active page highlighting
- Mobile menu toggle

✅ **Products**
- Search filters products correctly
- Category filters work
- Add to cart updates badge
- Product cards display properly

✅ **Shopping Cart**
- Items appear in cart
- Quantity increases/decreases
- Remove items works
- Total calculates correctly
- LocalStorage persists data

✅ **Contact Form**
- Form validation works
- Success message displays
- Form resets after submission

✅ **Responsive Design**
- Works on mobile devices
- Works on tablets
- Works on desktop
- No layout breaks

### Browser Compatibility

✅ Chrome (Latest)  
✅ Firefox (Latest)  
✅ Safari (Latest)  
✅ Edge (Latest)

---

## Screenshots

### Home Page
![Home Page - Desktop](screenshots/home-desktop.png)
*Hero section with featured categories*

### Products Page
![Products Page](screenshots/products.png)
*Product grid with search and filters*

### Shopping Cart
![Cart Page](screenshots/cart.png)
*Cart items with quantity controls*

### Mobile View
![Mobile Navigation](screenshots/mobile.png)
*Responsive design on mobile devices*

---

## Deployment

### GitHub Pages

**Repository:** https://github.com/22231336-crypto/PharmaCare-website

**Configuration (package.json):**
```json
{
  "homepage": "https://22231336-crypto.github.io/PharmaCare-website",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d build"
  }
}
```

**Deployment Steps:**
1. Build production version: `npm run build`
2. Deploy to GitHub Pages: `npm run deploy`
3. Access at homepage URL

---

## Conclusion

### Achievements

✅ **Technical Requirements Met:**
- React.js frontend implemented
- 5+ pages with routing
- Responsive design (mobile/tablet/desktop)
- Component-based architecture
- State management
- Local storage integration

✅ **Functional Requirements Met:**
- Product browsing and search
- Shopping cart functionality
- Contact form
- Persistent data storage
- User-friendly interface

✅ **Design Requirements Met:**
- Clean, modern UI
- Consistent color scheme
- Professional layout
- Smooth animations
- Accessible design

### Skills Demonstrated

- React.js component development
- React Hooks (useState, useEffect)
- React Router for navigation
- Tailwind CSS for styling
- Responsive web design
- State management
- LocalStorage API
- Git version control
- Project documentation

### Challenges & Solutions

**Challenge 1:** Managing cart state across components  
**Solution:** Lifted state to App.js and passed via props

**Challenge 2:** Persisting cart data  
**Solution:** Implemented localStorage with useEffect

**Challenge 3:** Responsive navigation  
**Solution:** Used Tailwind breakpoints and conditional rendering

**Challenge 4:** Product filtering  
**Solution:** Combined search and category filters with array methods

### Future Enhancements (Phase 2)

- Backend API integration
- User authentication
- Database storage
- Order management
- Payment processing
- Admin dashboard
- Email notifications

---

## References

1. React Documentation - https://react.dev/
2. React Router - https://reactrouter.com/
3. Tailwind CSS - https://tailwindcss.com/
4. MDN Web Docs - https://developer.mozilla.org/
5. CSCI426 Course Materials

---

**Project Status:** ✅ Phase 1 Complete  
**Grade Criteria Met:** UI/UX Design, Code Quality, GitHub Deployment, Documentation

---

*End of Phase 1 Report*
