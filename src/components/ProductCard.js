import React, { useState, useEffect } from 'react';
import Reviews from './Reviews';

function getWishlist() {
  try { return JSON.parse(localStorage.getItem('wishlist')) || []; } catch { return []; }
}

function toggleWishlistItem(id) {
  const w = getWishlist();
  const idx = w.indexOf(id);
  if (idx === -1) { w.push(id); } else { w.splice(idx,1); }
  localStorage.setItem('wishlist', JSON.stringify(w));
  return w;
}

export default function ProductCard({ product, onAddToCart }) {
  const [wishlist, setWishlist] = useState(getWishlist());

  useEffect(() => {
    setWishlist(getWishlist());
  }, []);

  const isWished = wishlist.includes(product.id);

  const handleWishlist = () => {
    const w = toggleWishlistItem(product.id);
    setWishlist(w);
  };

  return (
    <div className="product-card bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-xl transition transform hover:-translate-y-1 relative">
      {product.isOffer && (
        <div className="absolute top-3 left-3 bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-1 rounded">Offer</div>
      )}
      <button
        onClick={handleWishlist}
        className={`absolute top-3 right-3 text-lg p-2 rounded-full ${isWished ? 'bg-red-100 text-red-600' : 'bg-white text-gray-500'} shadow-sm`}
        aria-label={isWished ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        {isWished ? '♥' : '♡'}
      </button>

      <div className="h-48 overflow-hidden bg-gray-100 flex items-center justify-center">
        <img
          src={(function() {
            const img = product && product.image ? product.image.toString() : '';
            if (!img) return 'https://via.placeholder.com/300x200?text=No+Image';
            if (img.startsWith('http') || img.startsWith('blob:') || img.startsWith('//')) return img;
            if (img.startsWith('/')) return `${process.env.PUBLIC_URL}${img}`;
            return `${process.env.PUBLIC_URL}/${img}`;
          })()}
          alt={product.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
          }}
        />
      </div>
      <div className="p-4">
        <span className="text-xs font-semibold text-primary bg-green-100 px-2 py-1 rounded">
          {product.category}
        </span>
        <h3 className="text-lg font-bold mt-2 mb-1">{product.name}</h3>
        <p className="text-gray-600 text-sm mb-3">{product.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-primary">${product.price}</span>
          {(typeof product.stock === 'number' ? product.stock > 0 : !!product.inStock) ? (
            <button
              onClick={() => onAddToCart(product)}
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-secondary transition"
            >
              Add to Cart
            </button>
          ) : (
            <span className="text-red-500 font-semibold">Out of Stock</span>
          )}
        </div>

        <Reviews productId={product.id} />
      </div>
    </div>
  );
}
