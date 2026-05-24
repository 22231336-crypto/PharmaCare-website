import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productsAPI } from '../services/api';
import Reviews from '../components/Reviews';
import ProductCard from '../components/ProductCard';

function Products({ onAddToCart }) {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [tempMin, setTempMin] = useState('');
  const [tempMax, setTempMax] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortMethod, setSortMethod] = useState('');
  const [offerFilter, setOfferFilter] = useState('');
  const [showOnlyOffer, setShowOnlyOffer] = useState(false);

  useEffect(() => {
    fetchProducts();
    // Get category/offer from URL if exists
    const categoryFromUrl = searchParams.get('category');
    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl);
    }
    const offerFromUrl = searchParams.get('offer');
    if (offerFromUrl) {
      setOfferFilter(offerFromUrl);
      // when clicking an offer from Home, show only offer products by default
      setShowOnlyOffer(true);
      // If category wasn't passed, map offer key to category
      if (!categoryFromUrl) {
        if (offerFromUrl === 'skincare') setSelectedCategory('Cosmetics');
        if (offerFromUrl === 'vitamins') setSelectedCategory('Vitamins');
        if (offerFromUrl === 'daily') setSelectedCategory('Medicines');
      }
    }
  }, [searchParams]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productsAPI.getAll();
      // Mark products that belong to offers based on offer mapping/keywords
      const offerMap = { skincare: 'Cosmetics', vitamins: 'Vitamins', daily: 'Medicines' };
      const normalizedOffer = (offerFilter || '').toLowerCase();

      const enhanced = Array.isArray(data) ? data.map(p => {
        const name = String(p.name || '').toLowerCase();
        const desc = String(p.description || '').toLowerCase();
        const category = String(p.category || '').toLowerCase();
        let isOffer = false;

        if (normalizedOffer) {
          const mapped = (offerMap[normalizedOffer] || '').toLowerCase();
          isOffer = category === mapped || name.includes(normalizedOffer) || desc.includes(normalizedOffer);
        } else {
          // general detection: match any known offer category or keyword
          isOffer = Object.keys(offerMap).some(k => {
            const mapped = (offerMap[k] || '').toLowerCase();
            return category === mapped || name.includes(k) || desc.includes(k);
          });
        }

        return { ...p, isOffer };
      }) : [];

      setProducts(enhanced);
    } catch (error) {
      console.error('Error fetching products:', error);
      // Only show alert if we haven't already shown one
      if (!window.productsErrorShown) {
        window.productsErrorShown = true;
        alert('Failed to load products. Please make sure the backend server is running.');
        // Reset the flag after 2 seconds to allow future alerts if needed
        setTimeout(() => { window.productsErrorShown = false; }, 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const categories = ['All', 'Medicines', 'Cosmetics', 'Vitamins', 'Personal Care'];

  // Apply category + search + price range filters, then sort client-side
  const filteredProducts = products
    .filter(product => {
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchTerm.toLowerCase());

      let matchesMin = true;
      let matchesMax = true;
      const price = Number(product.price || 0);
      if (minPrice !== '') {
        const m = Number(minPrice);
        if (!Number.isNaN(m)) matchesMin = price >= m;
      }
      if (maxPrice !== '') {
        const M = Number(maxPrice);
        if (!Number.isNaN(M)) matchesMax = price <= M;
      }

      // respect the 'Show only offers' toggle — product.isOffer computed earlier
      if (showOnlyOffer) {
        return matchesCategory && matchesSearch && matchesMin && matchesMax && product.isOffer;
      }

      return matchesCategory && matchesSearch && matchesMin && matchesMax;
    })
    .sort((a, b) => {
      if (sortMethod === 'price_asc') return Number(a.price) - Number(b.price);
      if (sortMethod === 'price_desc') return Number(b.price) - Number(a.price);
      if (sortMethod === 'name_asc') return a.name.localeCompare(b.name);
      if (sortMethod === 'name_desc') return b.name.localeCompare(a.name);
      return 0;
    });

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-primary text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">Our Products</h1>
          <p className="text-xl">Browse our wide selection of healthcare products</p>
        </div>
      </div>

      {/* Best Sellers removed */}

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Search and Filter */}
        <div className="mb-8">
          {/* Search Bar */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Price range + Sort controls */}
          <div className="mb-6 flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <input type="number" placeholder="Min" value={tempMin} onChange={e => setTempMin(e.target.value)} className="w-24 px-2 py-1 border rounded" />
              <span className="text-gray-500">-</span>
              <input type="number" placeholder="Max" value={tempMax} onChange={e => setTempMax(e.target.value)} className="w-24 px-2 py-1 border rounded" />
              <button
                onClick={() => { setMinPrice(tempMin); setMaxPrice(tempMax); }}
                className="ml-2 px-3 py-1 bg-primary text-white rounded">
                Apply
              </button>
            </div>

            <select value={sortMethod} onChange={e => setSortMethod(e.target.value)} className="px-3 py-1 border rounded">
              <option value="">Sort</option>
              <option value="price_asc">Price: Low → High</option>
              <option value="price_desc">Price: High → Low</option>
              <option value="name_asc">Name: A → Z</option>
              <option value="name_desc">Name: Z → A</option>
            </select>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2 rounded-full font-semibold transition ${
                  selectedCategory === category
                    ? 'bg-primary text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-gray-600">Loading products...</p>
          </div>
        )}

        {/* Products Grid */}
        {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
          ))}
        </div>
        )}

        {!loading && filteredProducts.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500 text-xl">No products found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Products;
