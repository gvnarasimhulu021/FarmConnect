import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  Truck, 
  Shield, 
  Leaf,
  ArrowRight,
  ShoppingBag
} from 'lucide-react';
import Button from '../components/Button';

const CartPage = () => {
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: 'Organic Tomatoes',
      farmName: 'Green Valley Farm',
      price: 4.99,
      unit: 'lb',
      quantity: 2,
      image: 'https://images.unsplash.com/photo-1546470437-e42b53d9a56c?w=200&h=200&fit=crop',
      isOrganic: true,
    },
    {
      id: 2,
      name: 'Fresh Strawberries',
      farmName: 'Berry Good Farm',
      price: 5.99,
      unit: 'lb',
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=200&h=200&fit=crop',
      isOrganic: true,
    },
    {
      id: 3,
      name: 'Free-Range Eggs',
      farmName: 'Happy Chickens Farm',
      price: 4.50,
      unit: 'dozen',
      quantity: 2,
      image: 'https://images.unsplash.com/photo-1518569656558-1ac558334d9e?w=200&h=200&fit=crop',
      isOrganic: false,
    },
  ]);

  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoDiscount, setPromoDiscount] = useState(0);

  const handleQuantityChange = (itemId, change) => {
    setCartItems(prev =>
      prev.map(item =>
        item.id === itemId
          ? { ...item, quantity: Math.max(1, item.quantity + change) }
          : item
      )
    );
  };

  const handleRemoveItem = (itemId) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  };

  const handleApplyPromo = () => {
    if (promoCode.toUpperCase() === 'FRESH10') {
      setPromoApplied(true);
      setPromoDiscount(0.1); // 10% discount
    } else if (promoCode.toUpperCase() === 'WELCOME20') {
      setPromoApplied(true);
      setPromoDiscount(0.2); // 20% discount
    } else {
      alert('Invalid promo code. Try FRESH10 or WELCOME20');
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const calculateShipping = () => {
    const subtotal = calculateSubtotal();
    return subtotal >= 25 ? 0 : 4.99;
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.08; // 8% tax
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const shipping = calculateShipping();
    const tax = calculateTax();
    const discount = subtotal * promoDiscount;
    return subtotal + shipping + tax - discount;
  };

  const subtotal = calculateSubtotal();
  const shipping = calculateShipping();
  const tax = calculateTax();
  const discount = subtotal * promoDiscount;
  const total = calculateTotal();

  if (cartItems.length === 0) {
    return (
      <div className="container">
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingCart className="w-12 h-12 text-gray-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Looks like you haven't added any fresh produce to your cart yet. Start shopping to fill it up!
          </p>
          <Link to="/">
            <Button className="flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5" />
              <span>Start Shopping</span>
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
        <p className="text-gray-600">
          {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <div key={item.id} className="card p-6">
              <div className="flex items-center space-x-4">
                {/* Product Image */}
                <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Product Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
                      <p className="text-sm text-gray-600">{item.farmName}</p>
                      {item.isOrganic && (
                        <span className="inline-flex items-center space-x-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium mt-2">
                          <Leaf className="w-3 h-3" />
                          <span>Organic</span>
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-gray-400 hover:text-red-500 transition-all duration-300 ease-in-out"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Price and Quantity */}
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg font-bold text-primary">
                        ${item.price}/{item.unit}
                      </span>
                      <div className="flex items-center border border-gray-300 rounded-lg">
                        <button
                          onClick={() => handleQuantityChange(item.id, -1)}
                          className="p-1 hover:bg-gray-100 transition-all duration-300 ease-in-out"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="px-3 py-1 text-center min-w-[3rem]">
                          {item.quantity} {item.unit}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item.id, 1)}
                          className="p-1 hover:bg-gray-100 transition-all duration-300 ease-in-out"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Promo Code */}
          <div className="card p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Promo Code</h3>
            <div className="flex space-x-3">
              <input
                type="text"
                placeholder="Enter promo code"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="input-field flex-1"
                disabled={promoApplied}
              />
              <Button
                onClick={handleApplyPromo}
                disabled={!promoCode || promoApplied}
                variant="outline"
              >
                {promoApplied ? 'Applied' : 'Apply'}
              </Button>
            </div>
            {promoApplied && (
              <p className="text-sm text-green-600 mt-2">
                Promo code applied! You saved ${(discount).toFixed(2)}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-2">
              Try: FRESH10 (10% off) or WELCOME20 (20% off)
            </p>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-24">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              
              {promoApplied && (
                <div className="flex justify-between text-green-600">
                  <span>Promo Discount</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}
              
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>
                  {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                </span>
              </div>
              
              <div className="flex justify-between text-gray-600">
                <span>Tax</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-semibold text-gray-900">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Shipping Info */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <Truck className="w-5 h-5 text-primary" />
                <span>Free shipping on orders over $25</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <Shield className="w-5 h-5 text-primary" />
                <span>Quality guarantee</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <Leaf className="w-5 h-5 text-primary" />
                <span>Farm-fresh delivery</span>
              </div>
            </div>

            {/* Checkout Button */}
            <Button className="w-full flex items-center justify-center space-x-2 mb-4">
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-5 h-5" />
            </Button>

            {/* Continue Shopping */}
            <Link to="/" className="block text-center">
              <Button variant="outline" className="w-full">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
