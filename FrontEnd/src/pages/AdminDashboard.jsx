import React, { useState } from 'react';
import { 
  Users, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  DollarSign, 
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  Settings,
  Eye,
  Edit,
  Trash2,
  UserPlus,
  Store,
  Leaf
} from 'lucide-react';
import Button from '../components/Button';
import InputField from '../components/InputField';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Mock data
  const stats = {
    totalUsers: 1248,
    totalFarmers: 156,
    totalProducts: 892,
    totalOrders: 3247,
    totalRevenue: 45680.50,
    pendingApprovals: 12,
    monthlyGrowth: 18.5,
    activeUsers: 892,
  };

  const recentUsers = [
    {
      id: 1,
      name: 'John Smith',
      email: 'john.smith@email.com',
      role: 'farmer',
      farmName: 'Green Valley Farm',
      status: 'active',
      joinDate: '2024-01-15',
      products: 12,
      rating: 4.8,
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      email: 'sarah.j@email.com',
      role: 'consumer',
      status: 'active',
      joinDate: '2024-01-14',
      orders: 8,
    },
    {
      id: 3,
      name: 'Mike Chen',
      email: 'mike.chen@email.com',
      role: 'farmer',
      farmName: 'Berry Good Farm',
      status: 'pending',
      joinDate: '2024-01-13',
      products: 6,
      rating: 0,
    },
    {
      id: 4,
      name: 'Emily Davis',
      email: 'emily.d@email.com',
      role: 'consumer',
      status: 'active',
      joinDate: '2024-01-12',
      orders: 15,
    },
  ];

  const pendingApprovals = [
    {
      id: 3,
      name: 'Mike Chen',
      email: 'mike.chen@email.com',
      farmName: 'Berry Good Farm',
      location: 'California, USA',
      products: 6,
      appliedDate: '2024-01-13',
      documents: ['business_license', 'organic_certification'],
    },
    {
      id: 5,
      name: 'Lisa Wang',
      email: 'lisa.wang@email.com',
      farmName: 'Sunrise Organics',
      location: 'Oregon, USA',
      products: 8,
      appliedDate: '2024-01-11',
      documents: ['business_license'],
    },
  ];

  const systemAlerts = [
    {
      id: 1,
      type: 'warning',
      message: 'Server response time increased by 25%',
      time: '2 hours ago',
    },
    {
      id: 2,
      type: 'info',
      message: 'New feature deployment scheduled for tonight',
      time: '4 hours ago',
    },
    {
      id: 3,
      type: 'error',
      message: 'Payment gateway experiencing issues',
      time: '6 hours ago',
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAlertColor = (type) => {
    switch (type) {
      case 'error':
        return 'bg-red-50 border-red-200 text-red-700';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-700';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-700';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'error':
        return <AlertTriangle className="w-5 h-5" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      case 'info':
        return <Clock className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <span className="text-sm text-green-600 font-medium">+15%</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{stats.totalUsers}</h3>
          <p className="text-gray-600">Total Users</p>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
              <Store className="w-6 h-6 text-secondary" />
            </div>
            <span className="text-sm text-green-600 font-medium">+8%</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{stats.totalFarmers}</h3>
          <p className="text-gray-600">Active Farmers</p>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-sm text-green-600 font-medium">+18.5%</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">${stats.totalRevenue.toFixed(0)}</h3>
          <p className="text-gray-600">Total Revenue</p>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <span className="text-sm text-red-600 font-medium">Need action</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{stats.pendingApprovals}</h3>
          <p className="text-gray-600">Pending Approvals</p>
        </div>
      </div>

      {/* Recent Activity & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Users */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Users</h3>
            <Button variant="outline" size="small">View All</Button>
          </div>
          <div className="space-y-4">
            {recentUsers.slice(0, 4).map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-primary font-semibold">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-600">{user.role}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                    {user.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Alerts */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">System Alerts</h3>
            <Button variant="outline" size="small">View All</Button>
          </div>
          <div className="space-y-4">
            {systemAlerts.map((alert) => (
              <div key={alert.id} className={`p-4 border rounded-lg ${getAlertColor(alert.type)}`}>
                <div className="flex items-start space-x-3">
                  {getAlertIcon(alert.type)}
                  <div className="flex-1">
                    <p className="font-medium">{alert.message}</p>
                    <p className="text-sm opacity-75 mt-1">{alert.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Button onClick={() => setShowAddUserModal(true)} className="flex items-center justify-center space-x-2">
          <UserPlus className="w-5 h-5" />
          <span>Add User</span>
        </Button>
        <Button variant="outline" className="flex items-center justify-center space-x-2">
          <BarChart3 className="w-5 h-5" />
          <span>Analytics</span>
        </Button>
        <Button variant="outline" className="flex items-center justify-center space-x-2">
          <Settings className="w-5 h-5" />
          <span>Settings</span>
        </Button>
        <Button variant="outline" className="flex items-center justify-center space-x-2">
          <Leaf className="w-5 h-5" />
          <span>Farm Approvals</span>
        </Button>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
        <Button onClick={() => setShowAddUserModal(true)} className="flex items-center space-x-2">
          <UserPlus className="w-5 h-5" />
          <span>Add User</span>
        </Button>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-wrap gap-4">
          <InputField placeholder="Search users..." className="flex-1 min-w-[200px]" />
          <select className="input-field py-2 px-3">
            <option value="">All Roles</option>
            <option value="consumer">Consumer</option>
            <option value="farmer">Farmer</option>
            <option value="admin">Admin</option>
          </select>
          <select className="input-field py-2 px-3">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Join Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-primary font-semibold">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                        {user.farmName && (
                          <div className="text-xs text-gray-500">{user.farmName}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {user.joinDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderApprovals = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Farm Approvals</h2>
      
      <div className="space-y-4">
        {pendingApprovals.map((farmer) => (
          <div key={farmer.id} className="card p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{farmer.name}</h3>
                <p className="text-gray-600">{farmer.email}</p>
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                  <span className="flex items-center space-x-1">
                    <Store className="w-4 h-4" />
                    <span>{farmer.farmName}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Leaf className="w-4 h-4" />
                    <span>{farmer.products} products</span>
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Applied: {farmer.appliedDate}</p>
                <div className="flex space-x-2 mt-2">
                  <Button size="small" className="flex items-center space-x-1">
                    <CheckCircle className="w-4 h-4" />
                    <span>Approve</span>
                  </Button>
                  <Button variant="outline" size="small" className="flex items-center space-x-1 text-red-500 hover:text-red-600">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Reject</span>
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-900 mb-2">Documents</h4>
              <div className="flex flex-wrap gap-2">
                {farmer.documents.map((doc, index) => (
                  <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                    {doc.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="container">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Manage users, farms, and system operations</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="flex space-x-8">
          {['overview', 'users', 'approvals'].map((tab) => (
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
      {activeTab === 'users' && renderUsers()}
      {activeTab === 'approvals' && renderApprovals()}

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-card p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Add New User</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <InputField label="First Name" placeholder="John" />
                <InputField label="Last Name" placeholder="Doe" />
              </div>
              <InputField label="Email" type="email" placeholder="john.doe@example.com" />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <select className="input-field w-full">
                  <option value="">Select Role</option>
                  <option value="consumer">Consumer</option>
                  <option value="farmer">Farmer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <InputField label="Phone" type="tel" placeholder="(555) 123-4567" />
              <InputField label="Address" placeholder="123 Farm Road, City, State 12345" />
            </div>
            <div className="flex space-x-4 mt-6">
              <Button onClick={() => setShowAddUserModal(false)} className="flex-1">
                Add User
              </Button>
              <Button variant="outline" onClick={() => setShowAddUserModal(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
