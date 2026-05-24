import React from 'react';

function Footer() {
  return (
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-xl font-bold mb-4">PharmaCare</h3>
            <p className="text-gray-400">
              Your trusted online pharmacy for medicines and cosmetics. Quality products, delivered to your door.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="/" className="text-gray-400 hover:text-white transition">Home</a></li>
              <li><a href="/about" className="text-gray-400 hover:text-white transition">About Us</a></li>
              <li><a href="/products" className="text-gray-400 hover:text-white transition">Products</a></li>
              <li><a href="/contact" className="text-gray-400 hover:text-white transition">Contact</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-xl font-bold mb-4">Contact & Hours</h3>
            <ul className="space-y-2 text-gray-400">
              <li><strong>Working Hours</strong></li>
              <li>Mon - Sat: 8:00 AM - 3:00 AM</li>
              <li>Sun: 10:00 AM - 3:00 AM</li>
              <li className="mt-2"><strong>Address</strong></li>
              <li>Lebanon, Bekaa, Saadnayel</li>
              <li className="mt-2"><strong>Phone</strong></li>
              <li>03655808</li>
              <li>03019145</li>
              <li className="mt-2"><strong>Email</strong></li>
              <li>Choubassipharm@gmail.com</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400">
          <p>&copy; 2026 PharmaCare. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
