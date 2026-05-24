import React, { useState, useEffect } from 'react';

function getReviews(productId) {
  try {
    return JSON.parse(localStorage.getItem(`reviews_${productId}`)) || [];
  } catch (e) {
    return [];
  }
}

function saveReview(productId, review) {
  const list = getReviews(productId);
  list.unshift(review);
  localStorage.setItem(`reviews_${productId}`, JSON.stringify(list));
}

export default function Reviews({ productId }) {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    setReviews(getReviews(productId));
  }, [productId]);

  const addReview = async () => {
    const ratingStr = window.prompt('Enter rating 1-5 (numbers only):');
    if (!ratingStr) return;
    const rating = Math.max(1, Math.min(5, parseInt(ratingStr, 10) || 0));
    const text = window.prompt('Write a short review (optional):') || '';
    const r = { rating, text, date: new Date().toISOString() };
    saveReview(productId, r);
    setReviews(getReviews(productId));
  };

  const avg = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : null;

  return (
    <div>
      <div className="flex items-center gap-3 mt-3">
        <div className="text-sm text-gray-700">{avg ? `${avg} ★` : 'No ratings'}</div>
        <button onClick={addReview} className="text-xs text-primary hover:underline">Add review</button>
      </div>
    </div>
  );
}
