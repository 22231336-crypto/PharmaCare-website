import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

function Navbar({ cartCount }) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [user, setUser] = useState(null);
  const [showAdminMenu, setShowAdminMenu] = useState(false);
  const adminTabs = [
    { key: 'statistics', label: 'Statistics' },
    { key: 'products', label: 'Products' },
    { key: 'add', label: 'Add' },
    { key: 'purchase', label: 'Purchases' },
    { key: 'recent-orders', label: 'Orders' },
    { key: 'discount', label: 'Discount' },
    { key: 'messages', label: 'Messages' }
  ];

  useEffect(() => {
    setUser(authAPI.getCurrentUser());
  }, []);

  const handleLogout = () => {
    authAPI.logout();
    setUser(null);
    navigate('/');
    window.location.reload();
  };

  const categories = [
    { name: 'Medicines', icon: '💊' },
    { name: 'Cosmetics', icon: '🧴' },
    { name: 'Vitamins', icon: '💊' },
    { name: 'Personal Care', icon: '🧼' },
  ];

  return (
    <nav className="bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex justify-between items-center h-16 md:pl-56">
          {/* Logo with Categories Menu */}
          <div className="flex items-center absolute left-0 top-0 h-16 pl-3">
            <button
              onClick={() => setShowCategories(!showCategories)}
              className="text-white hover:text-gray-200 transition mr-2"
              title="Categories"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <Link to="/" className="flex items-center group">
              <div className="bg-cyan-600 rounded-full p-2 mr-2 shadow-md group-hover:shadow-lg transition">
                <svg className="h-8 w-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M13.5 3h-3v7.5H3v3h7.5V21h3v-7.5H21v-3h-7.5z" />
                </svg>
              </div>
              <div>
                <div className="flex items-baseline gap-0">
                  <span className="text-2xl font-bold text-white leading-none">PharmaCare</span>
                </div>
                <span className="text-sm text-cyan-300 font-semibold tracking-wide">ONLINE</span>
                <span className="text-xs text-gray-300 italic block leading-tight">Your Trusted Healthcare Partner</span>
              </div>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6 md:ml-auto">
            <Link to="/" className="hover:text-gray-200 transition">Home</Link>
            <Link to="/products" className="hover:text-gray-200 transition">Products</Link>
            {!user?.isAdmin && (
              <>
                <Link to="/contact" className="hover:text-gray-200 transition">Contact</Link>
                <Link to="/about" className="hover:text-gray-200 transition">About</Link>
              </>
            )}
            
            {user ? (
              <>
                <Link to="/profile" className="hover:text-gray-200 transition mr-2">Profile</Link>
                <div className="flex items-center space-x-3">
                  {user.isAdmin ? null : (
                    <span className="text-cyan-200">{`Hello, ${user.name}`}</span>
                  )}
                  {user.isAdmin && (
                    <div className="flex items-center space-x-2">
                      <div className="hidden sm:flex items-center space-x-2 bg-white bg-opacity-10 px-2 py-1 rounded-full overflow-x-auto">
                        {adminTabs.map(t => (
                          <Link
                            key={t.key}
                            to={`/admin?tab=${t.key}`}
                            className="text-xs px-2 py-1 rounded-full bg-white bg-opacity-0 hover:bg-opacity-20 transition text-white whitespace-nowrap"
                          >
                            {t.label}
                          </Link>
                        ))}
                      </div>
                      {/* Dashboard link removed by request */}
                    </div>
                  )}
                </div>
                <button onClick={handleLogout} className="hover:text-gray-200 transition">
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="hover:text-gray-200 transition">Login</Link>
            )}
            
            <Link to="/cart" className="relative hover:text-gray-200 transition">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
            <Link to="/favorites" className="relative hover:text-gray-200 transition">
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 21s-7-4.35-9-6.5C-1 10.5 3 6 6 6c1.8 0 3.1.9 4 2 .9-1.1 2.2-2 4-2 3 0 7 4.5 3 8.5-2 2.15-9 6.5-9 6.5z" />
              </svg>
              {/* small badge for wishlist count */}
              {(() => {
                try {
                  const w = JSON.parse(localStorage.getItem('wishlist') || '[]');
                  if (w.length > 0) return (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">{w.length}</span>
                  );
                } catch (e) { /* ignore */ }
                return null;
              })()}
            </Link>
            <button
              onClick={() => {
                const cur = document.documentElement.classList.toggle('dark');
                localStorage.setItem('themeDark', cur ? '1' : '0');
              }}
              title="Toggle dark mode"
              className="hover:text-gray-200 transition"
            >
              🌙
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
            {isOpen && (
          <div className="md:hidden pb-4">
            <Link to="/" className="block py-2 hover:bg-secondary px-2 rounded transition" onClick={() => setIsOpen(false)}>Home</Link>
            <Link to="/products" className="block py-2 hover:bg-secondary px-2 rounded transition" onClick={() => setIsOpen(false)}>Products</Link>
            {!user?.isAdmin && (
              <>
                <Link to="/contact" className="block py-2 hover:bg-secondary px-2 rounded transition" onClick={() => setIsOpen(false)}>Contact</Link>
                <Link to="/about" className="block py-2 hover:bg-secondary px-2 rounded transition" onClick={() => setIsOpen(false)}>About</Link>
              </>
            )}

            {user ? (
              <>
                <Link to="/profile" className="block py-2 hover:bg-secondary px-2 rounded transition" onClick={() => setIsOpen(false)}>Profile</Link>
                <div className="block py-2 px-2">{user.isAdmin ? '👑 Admin' : `Hello, ${user.name}`}</div>
                {user.isAdmin && (
                  <>
                    <Link to="/admin?tab=products" className="block py-2 hover:bg-secondary px-2 rounded transition" onClick={() => setIsOpen(false)}>Products</Link>
                    <Link to="/admin?tab=purchase" className="block py-2 hover:bg-secondary px-2 rounded transition" onClick={() => setIsOpen(false)}>Purchase Invoice</Link>
                    <Link to="/admin?tab=messages" className="block py-2 hover:bg-secondary px-2 rounded transition" onClick={() => setIsOpen(false)}>Messages</Link>
                    <Link to="/admin?tab=recent-orders" className="block py-2 hover:bg-secondary px-2 rounded transition" onClick={() => setIsOpen(false)}>Recent Orders</Link>
                  </>
                )}
                <button onClick={() => { handleLogout(); setIsOpen(false); }} className="w-full text-left block py-2 hover:bg-secondary px-2 rounded transition">Logout</button>
              </>
            ) : (
              <Link to="/login" className="block py-2 hover:bg-secondary px-2 rounded transition" onClick={() => setIsOpen(false)}>Login</Link>
            )}

            <Link to="/cart" className="block py-2 hover:bg-secondary px-2 rounded transition" onClick={() => setIsOpen(false)}>
              Cart {cartCount > 0 && `(${cartCount})`}
            </Link>
          </div>
        )}
      </div>

      {/* Categories Sidebar */}
      {showCategories && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setShowCategories(false)}
          ></div>
          
          {/* Sidebar */}
          <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-2xl z-50 transform transition-transform duration-300">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-primary">Categories</h2>
                <button
                  onClick={() => setShowCategories(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-2">
                {categories.map((cat, index) => (
                  <Link
                    key={index}
                    to={`/products?category=${cat.name}`}
                    className="flex items-center px-4 py-4 hover:bg-gray-100 rounded-lg text-gray-800 transition"
                    onClick={() => setShowCategories(false)}
                  >
                    <span className="text-3xl mr-4">{cat.icon}</span>
                    <span className="font-semibold text-lg">{cat.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </nav>
  );
}

export default Navbar;
