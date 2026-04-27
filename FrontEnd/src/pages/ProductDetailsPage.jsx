import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, 
  Star, 
  MapPin, 
  Leaf, 
  Truck, 
  Shield, 
  Heart, 
  Share2,
  ChevronLeft,
  Plus,
  Minus
} from 'lucide-react';
import Button from '../components/Button';
import InputField from '../components/InputField';

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [selectedTab, setSelectedTab] = useState('description');
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  // Mock product data - in real app, this would come from API
  const product = {
    id: parseInt(id),
    name: 'Organic Tomatoes',
    farmName: 'Green Valley Farm',
    farmerName: 'John Smith',
    price: 4.99,
    unit: 'lb',
    originalPrice: 6.99,
    quantity: 50,
    rating: 4.8,
    reviews: 124,
    category: 'vegetables',
    isOrganic: true,
    discount: 30,
    image: 'https://images.unsplash.com/photo-1546470437-e42b53d9a56c?w=600&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1546470437-e42b53d9a56c?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1592924397102-727ed5da5311?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1527838832700-5059252407fa?w=600&h=400&fit=crop',
    ],
    description: 'Fresh, juicy organic tomatoes grown without pesticides or synthetic fertilizers. Perfect for salads, sauces, or eating fresh off the vine. Our tomatoes are vine-ripened and harvested at peak flavor.',
    nutrition: {
      calories: 18,
      protein: 0.9,
      carbs: 3.9,
      fiber: 1.2,
      vitamins: ['Vitamin C', 'Vitamin K', 'Potassium'],
    },
    harvestDate: '2024-01-15',
    storage: 'Store at room temperature for up to 1 week, or refrigerate for up to 2 weeks.',
    shipping: 'Free shipping on orders over $25',
  };

  const reviews = [
    {
      id: 1,
      author: 'Sarah Johnson',
      rating: 5,
      date: '2024-01-10',
      comment: 'Best tomatoes I\'ve ever had! So fresh and flavorful. Will definitely order again.',
      helpful: 23,
    },
    {
      id: 2,
      author: 'Mike Chen',
      rating: 4,
      date: '2024-01-08',
      comment: 'Great quality tomatoes, very fresh. The price is a bit high but worth it for organic produce.',
      helpful: 15,
    },
    {
      id: 3,
      author: 'Emily Davis',
      rating: 5,
      date: '2024-01-05',
      comment: 'Perfect for my homemade sauce! The flavor is incredible and they arrived in perfect condition.',
      helpful: 18,
    },
  ];

  const relatedProducts = [
    {
      id: 2,
      name: 'Fresh Strawberries',
      farmName: 'Berry Good Farm',
      price: 5.99,
      unit: 'lb',
      rating: 4.9,
      reviews: 89,
      image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400&h=300&fit=crop',
    },
    {
      id: 3,
      name: 'Free-Range Eggs',
      farmName: 'Happy Chickens Farm',
      price: 4.50,
      unit: 'dozen',
      rating: 4.7,
      reviews: 156,
      image: 'https://images.unsplash.com/photo-1518569656558-1ac558334d9e?w=400&h=300&fit=crop',
    },
    {
      id: 4,
      name: 'Sweet Corn',
      farmName: 'Golden Fields',
      price: 0.75,
      unit: 'ear',
      rating: 4.6,
      reviews: 67,
      image: 'https://images.unsplash.com/photo-1595901258023-1ac558334d9b?w=400&h=300&fit=crop',
    },
  ];

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= product.quantity) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    setIsAddedToCart(true);
    setTimeout(() => setIsAddedToCart(false), 2000);
    console.log(`Added ${quantity} ${product.unit} of ${product.name} to cart`);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Check out this amazing ${product.name} from ${product.farmName}!`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Product link copied to clipboard!');
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i < Math.floor(rating)
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-1 text-sm text-gray-600">({rating})</span>
      </div>
    );
  };

  return (
    <div className="container">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center space-x-2 text-gray-600 hover:text-primary mb-6 transition-all duration-300 ease-in-out"
      >
        <ChevronLeft className="w-5 h-5" />
        <span>Back to Products</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="rounded-card overflow-hidden">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-96 object-cover"
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            {product.images.map((image, index) => (
              <div key={index} className="rounded-card overflow-hidden cursor-pointer hover:opacity-80 transition-all duration-300 ease-in-out">
                <img
                  src={image}
                  alt={`${product.name} ${index + 1}`}
                  className="w-full h-24 object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                <div className="flex items-center space-x-4 text-gray-600">
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span>{product.farmName}</span>
                  </div>
                  {renderStars(product.rating)}
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setIsFavorite(!isFavorite)}
                  className={`p-2 rounded-lg transition-all duration-300 ease-in-out ${
                    isFavorite
                      ? 'bg-red-50 text-red-500'
                      : 'bg-gray-100 text-gray-400 hover:text-red-500'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                </button>
                <button
                  onClick={handleShare}
                  className="p-2 bg-gray-100 text-gray-400 rounded-lg hover:text-primary transition-all duration-300 ease-in-out"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              {product.isOrganic && (
                <span className="inline-flex items-center space-x-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  <Leaf className="w-4 h-4" />
                  <span>Organic</span>
                </span>
              )}
              {product.discount && (
                <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {product.discount}% OFF
                </span>
              )}
            </div>

            {/* Price */}
            <div className="flex items-baseline space-x-3 mb-6">
              <span className="text-3xl font-bold text-primary">
                ${product.price}
              </span>
              <span className="text-gray-500">/{product.unit}</span>
              {product.originalPrice && (
                <span className="text-lg text-gray-400 line-through">
                  ${product.originalPrice}/{product.unit}
                </span>
              )}
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center space-x-4 mb-6">
              <span className="text-sm font-medium text-gray-700">Quantity:</span>
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  className="p-2 hover:bg-gray-100 transition-all duration-300 ease-in-out"
                  disabled={quantity <= 1}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Math.min(product.quantity, parseInt(e.target.value) || 1)))}
                  className="w-16 text-center border-0 focus:ring-0"
                  min="1"
                  max={product.quantity}
                />
                <button
                  onClick={() => handleQuantityChange(1)}
                  className="p-2 hover:bg-gray-100 transition-all duration-300 ease-in-out"
                  disabled={quantity >= product.quantity}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <span className="text-sm text-gray-600">
                {product.quantity} {product.unit} available
              </span>
            </div>

            {/* Add to Cart Button */}
            <Button
              onClick={handleAddToCart}
              className={`w-full flex items-center justify-center space-x-2 ${
                isAddedToCart ? 'bg-green-600 hover:bg-green-700' : ''
              }`}
            >
              <ShoppingCart className="w-5 h-5" />
              <span>{isAddedToCart ? 'Added to Cart!' : 'Add to Cart'}</span>
            </Button>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <Truck className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-xs text-gray-600">Free Shipping</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <Shield className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-xs text-gray-600">Quality Guaranteed</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <Leaf className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-xs text-gray-600">Farm Fresh</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="flex space-x-8">
          {['description', 'nutrition', 'reviews'].map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-all duration-300 ease-in-out ${
                selectedTab === tab
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mb-12">
        {selectedTab === 'description' && (
          <div className="prose max-w-none">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
                <p className="text-gray-600 mb-4">{product.description}</p>
                
                <h4 className="font-semibold text-gray-900 mb-2">Farm Information</h4>
                <div className="space-y-2 text-gray-600">
                  <p><strong>Farm:</strong> {product.farmName}</p>
                  <p><strong>Farmer:</strong> {product.farmerName}</p>
                  <p><strong>Harvest Date:</strong> {product.harvestDate}</p>
                  <p><strong>Storage:</strong> {product.storage}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Shipping & Returns</h4>
                <div className="space-y-2 text-gray-600">
                  <p>{product.shipping}</p>
                  <p>30-day return policy for fresh produce quality issues.</p>
                  <p>Delivered within 2-3 business days.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'nutrition' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Nutrition Facts</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Calories</span>
                    <span className="font-medium">{product.nutrition.calories}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Protein</span>
                    <span className="font-medium">{product.nutrition.protein}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Carbohydrates</span>
                    <span className="font-medium">{product.nutrition.carbs}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fiber</span>
                    <span className="font-medium">{product.nutrition.fiber}g</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Vitamins & Minerals</h4>
              <div className="flex flex-wrap gap-2">
                {product.nutrition.vitamins.map((vitamin, index) => (
                  <span key={index} className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                    {vitamin}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'reviews' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Customer Reviews</h3>
              <Button variant="outline" size="small">Write a Review</Button>
            </div>
            
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="card p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900">{review.author}</h4>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        {renderStars(review.rating)}
                        <span>•</span>
                        <span>{review.date}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-3">{review.comment}</p>
                  <div className="flex items-center space-x-4 text-sm">
                    <button className="text-gray-500 hover:text-primary transition-all duration-300 ease-in-out">
                      Helpful ({review.helpful})
                    </button>
                    <button className="text-gray-500 hover:text-primary transition-all duration-300 ease-in-out">
                      Report
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Related Products */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Products</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {relatedProducts.map((relatedProduct) => (
            <div key={relatedProduct.id} className="card hover:transform hover:scale-105 transition-all duration-300 ease-in-out cursor-pointer">
              <div className="h-48 bg-gray-100 rounded-t-card overflow-hidden">
                <img
                  src={relatedProduct.image}
                  alt={relatedProduct.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1">{relatedProduct.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{relatedProduct.farmName}</p>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-lg font-bold text-primary">
                      ${relatedProduct.price}/{relatedProduct.unit}
                    </span>
                  </div>
                  {renderStars(relatedProduct.rating)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;
