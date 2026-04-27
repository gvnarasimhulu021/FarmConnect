# FarmConnect - React.js Frontend

A modern, responsive React.js application for connecting local farmers with consumers. Built with Vite, Tailwind CSS, and React Router.

## 🌟 Features

- **Responsive Design**: Fully responsive layout that works on desktop, tablet, and mobile devices
- **Modern UI**: Clean, card-based design with consistent color scheme and smooth transitions
- **User Authentication**: Login and registration pages with form validation
- **Product Catalog**: Browse and search farm-fresh products with filtering and sorting
- **Product Details**: Detailed product pages with reviews, nutrition info, and related products
- **Shopping Cart**: Full cart functionality with promo codes and order summary
- **Farmer Dashboard**: Manage products, orders, and view analytics
- **Admin Dashboard**: User management, farm approvals, and system administration
- **Reusable Components**: Modular component architecture for maintainability

## 🎨 Design System

### Color Palette
- **Primary**: #2E7D32 (Green)
- **Secondary**: #66BB6A (Light Green)
- **Background**: #F5F7F6 (Light Gray)
- **Card**: #FFFFFF (White)

### Typography
- **Font**: Inter/Poppins (system fonts as fallback)
- **Weights**: 300, 400, 500, 600, 700

### Components
- **Button**: Primary, Secondary, Outline variants
- **InputField**: Consistent form inputs with validation
- **ProductCard**: Reusable product display cards
- **Navbar**: Responsive navigation with hamburger menu
- **Layout**: Consistent page layout with footer

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd FarmConnect/FrontEnd
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## 📱 Responsive Breakpoints

- **Mobile**: < 768px (1 column grid)
- **Tablet**: 768px - 1024px (2 columns grid)
- **Desktop**: > 1024px (3-4 columns grid)

## 🛠️ Technologies Used

- **React 18**: Modern React with hooks
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework
- **React Router**: Client-side routing
- **Lucide React**: Icon library

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Button.jsx
│   ├── InputField.jsx
│   ├── Layout.jsx
│   ├── Navbar.jsx
│   └── ProductCard.jsx
├── pages/              # Page components
│   ├── AdminDashboard.jsx
│   ├── CartPage.jsx
│   ├── FarmerDashboard.jsx
│   ├── HomePage.jsx
│   ├── LoginPage.jsx
│   ├── ProductDetailsPage.jsx
│   └── RegisterPage.jsx
├── App.jsx            # Main App component with routing
├── main.jsx           # Application entry point
└── index.css          # Global styles and Tailwind imports
```

## 🎯 Pages

### Public Pages
- **Home**: Product catalog with search and filtering
- **Login**: User authentication
- **Register**: New user registration
- **Product Details**: Individual product information
- **Cart**: Shopping cart management

### Protected Pages
- **Farmer Dashboard**: Product and order management for farmers
- **Admin Dashboard**: System administration and user management

## 🔧 Configuration Files

- `vite.config.js`: Vite configuration
- `tailwind.config.js`: Tailwind CSS customization
- `postcss.config.js`: PostCSS configuration
- `package.json`: Dependencies and scripts

## 🎨 UI Features

- **Hover Effects**: Smooth transitions on all interactive elements
- **Card Animations**: Subtle scale and shadow effects on hover
- **Loading States**: Skeleton loaders for async content
- **Form Validation**: Real-time form validation with error states
- **Mobile Menu**: Responsive hamburger navigation
- **Search & Filter**: Advanced product filtering and sorting

## 📊 Mock Data

The application includes comprehensive mock data for:
- Products with categories, pricing, and ratings
- User accounts and authentication
- Shopping cart functionality
- Order management
- Dashboard analytics

## 🔄 State Management

Currently using React's built-in state management (useState, useContext). Can be extended with Redux or Zustand for larger applications.

## 🚀 Deployment

The application is optimized for deployment to any static hosting service:
- Vercel
- Netlify
- GitHub Pages
- AWS S3

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support and questions, please open an issue in the repository.
