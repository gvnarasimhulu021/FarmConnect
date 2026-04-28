import { useEffect, useMemo, useState } from 'react'
import { categoryConfig, roleViewConfig } from './constants.js'
import { useFarmConnect } from '../hooks/useFarmConnect.js'
import { enrichProduct } from '../utils/products.js'
import Topbar from '../layout/Topbar.jsx'
import Sidebar from '../layout/Sidebar.jsx'
import MobileBottomNav from '../layout/MobileBottomNav.jsx'
import LoginPage from '../pages/LoginPage.jsx'
import DashboardPage from '../pages/DashboardPage.jsx'
import ProductsPage from '../pages/ProductsPage.jsx'
import OrdersPage from '../pages/OrdersPage.jsx'
import UsersPage from '../pages/UsersPage.jsx'
import SettingsPage from '../pages/SettingsPage.jsx'
import CartPage from '../pages/CartPage.jsx'
import FarmersPage from '../pages/FarmersPage.jsx'
import ProductDetailModal from '../modals/ProductDetailModal.jsx'

function App() {
  const farmConnect = useFarmConnect()
  const [activeView, setActiveView] = useState('home')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const { auth, products, farmers, orders, users, authUsers, profile, cart, cartItems, cartTotal, notice, error, loading } =
    farmConnect

  const navItems = roleViewConfig[auth.user?.role] ?? []
  const safeActiveView = navItems.some((item) => item.id === activeView) ? activeView : navItems[0]?.id

  const preparedProducts = useMemo(() => products.map(enrichProduct), [products])

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase()
    return preparedProducts.filter((product) => {
      const matchesSearch =
        !term ||
        [product.name, product.description, product.categoryLabel, String(product.farmerId)]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(term))
      const matchesCategory = activeCategory === 'all' || product.category === activeCategory
      return matchesSearch && matchesCategory
    })
  }, [preparedProducts, search, activeCategory])

  const groupedProducts = useMemo(() => {
    return Object.entries(categoryConfig)
      .map(([key, meta]) => ({ key, ...meta, items: filteredProducts.filter((product) => product.category === key) }))
      .filter((group) => group.items.length)
  }, [filteredProducts])

  const cartItemCount = useMemo(
    () => Object.values(cart).reduce((sum, quantity) => sum + (Number(quantity) > 0 ? Number(quantity) : 0), 0),
    [cart]
  )

  const stats = useMemo(() => {
    const totalSales = orders.reduce((sum, order) => sum + Number(order.totalAmount ?? 0), 0)
    const delivered = orders.filter((order) => order.status === 'DELIVERED').length
    const placed = orders.filter((order) => order.status === 'PLACED').length
    return {
      totalSales,
      delivered,
      placed,
      earnings: profile?.totalEarnings ?? totalSales,
    }
  }, [orders, profile])

  useEffect(() => {
    if (auth.user && safeActiveView === 'orders') {
      void farmConnect.loadPrivateData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.user?.id, auth.user?.role, safeActiveView])

  useEffect(() => {
    if (auth.user?.role !== 'USER') {
      return
    }

    if (safeActiveView !== 'home') {
      return
    }

    void farmConnect.loadProducts()
    const intervalId = setInterval(() => {
      void farmConnect.loadProducts()
    }, 20000)

    return () => clearInterval(intervalId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.user?.id, auth.user?.role, safeActiveView])

  if (!auth.user) {
    return <LoginPage farmConnect={farmConnect} notice={notice} error={error} loading={loading} products={products} />
  }

  const viewTitleMap = {
    home: 'Home',
    cart: 'Cart & Checkout',
    orders: auth.user.role === 'USER' ? 'Order Tracking' : 'Orders',
    settings: 'Profile',
    dashboard: auth.user.role === 'ADMIN' ? 'Admin dashboard' : 'Farmer dashboard',
    inventory: 'Inventory',
    users: 'User management',
    farmers: 'Farmer management',
  }

  const title = viewTitleMap[safeActiveView] ?? 'FarmConnect'
  const subtitle =
    auth.user.role === 'ADMIN'
      ? 'Role-based workspace · Full platform control'
      : auth.user.role === 'FARMER' && safeActiveView === 'inventory'
        ? 'Manage your products, stock, and pricing'
      : auth.user.role === 'USER' && safeActiveView === 'cart'
        ? 'Review items before placing your order'
      : auth.user.role === 'USER' && safeActiveView === 'orders'
        ? 'Track placed orders and delivery status'
      : auth.user.role === 'USER' && safeActiveView === 'settings'
        ? 'Manage your personal account details'
      : auth.user.role === 'USER'
        ? 'Browse, checkout, and track orders'
        : 'Role-based workspace'
  const showSearch = auth.user.role === 'USER' && safeActiveView === 'home'
  const showCartShortcut = auth.user.role === 'USER' && safeActiveView !== 'cart'
  const showProfileShortcut =
    (auth.user.role === 'USER' || auth.user.role === 'FARMER') && safeActiveView !== 'settings'
  const isAdminPortal = auth.user.role === 'ADMIN'
  const isFarmerPortal = auth.user.role === 'FARMER'

  return (
    <main
      className={`${isAdminPortal || isFarmerPortal ? 'bg-[#eaf4ed]' : 'app-shell'} px-2 py-2 sm:px-4 sm:py-3`}
      style={
        isAdminPortal
          ? {
              backgroundImage:
                'radial-gradient(rgba(16, 185, 129, 0.2) 1px, transparent 1px), linear-gradient(#eaf4ed, #eaf4ed)',
              backgroundSize: '24px 24px, auto',
            }
          : isFarmerPortal
            ? {
                backgroundImage: 'linear-gradient(#edf5ef, #edf5ef)',
              }
          : undefined
      }
    >
      <div className="mx-auto flex min-h-[calc(100vh-24px)] w-full max-w-[1500px] gap-3 sm:gap-4">
        <Sidebar navItems={navItems} activeView={safeActiveView} setActiveView={setActiveView} auth={auth} onSignOut={farmConnect.signOut} />

        <div className="flex min-w-0 flex-1 flex-col gap-3 pb-20 sm:gap-4 sm:pb-24 lg:pb-3">
          <Topbar
            auth={auth}
            title={title}
            subtitle={subtitle}
            search={search}
            setSearch={setSearch}
            showSearch={showSearch}
            notice={notice}
            error={error}
            showCartShortcut={showCartShortcut}
            cartItemCount={cartItemCount}
            onOpenCart={() => setActiveView('cart')}
            showProfileShortcut={showProfileShortcut}
            onOpenProfile={() => setActiveView('settings')}
            onSignOut={farmConnect.signOut}
          />

          {safeActiveView === 'dashboard' && (
            <DashboardPage
              auth={auth}
              products={filteredProducts}
              farmers={farmers}
              orders={orders}
              authUsers={authUsers}
              stats={stats}
              setActiveView={setActiveView}
            />
          )}

          {(safeActiveView === 'home' || safeActiveView === 'inventory') && (
            <ProductsPage
              auth={auth}
              products={filteredProducts}
              groupedProducts={groupedProducts}
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
              cart={cart}
              loading={loading}
              productForm={farmConnect.productForm}
              onCartChange={farmConnect.setCart}
              onEditProduct={farmConnect.setProductForm}
              onDeleteProduct={farmConnect.removeProduct}
              onSubmitProduct={farmConnect.saveProduct}
              onResetProduct={farmConnect.resetProductForm}
              setSelectedProduct={setSelectedProduct}
            />
          )}

          {safeActiveView === 'cart' && auth.user.role === 'USER' && (
            <CartPage
              cartItems={cartItems.map(enrichProduct)}
              cartTotal={cartTotal}
              loading={loading}
              onCartChange={farmConnect.setCart}
              onPlaceOrder={farmConnect.placeOrder}
              paymentMethod={farmConnect.checkoutPaymentMethod}
              onPaymentMethodChange={farmConnect.setCheckoutPaymentMethod}
            />
          )}

          {safeActiveView === 'orders' && (
            <OrdersPage
              auth={auth}
              orders={orders}
              onAdvanceOrder={farmConnect.advanceOrder}
              onConfirmPayment={farmConnect.confirmOrderPayment}
              onCompletePayout={farmConnect.completePayout}
              onRefreshOrders={farmConnect.loadPrivateData}
            />
          )}

          {safeActiveView === 'users' && (
            <UsersPage
              auth={auth}
              users={users}
              authUsers={authUsers}
              farmers={farmers}
              loading={loading}
              onDeleteUser={(userId) => farmConnect.removeAccount(userId, 'User')}
            />
          )}

          {safeActiveView === 'farmers' && (
            <FarmersPage
              auth={auth}
              farmers={farmers}
              loading={loading}
              onDeleteFarmer={(farmerId) => farmConnect.removeAccount(farmerId, 'Farmer')}
            />
          )}

          {safeActiveView === 'settings' && (
            <SettingsPage auth={auth} profile={profile} loading={loading} farmConnect={farmConnect} />
          )}
        </div>
      </div>

      <MobileBottomNav navItems={navItems} activeView={safeActiveView} setActiveView={setActiveView} />

      {selectedProduct && (
        <ProductDetailModal
          auth={auth}
          product={selectedProduct}
          cartValue={cart[selectedProduct.id] ?? ''}
          onClose={() => setSelectedProduct(null)}
          onCartChange={farmConnect.setCart}
        />
      )}
    </main>
  )
}

export default App
