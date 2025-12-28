# PharmaCare - Online Pharmacy Store

![PharmaCare Logo](https://via.placeholder.com/150x150?text=PharmaCare)

## 📋 Project Description

PharmaCare is a modern, responsive online pharmacy platform built with React.js. The application allows users to browse and purchase medicines, cosmetics, vitamins, and personal care products. This project is developed as part of CSCI426 Advanced Web Programming course at the Department of Computer Science and Information Technology.

### Key Features
- 🏠 Home page with featured categories and benefits
- ℹ️ About page with company information
- 🛍️ Products page with search and category filtering
- 📞 Contact page with inquiry form
- 🛒 Shopping cart with add/remove functionality
- 📱 Fully responsive design (mobile and desktop)
- 💾 Local storage integration for cart persistence

## 🎯 Project Objectives

- Apply web design and development principles using React.js
- Implement responsive web design and UI/UX best practices
- Demonstrate version control using Git and GitHub
- Create a functional e-commerce frontend application

## 🚀 Technologies Used

### Frontend
- **React.js** (v18.3.1) - JavaScript library for building user interfaces
- **React Router DOM** (v7.x) - Navigation and routing
- **Tailwind CSS** (v3.x) - Utility-first CSS framework for styling
- **PostCSS** & **Autoprefixer** - CSS processing

### Development Tools
- **Node.js** & **npm** - Runtime environment and package manager
- **Git** - Version control system
- **VS Code** - Code editor

## 📦 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn package manager
- Git

### Step-by-Step Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/pharmacy-store.git
   cd pharmacy-store
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production
```bash
npm run build
```
This creates an optimized production build in the `build` folder.

## 📁 Project Structure

```
pharmacy-store/
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── Navbar.js         # Navigation bar component
│   │   └── Footer.js         # Footer component
│   ├── pages/
│   │   ├── Home.js           # Home page
│   │   ├── About.js          # About page
│   │   ├── Products.js       # Products listing page
│   │   ├── Contact.js        # Contact form page
│   │   └── Cart.js           # Shopping cart page
│   ├── data/
│   │   └── products.js       # Product data
│   ├── App.js                # Main application component
│   ├── index.js              # Application entry point
│   └── index.css             # Global styles
├── tailwind.config.js        # Tailwind CSS configuration
├── package.json              # Project dependencies
└── README.md                 # Project documentation
```

## 🎨 Pages Overview

### 1. Home Page (`/`)
- Hero section with call-to-action
- Product categories showcase
- Key features and benefits
- Responsive grid layout

### 2. About Page (`/about`)
- Company information
- Mission and vision statements
- Core values
- Team introduction

### 3. Products Page (`/products`)
- Product grid with images and details
- Search functionality
- Category filtering (All, Medicines, Cosmetics, Vitamins, Personal Care)
- Add to cart functionality
- Stock availability indication

### 4. Contact Page (`/contact`)
- Contact form with validation
- Company contact information
- Location and working hours
- Success message on form submission

### 5. Cart Page (`/cart`)
- Shopping cart items list
- Quantity adjustment controls
- Remove item functionality
- Order summary with calculations
- Empty cart state

## 🎯 Functional Requirements Met

### Phase 1 Requirements ✅
- ✅ Built with React.js
- ✅ Uses Tailwind CSS for styling
- ✅ Includes 5+ pages (Home, About, Products, Contact, Cart)
- ✅ Fully responsive design
- ✅ Git version control with commit history
- ✅ README.md with documentation
- ✅ Clean and organized code structure

### Additional Features
- Local storage for cart persistence
- Dynamic product filtering and search
- Mobile-responsive navigation menu
- Shopping cart badge with item count
- Form validation on contact page

## 📱 Responsive Design

The application is fully responsive and works seamlessly on:
- 📱 Mobile devices (320px and up)
- 📱 Tablets (768px and up)
- 💻 Desktops (1024px and up)
- 🖥️ Large screens (1280px and up)

## 🖼️ Screenshots

### Home Page
![Home Page](https://via.placeholder.com/800x400?text=Home+Page+Screenshot)

### Products Page
![Products Page](https://via.placeholder.com/800x400?text=Products+Page+Screenshot)

### Shopping Cart
![Shopping Cart](https://via.placeholder.com/800x400?text=Cart+Page+Screenshot)

### Mobile View
![Mobile View](https://via.placeholder.com/400x600?text=Mobile+View+Screenshot)

## 🔄 Phase 2 Roadmap (Backend Integration)

The following features will be implemented in Phase 2:
- Node.js backend server
- MySQL database integration
- User authentication (Login/Signup)
- CRUD operations for products and orders
- Admin panel for product management
- Order history and tracking
- Email notifications
- Payment gateway integration
- Database schema for users, products, and orders

## 👥 Team Members

- **Student Name 1** - Student ID
- **Student Name 2** - Student ID (if working in a group)

## 📄 License

This project is created for educational purposes as part of CSCI426 course requirements.

## 🙏 Acknowledgments

- Department of Computer Science and Information Technology
- CSCI426: Advanced Web Programming Course
- React.js Documentation
- Tailwind CSS Documentation

## 📞 Contact

For questions or support, please contact:
- Email: info@pharmacare.com
- GitHub: [Your GitHub Profile](https://github.com/yourusername)

---

**Note:** This is Phase 1 of the project focusing on frontend development. Backend functionality will be implemented in Phase 2.

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
