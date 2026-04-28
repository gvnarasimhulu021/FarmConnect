export const roleViewConfig = {
  USER: [
    { id: 'home', label: 'Home' },
    { id: 'cart', label: 'Cart' },
    { id: 'orders', label: 'Tracking' },
    { id: 'settings', label: 'Profile' },
  ],
  FARMER: [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'inventory', label: 'Inventory' },
    { id: 'orders', label: 'Orders' },
    { id: 'settings', label: 'Profile' },
  ],
  ADMIN: [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'users', label: 'Users' },
    { id: 'farmers', label: 'Farmers' },
  ],
}

export const categoryConfig = {
  vegetables: { label: 'Vegetables' },
  fruits: { label: 'Fruits' },
  grains: { label: 'Grains' },
  dairy: { label: 'Other' },
}

export const orderStatuses = ['PLACED', 'ACCEPTED', 'PACKED', 'SHIPPED', 'DELIVERED']
