import React from 'react';
import Navbar from './Navbar';

const Layout = ({ children, user, onLogout }) => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} onLogout={onLogout} />
      <main className="py-8">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="bg-card border-t border-gray-200 mt-auto">
        <div className="container py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">F</span>
                </div>
                <span className="text-xl font-semibold text-primary">FarmConnect</span>
              </div>
              <p className="text-gray-600 text-sm">
                Connecting local farmers with consumers for fresh, sustainable produce.
              </p>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Quick Links</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="/about" className="hover:text-primary transition-all duration-300 ease-in-out">About Us</a></li>
                <li><a href="/farmers" className="hover:text-primary transition-all duration-300 ease-in-out">For Farmers</a></li>
                <li><a href="/consumers" className="hover:text-primary transition-all duration-300 ease-in-out">For Consumers</a></li>
                <li><a href="/contact" className="hover:text-primary transition-all duration-300 ease-in-out">Contact</a></li>
              </ul>
            </div>

            {/* Support */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Support</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="/help" className="hover:text-primary transition-all duration-300 ease-in-out">Help Center</a></li>
                <li><a href="/shipping" className="hover:text-primary transition-all duration-300 ease-in-out">Shipping Info</a></li>
                <li><a href="/returns" className="hover:text-primary transition-all duration-300 ease-in-out">Returns</a></li>
                <li><a href="/faq" className="hover:text-primary transition-all duration-300 ease-in-out">FAQ</a></li>
              </ul>
            </div>

            {/* Newsletter */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Stay Updated</h3>
              <p className="text-gray-600 text-sm">
                Subscribe to get updates on new products and farm stories.
              </p>
              <div className="flex space-x-2">
                <input
                  type="email"
                  placeholder="Your email"
                  className="input-field flex-1"
                />
                <button className="btn-primary">Subscribe</button>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 mt-8 pt-8 text-center text-sm text-gray-600">
            <p>&copy; 2024 FarmConnect. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
