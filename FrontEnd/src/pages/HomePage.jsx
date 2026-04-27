import React, { useState, useEffect } from 'react';
import { Search, Filter, Star, Leaf, TrendingUp, Clock } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import Button from '../components/Button';
import InputField from '../components/InputField';

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [isLoading, setIsLoading] = useState(true);

  const categories = [
    { id: 'all', name: 'All Products', icon: Leaf },
    { id: 'vegetables', name: 'Vegetables', icon: Leaf },
    { id: 'fruits', name: 'Fruits', icon: Leaf },
    { id: 'dairy', name: 'Dairy', icon: Leaf },
    { id: 'grains', name: 'Grains', icon: Leaf },
    { id: 'herbs', name: 'Herbs', icon: Leaf },
  ];

  const sortOptions = [
    { id: 'featured', name: 'Featured' },
    { id: 'price-low', name: 'Price: Low to High' },
    { id: 'price-high', name: 'Price: High to Low' },
    { id: 'rating', name: 'Highest Rated' },
    { id: 'newest', name: 'Newest First' },
  ];

  // Mock products data
  const mockProducts = [
    {
      id: 1,
      name: 'Organic Tomatoes',
      farmName: 'Green Valley Farm',
      price: 4.99,
      unit: 'lb',
      originalPrice: 6.99,
      quantity: 50,
      rating: 4.8,
      reviews: 124,
      category: 'vegetables',
      isOrganic: true,
      discount: 30,
      image: 'https://images.unsplash.com/photo-1546470437-e42b53d9a56c?w=400&h=300&fit=crop',
    },
    {
      id: 2,
      name: 'Fresh Strawberries',
      farmName: 'Berry Good Farm',
      price: 5.99,
      unit: 'lb',
      quantity: 30,
      rating: 4.9,
      reviews: 89,
      category: 'fruits',
      isOrganic: true,
      image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400&h=300&fit=crop',
    },
    {
      id: 3,
      name: 'Free-Range Eggs',
      farmName: 'Happy Chickens Farm',
      price: 4.50,
      unit: 'dozen',
      quantity: 24,
      rating: 4.7,
      reviews: 156,
      category: 'dairy',
      image: 'https://images.unsplash.com/photo-1518569656558-1f25e69393e7?w=400&h=300&fit=crop',
    },
    {
      id: 4,
      name: 'Sweet Corn',
      farmName: 'Golden Fields',
      price: 0.75,
      unit: 'ear',
      quantity: 100,
      rating: 4.6,
      reviews: 67,
      category: 'vegetables',
      image: 'https://images.unsplash.com/photo-1595901258023-1ac558334d9b?w=400&h=300&fit=crop',
    },
    {
      id: 5,
      name: 'Fresh Basil',
      farmName: 'Herb Garden',
      price: 2.99,
      unit: 'bunch',
      quantity: 40,
      rating: 4.5,
      reviews: 45,
      category: 'herbs',
      isOrganic: true,
      image: 'https://images.unsplash.com/photo-1581375382235-765e5fc2e7d4?w=400&h=300&fit=crop',
    },
    {
      id: 6,
      name: 'Whole Milk',
      farmName: 'Dairy Delights',
      price: 3.99,
      unit: 'gallon',
      quantity: 15,
      rating: 4.4,
      reviews: 92,
      category: 'dairy',
      image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&h=300&fit=crop',
    },
    {
      id: 7,
      name: 'Red Apples',
      farmName: 'Orchard Hills',
      price: 2.49,
      unit: 'lb',
      originalPrice: 2.99,
      quantity: 200,
      rating: 4.7,
      reviews: 203,
      category: 'fruits',
      discount: 20,
      image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&h=300&fit=crop',
    },
    {
      id: 8,
      name: 'Quinoa',
      farmName: 'Harvest Moon Farm',
      price: 7.99,
      unit: 'lb',
      quantity: 25,
      rating: 4.8,
      reviews: 78,
      category: 'grains',
      isOrganic: true,
      image: 'https://images.unsplash.com/photo-1535607639224-5ae8242312c3?w=400&h=300&fit=crop',
    },
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setProducts(mockProducts);
      setFilteredProducts(mockProducts);
      setIsLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    let filtered = products;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.farmName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort products
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        filtered.sort((a, b) => b.id - a.id);
        break;
      default:
        // featured - keep original order
        break;
    }

    setFilteredProducts(filtered);
  }, [products, selectedCategory, searchTerm, sortBy]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  const handleSortChange = (sortId) => {
    setSortBy(sortId);
  };

  return (
    <div className="container">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-secondary rounded-card p-8 mb-8 text-white">
        <div className="max-w-3xl">
          <h1 className="text-4xl font-bold mb-4">Fresh From Local Farms</h1>
          <p className="text-xl mb-6 opacity-90">
            Connect directly with local farmers and get the freshest produce delivered to your doorstep.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <InputField
                  placeholder="Search for fresh produce..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="pl-10"
                />
              </div>
            </div>
            <Button variant="secondary" className="flex items-center space-x-2">
              <Filter className="w-5 h-5" />
              <span>Filters</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card p-6 text-center">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Leaf className="w-6 h-6 text-primary" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">100% Organic Options</h3>
          <p className="text-gray-600 text-sm">Choose from a wide selection of certified organic produce</p>
        </div>
        <div className="card p-6 text-center">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-6 h-6 text-primary" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Support Local Farmers</h3>
          <p className="text-gray-600 text-sm">Every purchase directly supports local farming families</p>
        </div>
        <div className="card p-6 text-center">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-6 h-6 text-primary" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Fresh Delivery</h3>
          <p className="text-gray-600 text-sm">Farm-to-table freshness guaranteed within 24 hours</p>
        </div>
      </div>

      {/* Categories */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Shop by Category</h2>
        <div className="flex flex-wrap gap-3">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full border-2 transition-all duration-300 ease-in-out ${
                  selectedCategory === category.id
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-gray-300 text-gray-600 hover:border-gray-400'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium">{category.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sort Options */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {selectedCategory === 'all' ? 'All Products' : categories.find(c => c.id === selectedCategory)?.name}
          <span className="text-gray-500 font-normal text-lg ml-2">({filteredProducts.length})</span>
        </h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className="input-field py-2 px-3 text-sm"
          >
            {sortOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div className="grid-responsive">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="card h-80 animate-pulse">
              <div className="h-48 bg-gray-200 rounded-t-card"></div>
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="grid-responsive">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Leaf className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-600">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
};

export default HomePage;
