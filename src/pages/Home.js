import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import img1 from '../assets/img1.webp';
import img2 from '../assets/img2.webp';
import skinCareImg from '../assets/skin care.png';
import multiVitamin from '../assets/multi-vitamin.webp';
import nowImg from '../assets/now.png';
import dailyMedicinesImg from '../assets/daily medicines.png';

function Home({ onAddToCart }) {
  const [currentImage, setCurrentImage] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef(null);
  const images = [img1, img2];

  useEffect(() => {
    // autoplay: advance every 4 seconds when not paused
    if (isPaused) return;
    intervalRef.current = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(intervalRef.current);
  }, [isPaused, images.length]);

  const [showOffersBar, setShowOffersBar] = useState(true);
  const offers = [
    { id: 1, key: 'skincare', title: 'Skincare — 20% off', subtitle: 'Limited time on selected creams', img: skinCareImg, link: '/products?offer=skincare&category=Cosmetics' },
    { id: 2, key: 'vitamins', title: 'Vitamins Bundles', subtitle: 'Buy 2 get 1 free', img: nowImg, link: '/products?offer=vitamins&category=Vitamins' },
    { id: 3, key: 'daily', title: 'Daily Medicines', subtitle: 'Fast delivery + discounts', img: dailyMedicinesImg, link: '/products?offer=daily&category=Medicines' },
  ];
  const [offerIndex, setOfferIndex] = useState(0);
  const [offersPaused, setOffersPaused] = useState(false);

  useEffect(() => {
    if (!showOffersBar) return;
    if (offersPaused) return;
    const id = setInterval(() => {
      setOfferIndex((prev) => (prev + 1) % offers.length);
    }, 4000);
    return () => clearInterval(id);
  }, [offersPaused, showOffersBar, offers.length]);

  const categories = [
    { name: 'Medicines', icon: '💊', description: 'Prescription and OTC drugs' },
    { name: 'Cosmetics', icon: '💄', description: 'Beauty and skincare products' },
    { name: 'Vitamins', icon: '🧪', description: 'Supplements and vitamins' },
    { name: 'Personal Care', icon: '🧴', description: 'Hygiene and care products' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-cyan-500 to-teal-500 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Welcome to PHARMACARE ONLINE
              </h1>
              <p className="text-lg md:text-xl mb-8">
                Your trusted healthcare partner for all your medical and wellness needs
              </p>
              <Link
                to="/products"
                className="bg-white text-cyan-600 px-8 py-3 rounded font-semibold text-lg hover:bg-gray-100 transition inline-block"
              >
                Shop Now
              </Link>
            </div>
            <div
              className="flex justify-center relative group"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              onFocus={() => setIsPaused(true)}
              onBlur={() => setIsPaused(false)}
              onKeyDown={(e) => {
                if (e.key === 'ArrowLeft') setCurrentImage((prev) => (prev - 1 + images.length) % images.length);
                if (e.key === 'ArrowRight') setCurrentImage((prev) => (prev + 1) % images.length);
              }}
              tabIndex={0}
              role="region"
              aria-label="Hero carousel"
            >
              <button
                onClick={() => setCurrentImage((prev) => (prev - 1 + images.length) % images.length)}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-cyan-600 rounded-full p-3 shadow-lg z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Previous slide"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <img
                src={images[currentImage]}
                alt="Pharmacy Store"
                className="rounded-lg shadow-2xl w-full max-w-2xl h-96 object-cover transition-all duration-500 hover:scale-105 cursor-pointer"
                aria-live="polite"
              />
              
              <button
                onClick={() => setCurrentImage((prev) => (prev + 1) % images.length)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-cyan-600 rounded-full p-3 shadow-lg z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Next slide"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2" role="tablist" aria-label="Carousel indicators">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImage(index)}
                    className={`w-3 h-3 rounded-full transition-all ${index === currentImage ? 'bg-white w-8' : 'bg-white/50'}`}
                    aria-label={`Go to slide ${index + 1}`}
                    role="tab"
                    aria-selected={index === currentImage}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

        {/* Offers Section */}
        <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 bg-white">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Today's Offers</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg p-4 flex items-center gap-4 shadow">
              <img src={skinCareImg} alt="Skincare" className="w-24 h-24 rounded object-cover" />
              <div>
                <h3 className="font-bold text-lg">Skincare Essentials</h3>
                <p className="text-sm text-gray-600">Up to 25% off selected items</p>
                <Link to="/products?offer=skincare&category=Cosmetics" className="text-cyan-600 font-semibold mt-2 inline-block">Shop Skincare →</Link>
              </div>
            </div>

            <div className="bg-gradient-to-br from-cyan-50 to-teal-50 rounded-lg p-4 flex items-center gap-4 shadow">
              <img src={nowImg} alt="Vitamins" className="w-24 h-24 rounded object-cover" />
              <div>
                <h3 className="font-bold text-lg">Vitamins & Supplements</h3>
                <p className="text-sm text-gray-600">Bundle deals available</p>
                <Link to="/products?offer=vitamins&category=Vitamins" className="text-cyan-600 font-semibold mt-2 inline-block">See Offers →</Link>
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 flex items-center gap-4 shadow">
              <img src={dailyMedicinesImg} alt="Daily Medicines" className="w-24 h-24 rounded object-cover" />
              <div>
                <h3 className="font-bold text-lg">Daily Medicines</h3>
                <p className="text-sm text-gray-600">Fast delivery + discounts</p>
                <Link to="/products?offer=daily&category=Medicines" className="text-cyan-600 font-semibold mt-2 inline-block">Browse →</Link>
              </div>
            </div>
          </div>

          {/* Inline auto-scrolling offers strip (non-fixed) */}
          <div className="mt-8">
            {showOffersBar && (
              <div
                className="offers-strip max-w-full overflow-hidden rounded-lg border border-gray-100"
                onMouseEnter={() => setOffersPaused(true)}
                onMouseLeave={() => setOffersPaused(false)}
                role="region"
                aria-label="Auto-scrolling offers strip"
              >
                <div className={`offers-track ${offersPaused ? 'paused' : ''}`}>
                  {[...offers, ...offers].map((o, idx) => (
                    <Link
                      to={o.link}
                      key={idx}
                      className="offer-item flex items-center gap-4 px-6 py-3 border-r border-white/20"
                    >
                      {o.img ? (
                        <img src={o.img} alt={o.title} className="w-12 h-12 rounded object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-12 h-12 rounded bg-white text-cyan-600 flex items-center justify-center text-lg flex-shrink-0">💊</div>
                      )}
                      <div className="min-w-0">
                        <div className="font-semibold text-white truncate">{o.title}</div>
                        <div className="text-sm text-white/80 truncate">{o.subtitle}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Best Sellers removed */}
        </div>

      {/* Categories Section */}
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 bg-gray-50">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Our Categories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.map((category, index) => (
            <Link
              key={index}
              to="/products"
              className="bg-gradient-to-br from-cyan-500 to-teal-500 text-white rounded-lg p-8 text-center hover:shadow-xl transition transform hover:-translate-y-1 hover:from-cyan-600 hover:to-teal-600"
            >
              <div className="text-6xl mb-4">{category.icon}</div>
              <h3 className="text-xl font-bold mb-2">{category.name}</h3>
              <p className="text-cyan-50">{category.description}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <img 
                src={img1} 
                alt="Pharmacy Products" 
                className="rounded-lg shadow-2xl w-full"
              />
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-8 text-gray-800">Why Choose Us?</h2>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="bg-gradient-to-br from-cyan-500 to-teal-500 text-white rounded-full w-16 h-16 flex items-center justify-center mr-4 flex-shrink-0">
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                      <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2 text-gray-800">Quality Products</h3>
                    <p className="text-gray-600">All products are verified and certified</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-gradient-to-br from-cyan-500 to-teal-500 text-white rounded-full w-16 h-16 flex items-center justify-center mr-4 flex-shrink-0">
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
                      <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2 text-gray-800">Fast Delivery</h3>
                    <p className="text-gray-600">Quick and reliable shipping</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-gradient-to-br from-cyan-500 to-teal-500 text-white rounded-full w-16 h-16 flex items-center justify-center mr-4 flex-shrink-0">
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2 text-gray-800">Secure Payment</h3>
                    <p className="text-gray-600">Safe and secure transactions</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
