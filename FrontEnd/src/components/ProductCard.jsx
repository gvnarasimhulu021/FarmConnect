import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Star, MapPin } from 'lucide-react';

const ProductCard = ({ product }) => {
  const handleAddToCart = (e) => {
    e.preventDefault();
    // Add to cart logic here
    console.log('Added to cart:', product.id);
  };

  return (
    <Link to={`/product/${product.id}`} className="block group">
      <div className="card h-full overflow-hidden hover:transform hover:scale-105 transition-all duration-300 ease-in-out">
        {/* Product Image */}
        <div className="relative h-48 bg-gray-100 overflow-hidden">
          <img
            src={product.image || `https://images.unsplash.com/photo-${Math.random()}/400x300?fit=crop`}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-all duration-300 ease-in-out duration-500"
          />
          {product.isOrganic && (
            <span className="absolute top-2 left-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
              Organic
            </span>
          )}
          {product.discount && (
            <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
              {product.discount}% OFF
            </span>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4 space-y-3">
          {/* Farmer Info */}
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            <span>{product.farmName}</span>
          </div>

          {/* Product Name */}
          <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-all duration-300 ease-in-out line-clamp-1">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center space-x-1">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(product.rating || 4)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">
              ({product.reviews || 0})
            </span>
          </div>

          {/* Price and Quantity */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-bold text-primary">
                ${product.price}
                <span className="text-sm text-gray-500 font-normal">/{product.unit}</span>
              </p>
              {product.originalPrice && (
                <p className="text-sm text-gray-500 line-through">
                  ${product.originalPrice}/{product.unit}
                </p>
              )}
            </div>
            <span className="text-sm text-gray-600">
              {product.quantity} {product.unit} available
            </span>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            className="w-full btn-primary flex items-center justify-center space-x-2 hover:bg-primary/90"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Add to Cart</span>
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
