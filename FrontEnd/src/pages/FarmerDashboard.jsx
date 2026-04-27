import React, { useState } from 'react';
import { 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Calendar,
  DollarSign,
  Leaf,
  Star,
  AlertCircle,
  BarChart3,
  Settings
} from 'lucide-react';
import Button from '../components/Button';
import InputField from '../components/InputField';

const FarmerDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Mock data
  const stats = {
    totalProducts: 12,
    totalOrders: 156,
    totalRevenue: 4580.50,
    averageRating: 4.7,
    pendingOrders: 8,
    monthlyGrowth: 23.5,
  };

  const products = [
    {
      id: 1,
      name: 'Organic Tomatoes',
      category: 'Vegetables',
      price: 4.99,
      unit: 'lb',
      quantity: 50,
      sold: 120,
      rating: 4.8,
      reviews: 45,
      status: 'active',
      image: 'https://images.unsplash.com/photo-1546470437-e42b53d9a56c?w=200&h=200&fit=crop',
    },
    {
      id: 2,
      name: 'Fresh Strawberries',
      category: 'Fruits',
      price: 5.99,
      unit: 'lb',
      quantity: 30,
      sold: 85,
      rating: 4.9,
      reviews: 32,
      status: 'active',
      image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=200&h=200&fit=crop',
    },
    {
      id: 3,
      name: 'Free-Range Eggs',
      category: 'Dairy',
      price: 4.50,
      unit: 'dozen',
      quantity: 15,
      sold: 200,
      rating: 4.7,
      reviews: 67,
      status: 'low-stock',
      image: 'https://images.unsplash.com/photo-1518569656558-1ac558334d9e?w=200&h=200&fit=crop',
    },
    {
      id: 4,
      name: 'Sweet Corn',
      category: 'Vegetables',
      price: 0.75,
      unit: 'ear',
      quantity: 0,
      sold: 150,
      rating: 4.6,
      reviews: 28,
      status: 'out-of-stock',
      image: 'https://images.unsplash.com/photo-1595901258023-1ac558334d9b?w=200&h=200&fit=crop',
    },
  ];

  const orders = [
    {
      id: 1001,
      customer: 'Sarah Johnson',
      date: '2024-01-15',
      total: 45.99,
      status: 'pending',
      items: [
        { name: 'Organic Tomatoes', quantity: 2, price: 4.99 },
        { name: 'Fresh Strawberries', quantity: 3, price: 5.99 },
      ],
    },
    {
      id: 1002,
      customer: 'Mike Chen',
      date: '2024-01-14',
      total: 28.50,
      status: 'processing',
      items: [
        { name: 'Free-Range Eggs', quantity: 2, price: 4.50 },
        { name: 'Sweet Corn', quantity: 10, price: 0.75 },
      ],
    },
    {
      id: 1003,
      customer: 'Emily Davis',
      date: '2024-01-14',
      total: 67.25,
      status: 'completed',
      items: [
        { name: 'Organic Tomatoes', quantity: 5, price: 4.99 },
        { name: 'Fresh Strawberries', quantity: 4, price: 5.99 },
      ],
    },
  ];

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

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'low-stock':
        return 'bg-yellow-100 text-yellow-800';
      case 'out-of-stock':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-primary" />
            </div>
            <span className="text-sm text-green-600 font-medium">+12%</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{stats.totalProducts}</h3>
          <p className="text-gray-600">Total Products</p>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-secondary" />
            </div>
            <span className="text-sm text-green-600 font-medium">+8%</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{stats.totalOrders}</h3>
          <p className="text-gray-600">Total Orders</p>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-sm text-green-600 font-medium">+23.5%</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">${stats.totalRevenue.toFixed(2)}</h3>
          <p className="text-gray-600">Total Revenue</p>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
            <span className="text-sm text-green-600 font-medium">+0.2</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{stats.averageRating}</h3>
          <p className="text-gray-600">Average Rating</p>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
          <Button variant="outline" size="small">View All</Button>
        </div>
        <div className="space-y-4">
          {orders.slice(0, 3).map((order) => (
            <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Order #{order.id}</p>
                <p className="text-sm text-gray-600">{order.customer} • {order.date}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">${order.total.toFixed(2)}</p>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Button onClick={() => setShowAddProductModal(true)} className="flex items-center justify-center space-x-2">
          <Plus className="w-5 h-5" />
          <span>Add New Product</span>
        </Button>
        <Button variant="outline" className="flex items-center justify-center space-x-2">
          <BarChart3 className="w-5 h-5" />
          <span>View Analytics</span>
        </Button>
        <Button variant="outline" className="flex items-center justify-center space-x-2">
          <Settings className="w-5 h-5" />
          <span>Farm Settings</span>
        </Button>
      </div>
    </div>
  );

  const renderProducts = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">My Products</h2>
        <Button onClick={() => setShowAddProductModal(true)} className="flex items-center space-x-2">
          <Plus className="w-5 h-5" />
          <span>Add Product</span>
        </Button>
      </div>

      <div className="grid-responsive">
        {products.map((product) => (
          <div key={product.id} className="card p-6">
            <div className="flex items-start space-x-4">
              <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900">{product.name}</h3>
                    <p className="text-sm text-gray-600">{product.category}</p>
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
                    {product.status.replace('-', ' ')}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-lg font-bold text-primary">${product.price}/{product.unit}</p>
                    <p className="text-sm text-gray-600">{product.quantity} {product.unit} available</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">{product.sold} sold</p>
                    {renderStars(product.rating)}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="small" className="flex items-center space-x-1">
                    <Eye className="w-4 h-4" />
                    <span>View</span>
                  </Button>
                  <Button variant="outline" size="small" className="flex items-center space-x-1">
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </Button>
                  <Button variant="outline" size="small" className="flex items-center space-x-1 text-red-500 hover:text-red-600">
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderOrders = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Orders</h2>
      
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{order.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.customer}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {order.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${order.total.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    <Button variant="outline" size="small">View Details</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Farmer Dashboard</h1>
        <p className="text-gray-600">Manage your farm products and orders</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="flex space-x-8">
          {['overview', 'products', 'orders'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-all duration-300 ease-in-out capitalize ${
                activeTab === tab
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'products' && renderProducts()}
      {activeTab === 'orders' && renderOrders()}

      {/* Add Product Modal */}
      {showAddProductModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-card p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Add New Product</h3>
            <div className="space-y-4">
              <InputField label="Product Name" placeholder="Enter product name" />
              <InputField label="Category" placeholder="e.g., Vegetables, Fruits, Dairy" />
              <div className="grid grid-cols-2 gap-4">
                <InputField label="Price" type="number" placeholder="0.00" />
                <InputField label="Unit" placeholder="e.g., lb, dozen, bunch" />
              </div>
              <InputField label="Quantity Available" type="number" placeholder="0" />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Image</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Leaf className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">Click to upload image</p>
                </div>
              </div>
            </div>
            <div className="flex space-x-4 mt-6">
              <Button onClick={() => setShowAddProductModal(false)} className="flex-1">
                Add Product
              </Button>
              <Button variant="outline" onClick={() => setShowAddProductModal(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmerDashboard;
