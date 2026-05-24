import React, { useState, useEffect } from 'react';
import { productsAPI } from '../services/api';
import ProductCard from '../components/ProductCard';

function getWishlist() {
  try { return JSON.parse(localStorage.getItem('wishlist')) || []; } catch { return []; }
}

export default function Favorites({ onAddToCart }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState(getWishlist());

  useEffect(() => {
    fetchFavorites();

    const onStorage = (e) => {
      if (e.key === 'wishlist') setWishlist(getWishlist());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const all = await productsAPI.getAll();
      const w = getWishlist();
      setWishlist(w);
      const favs = Array.isArray(all) ? all.filter(p => w.includes(p.id)) : [];
      setProducts(favs);
    } catch (err) {
      console.error('Error loading favorites', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="bg-primary text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">Your Favorites</h1>
          <p className="text-xl">Products you've added to your wishlist</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : (
          <>
            {products.length === 0 ? (
              <div className="text-center py-24">
                <p className="text-gray-500 text-xl">You have no favorite products yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.map(p => (
                  <ProductCard key={p.id} product={p} onAddToCart={onAddToCart} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
