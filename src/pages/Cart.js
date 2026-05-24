import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ordersAPI } from '../services/api';

function Cart({ cartItems, onUpdateQuantity, onRemoveItem, onClear }) {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState('');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [serverMessage, setServerMessage] = useState('');
  const navigate = useNavigate();
  
  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleCheckout = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login to proceed to checkout');
      navigate('/login');
      return;
    }

    setShowPaymentModal(true);
  };

  const handlePaymentSelect = (method) => {
    setSelectedPayment(method);
  };

  const handleConfirmOrder = async () => {
    if (!selectedPayment) return;

    try {
      // Send order to backend
      const orderData = { items: cartItems, total };
      const res = await ordersAPI.create(orderData);

      if (!res) {
        alert('No response from server');
        return;
      }

      if (!res.ok) {
        const msg = res.body?.message || 'Failed to place order';
        if (res.status === 401 || res.status === 403 || (msg && String(msg).toLowerCase().includes('invalid token'))) {
          alert('Session expired. Please login again.');
          navigate('/login');
          return;
        }

        alert(msg);
        return;
      }

      if (res.body && res.body.orderId) {
        setOrderPlaced(true);
        setOrderId(res.body.orderId || null);
        setServerMessage(res.body.message || '');
        // Clear local cart state and storage if parent provided handler
        if (typeof onClear === 'function') onClear();
        else {
          localStorage.removeItem('pharmacyCart');
        }

        setTimeout(() => {
          setShowPaymentModal(false);
          setOrderPlaced(false);
          setOrderId(null);
          setSelectedPayment('');
          setServerMessage('');
        }, 2000);
      } else {
        alert(res.body?.message || 'Failed to place order');
      }
    } catch (e) {
      console.error('Order error', e);
      alert('Error placing order');
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen">
        <div className="bg-primary text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold">Shopping Cart</h1>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-8">Add some products to get started!</p>
          <Link
            to="/products"
            className="bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-secondary transition inline-block"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="bg-primary text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold">Shopping Cart</h1>
        </div>
      </div>
      {orderPlaced && (
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-center">
            <strong className="font-bold">{serverMessage ? serverMessage : 'Order Placed!'}</strong>
            <span className="ml-2">{orderId ? `Order #${orderId}` : ''}</span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {cartItems.map(item => (
                <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-4 flex items-center">
                  <div className="w-24 h-24 rounded-lg flex-shrink-0 overflow-hidden bg-gray-100">
                    <img 
                      src={`${process.env.PUBLIC_URL}${item.image}`} 
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/100x100?text=' + encodeURIComponent(item.name);
                      }}
                    />
                  </div>
                  <div className="flex-grow ml-4">
                    <h3 className="text-lg font-bold">{item.name}</h3>
                    <p className="text-gray-600 text-sm">{item.category}</p>
                    <p className="text-primary font-bold mt-1">${item.price}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                      className="bg-gray-200 hover:bg-gray-300 w-8 h-8 rounded-full flex items-center justify-center"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      className="bg-gray-200 hover:bg-gray-300 w-8 h-8 rounded-full flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="ml-4 text-red-500 hover:text-red-700"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-4">
              <h2 className="text-2xl font-bold mb-6">Order Summary</h2>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-semibold">$5.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-semibold">${(total * 0.1).toFixed(2)}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total</span>
                    <span className="text-primary">${(total + 5 + (total * 0.1)).toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={handleCheckout}
                className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-secondary transition mb-3"
              >
                Proceed to Checkout
              </button>
              <Link
                to="/products"
                className="block text-center text-primary hover:underline"
              >
                Continue Shopping
              </Link>
              <div className="mt-6 pt-6 border-t">
                <h3 className="font-bold mb-3">We Accept:</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-gray-100 px-3 py-2 rounded text-sm font-medium">💳 Visa</div>
                  <div className="bg-gray-100 px-3 py-2 rounded text-sm font-medium">💳 Mastercard</div>
                  <div className="bg-gray-100 px-3 py-2 rounded text-sm font-medium">💵 Wish Money</div>
                  <div className="bg-gray-100 px-3 py-2 rounded text-sm font-medium">💰 OMT</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Method Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
            <button
              onClick={() => setShowPaymentModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h2 className="text-2xl font-bold mb-2">Choose Payment Method</h2>
            <p className="text-gray-600 mb-6">Select how you'd like to pay for your order</p>

            {orderPlaced ? (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">✅</div>
                <h3 className="text-2xl font-bold text-green-600 mb-2">{serverMessage ? serverMessage : 'Order Placed!'}</h3>
                <p className="text-gray-600">{orderId ? `Order #${orderId}` : ''}</p>
              </div>
            ) : (
              <>
                <div className="space-y-3 mb-6">
                  {/* Cash Payment Options */}
                  <div
                    onClick={() => handlePaymentSelect('cash')}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition ${
                      selectedPayment === 'cash' 
                        ? 'border-primary bg-green-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="text-3xl mr-3">💵</div>
                        <div>
                          <h3 className="font-bold text-lg">Cash on Delivery</h3>
                          <p className="text-sm text-gray-600">OMT / Wish Money / Cash</p>
                        </div>
                      </div>
                      {selectedPayment === 'cash' && (
                        <div className="text-primary">
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Credit Card Payment */}
                  <div
                    onClick={() => handlePaymentSelect('visa')}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition ${
                      selectedPayment === 'visa' 
                        ? 'border-primary bg-green-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="text-3xl mr-3">💳</div>
                        <div>
                          <h3 className="font-bold text-lg">Credit / Debit Card</h3>
                          <p className="text-sm text-gray-600">Visa, Mastercard</p>
                        </div>
                      </div>
                      {selectedPayment === 'visa' && (
                        <div className="text-primary">
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total Amount:</span>
                    <span className="text-primary">${(total + 5 + (total * 0.1)).toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={handleConfirmOrder}
                  disabled={!selectedPayment}
                  className={`w-full py-3 rounded-lg font-semibold transition ${
                    selectedPayment
                      ? 'bg-primary text-white hover:bg-secondary'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Confirm Order
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;
