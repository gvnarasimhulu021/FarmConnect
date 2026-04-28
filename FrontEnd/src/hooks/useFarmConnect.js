import { startTransition, useEffect, useState } from 'react'
import { farmConnectService } from '../services/farmConnectService.js'

const ORDER_FILTERS = { name: '', minPrice: '', maxPrice: '' }
const defaultProductForm = { id: null, name: '', description: '', price: '', quantity: '', imageUrl: '' }
const EMPTY_AUTH = { token: '', user: null }

function normalizeOrder(order) {
  if (!order || typeof order !== 'object') {
    return null
  }

  return {
    ...order,
    status: order.status ?? order.orderStatus ?? 'PLACED',
    items: Array.isArray(order.items) ? order.items : [],
  }
}

function normalizeOrders(payload) {
  const rawOrders = Array.isArray(payload) ? payload : payload?.content ?? []
  return rawOrders.map(normalizeOrder).filter(Boolean)
}

export function useFarmConnect() {
  const [auth, setAuth] = useState(() => {
    const saved = localStorage.getItem('farmconnect-auth')
    return saved ? JSON.parse(saved) : EMPTY_AUTH
  })
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [users, setUsers] = useState([])
  const [authUsers, setAuthUsers] = useState([])
  const [farmers, setFarmers] = useState([])
  const [publicStats, setPublicStats] = useState({ totalUsers: 0, totalFarmers: 0, totalConsumers: 0, totalAdmins: 0 })
  const [profile, setProfile] = useState(null)
  const [cart, setCart] = useState({})
  const [productForm, setProductForm] = useState(defaultProductForm)
  const [authMode, setAuthMode] = useState('login')
  const [loading, setLoading] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [filters, setFilters] = useState(ORDER_FILTERS)
  const [loginForm, setLoginForm] = useState({ email: '', password: '', role: 'USER' })
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', password: '', role: 'USER' })
  const [registerOtpStage, setRegisterOtpStage] = useState(false)
  const [registerOtp, setRegisterOtp] = useState('')
  const [pendingVerification, setPendingVerification] = useState(null)

  useEffect(() => {
    localStorage.setItem('farmconnect-auth', JSON.stringify(auth))
  }, [auth])

  useEffect(() => {
    void bootstrap()
  }, [])

  useEffect(() => {
    if (auth.user) {
      void loadPrivateData()
    }
  }, [auth.user?.id, auth.user?.role])

  async function bootstrap() {
    await Promise.all([loadProducts(), loadFarmers(), loadPublicStats()])
  }

  function buildProductQuery(activeFilters = filters) {
    const params = new URLSearchParams()
    if (activeFilters.name.trim()) params.set('name', activeFilters.name.trim())
    if (activeFilters.minPrice) params.set('minPrice', activeFilters.minPrice)
    if (activeFilters.maxPrice) params.set('maxPrice', activeFilters.maxPrice)
    return params.toString() ? `?${params.toString()}` : ''
  }

  async function loadProducts(extraQuery = '') {
    try {
      const data = await farmConnectService.getProducts(extraQuery || buildProductQuery(), auth.token)
      startTransition(() => setProducts(data ?? []))
    } catch (err) {
      setError(err.message)
    }
  }

  async function loadFarmers() {
    try {
      const data = await farmConnectService.getFarmers(auth.token)
      setFarmers(data ?? [])
    } catch (err) {
      setError(err.message)
    }
  }

  async function loadPublicStats() {
    try {
      const data = await farmConnectService.getAuthStats()
      setPublicStats(data ?? { totalUsers: 0, totalFarmers: 0, totalConsumers: 0, totalAdmins: 0 })
    } catch {
      setPublicStats({ totalUsers: 0, totalFarmers: 0, totalConsumers: 0, totalAdmins: 0 })
    }
  }

  async function loadPrivateData() {
    if (!auth.user) {
      return
    }

    const issues = []

    if (auth.user.role === 'USER') {
      try {
        setProfile(await farmConnectService.getCurrentUserProfile(auth.token))
      } catch (err) {
        issues.push(err.message)
      }
    }

    if (auth.user.role === 'FARMER') {
      try {
        setProfile(await farmConnectService.getCurrentFarmerProfile(auth.token, auth.user.id))
      } catch (err) {
        issues.push(err.message)
      }

      try {
        const farmerId = Number(auth.user.id)
        const ownProducts = Number.isFinite(farmerId)
          ? await farmConnectService.getProducts(`?farmerId=${farmerId}`, auth.token)
          : await farmConnectService.getProducts('', auth.token)
        setProducts(ownProducts ?? [])
      } catch (err) {
        issues.push(err.message)
      }
    } else if (auth.user.role === 'ADMIN') {
      setProfile(null)
    }

    try {
      const ordersPayload = await farmConnectService.getOrders(auth.token)
      setOrders(normalizeOrders(ordersPayload))
    } catch (err) {
      issues.push(err.message)
    }

    if (auth.user.role === 'ADMIN') {
      try {
        const [profileUsers, secureUsers] = await Promise.all([
          farmConnectService.getUsers(auth.token),
          farmConnectService.getAuthUsers(auth.token),
        ])
        setUsers(profileUsers ?? [])
        setAuthUsers(secureUsers ?? [])
      } catch (err) {
        issues.push(err.message)
      }
    } else {
      setUsers([])
      setAuthUsers([])
    }

    const firstIssue = issues[0] ?? ''
    setError(firstIssue)
    if (firstIssue && firstIssue.toLowerCase().includes('invalid or expired jwt token')) {
      signOut('Session expired. Please login again.')
    }
  }

  async function handleLogin(event) {
    event.preventDefault()
    setLoading(true)
    setError('')
    setNotice('')
    try {
      const payload = {
        email: loginForm.email,
        password: loginForm.password,
        role: loginForm.role,
      }
      const data = await farmConnectService.login(payload)
      setAuth(data)
      setNotice(`Signed in as ${data.user.role}`)
      await loadProducts(data.user.role === 'FARMER' ? `?farmerId=${data.user.id}` : '')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleRegister(event) {
    event.preventDefault()
    if (registerOtpStage) {
      await verifyRegisterOtpAndLogin()
      return
    }

    setLoading(true)
    setError('')
    setNotice('')
    try {
      const role = registerForm.role === 'FARMER' ? 'FARMER' : 'USER'
      await farmConnectService.register({ ...registerForm, role })
      setPendingVerification({
        email: registerForm.email.trim(),
        password: registerForm.password,
        role,
        name: registerForm.name,
      })
      setRegisterOtp('')
      setRegisterOtpStage(true)
      setNotice('OTP sent to registered mail.')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function verifyRegisterOtpAndLogin() {
    if (registerOtp.trim().length !== 6) {
      setError('Enter valid 6-digit OTP.')
      return
    }

    setLoading(true)
    setError('')
    setNotice('')
    try {
      const email = registerForm.email.trim()
      const otp = registerOtp.trim()
      await farmConnectService.verifyOtp({ email, otp })
      const fallbackRole = registerForm.role === 'FARMER' ? 'FARMER' : 'USER'
      const matchedPending = pendingVerification?.email === email ? pendingVerification : null
      const password = matchedPending?.password || loginForm.password
      const role = matchedPending?.role || fallbackRole

      if (!password) {
        setNotice('Email verified successfully. Please login.')
        setRegisterOtp('')
        setRegisterOtpStage(false)
        setAuthMode('login')
        return
      }

      const data = await farmConnectService.login({ email, password, role })
      setAuth(data)
      setPendingVerification(null)
      setRegisterOtp('')
      setRegisterOtpStage(false)
      setRegisterForm({ name: '', email: '', password: '', role: 'USER' })
      setNotice(`Email verified. Signed in as ${data.user.role}.`)
      await loadProducts(data.user.role === 'FARMER' ? `?farmerId=${data.user.id}` : '')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function resendRegistrationOtp() {
    const email = registerForm.email.trim()
    if (!email) {
      setError('Enter email to resend OTP.')
      return
    }

    setLoading(true)
    setError('')
    setNotice('')
    try {
      await farmConnectService.resendOtp({ email })
      setNotice('OTP sent to registered mail.')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function resetRegisterOtpFlow() {
    setRegisterOtpStage(false)
    setRegisterOtp('')
    setPendingVerification(null)
  }

  async function placeOrder() {
    const items = Object.entries(cart)
      .map(([productId, quantity]) => ({ productId: Number(productId), quantity: Number(quantity) }))
      .filter((item) => item.quantity > 0)

    if (!items.length) {
      setError('Add at least one product to the cart.')
      return
    }

    setLoading(true)
    setError('')
    setNotice('')
    try {
      await farmConnectService.placeOrder({ items }, auth.token)
      setCart({})
      setNotice('Order placed successfully.')
      await Promise.all([loadProducts(), loadPrivateData()])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function saveProfile(event) {
    event.preventDefault()
    if (!profile) return

    setLoading(true)
    setError('')
    setNotice('')
    try {
      const updated =
        auth.user.role === 'FARMER'
          ? await farmConnectService.updateFarmerProfile(auth.user.id, profile, auth.token)
          : await farmConnectService.updateUserProfile(auth.user.id, profile, auth.token)
      setProfile(updated)
      setNotice('Profile updated.')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function saveProduct(event) {
    if (event?.preventDefault) {
      event.preventDefault()
    }

    const name = productForm.name.trim()
    const description = productForm.description.trim()
    const imageUrl = productForm.imageUrl.trim()
    const price = Number(productForm.price)
    const quantity = Number(productForm.quantity)

    if (!name) {
      setError('Product name is required.')
      setNotice('')
      return
    }
    if (!Number.isFinite(price) || price <= 0) {
      setError('Price must be greater than 0.')
      setNotice('')
      return
    }
    if (!Number.isFinite(quantity) || quantity < 0) {
      setError('Stock must be 0 or more.')
      setNotice('')
      return
    }

    setLoading(true)
    setError('')
    setNotice('')
    try {
      const payload = {
        name,
        description,
        imageUrl,
        price,
        quantity,
      }

      if (productForm.id) {
        await farmConnectService.updateProduct(productForm.id, payload, auth.token)
      } else {
        await farmConnectService.createProduct(payload, auth.token)
      }

      setProductForm(defaultProductForm)
      setNotice(productForm.id ? 'Product updated.' : 'Product added.')
      await loadPrivateData()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function removeProduct(id) {
    setLoading(true)
    setError('')
    setNotice('')
    try {
      await farmConnectService.deleteProduct(id, auth.token)
      setNotice('Product removed.')
      await loadPrivateData()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function advanceOrder(orderId, status) {
    setLoading(true)
    setError('')
    setNotice('')
    try {
      const updatedOrder = await farmConnectService.updateOrderStatus(orderId, { status }, auth.token)
      setOrders((current) =>
        current.map((order) => (order.id === updatedOrder?.id ? normalizeOrder(updatedOrder) : order))
      )
      setNotice(`Order moved to ${status}.`)
      await loadPrivateData()
    } catch (err) {
      const message = err?.message ?? 'Unable to update order status.'
      if (message.includes('Invalid order status transition')) {
        await loadPrivateData()
        setError('Order status was already updated. Refreshed latest status, please select again.')
      } else {
        setError(message)
      }
    } finally {
      setLoading(false)
    }
  }

  async function completePayout(orderId) {
    setLoading(true)
    setError('')
    setNotice('')
    try {
      await farmConnectService.completeOrderPayout(orderId, auth.token)
      setNotice('Farmer payout completed.')
      await loadPrivateData()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function setUserBlocked(userId, blocked) {
    if (auth.user?.role !== 'ADMIN') {
      setError('Only admins can block or unblock users.')
      return
    }

    setLoading(true)
    setError('')
    setNotice('')
    try {
      const updated = await farmConnectService.updateUserBlocked(userId, { blocked }, auth.token)
      setAuthUsers((current) => current.map((user) => (user.id === userId ? updated : user)))
      setNotice(blocked ? 'User blocked.' : 'User unblocked.')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function removeAccount(userId, label = 'Account') {
    if (auth.user?.role !== 'ADMIN') {
      setError('Only admins can remove accounts.')
      return
    }

    const targetId = Number(userId)
    if (!Number.isFinite(targetId)) {
      setError('Invalid account id.')
      return
    }
    if (targetId === Number(auth.user.id)) {
      setError('You cannot remove your own account.')
      return
    }

    setLoading(true)
    setError('')
    setNotice('')
    try {
      await farmConnectService.deleteAuthUser(targetId, auth.token)
      setNotice(`${label} removed.`)
      await Promise.all([loadPrivateData(), loadFarmers(), loadPublicStats()])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function reloadPublicDataAfterSignOut() {
    try {
      const [publicProducts, publicFarmers, stats] = await Promise.all([
        farmConnectService.getProducts(buildProductQuery(), ''),
        farmConnectService.getFarmers(''),
        farmConnectService.getAuthStats(),
      ])
      startTransition(() => setProducts(publicProducts ?? []))
      setFarmers(publicFarmers ?? [])
      setPublicStats(stats ?? { totalUsers: 0, totalFarmers: 0, totalConsumers: 0, totalAdmins: 0 })
    } catch {
      // ignore public data refresh errors on logout
    }
  }

  function signOut(message = 'Signed out.') {
    localStorage.removeItem('farmconnect-auth')
    setAuth(EMPTY_AUTH)
    setProfile(null)
    setOrders([])
    setUsers([])
    setAuthUsers([])
    setCart({})
    setAuthMode('login')
    setRegisterOtpStage(false)
    setRegisterOtp('')
    setPendingVerification(null)
    setNotice(message)
    setError('')
    void reloadPublicDataAfterSignOut()
  }

  function resetProductForm() {
    setProductForm(defaultProductForm)
  }

  const cartItems = products
    .filter((product) => Number(cart[product.id]) > 0)
    .map((product) => ({ ...product, orderQuantity: Number(cart[product.id]) }))

  const cartTotal = cartItems.reduce((sum, item) => sum + Number(item.price) * item.orderQuantity, 0)

  return {
    auth,
    setAuth,
    products,
    orders,
    users,
    authUsers,
    farmers,
    publicStats,
    profile,
    setProfile,
    cart,
    setCart,
    cartItems,
    cartTotal,
    productForm,
    setProductForm,
    authMode,
    setAuthMode,
    loading,
    notice,
    error,
    filters,
    setFilters,
    loginForm,
    setLoginForm,
    registerForm,
    setRegisterForm,
    registerOtpStage,
    setRegisterOtpStage,
    registerOtp,
    setRegisterOtp,
    loadProducts,
    loadPublicStats,
    loadPrivateData,
    handleLogin,
    handleRegister,
    resendRegistrationOtp,
    resetRegisterOtpFlow,
    placeOrder,
    saveProfile,
    saveProduct,
    removeProduct,
    advanceOrder,
    completePayout,
    setUserBlocked,
    removeAccount,
    signOut,
    resetProductForm,
  }
}
