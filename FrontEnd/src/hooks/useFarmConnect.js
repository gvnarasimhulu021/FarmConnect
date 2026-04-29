import { startTransition, useEffect, useState } from 'react'
import { farmConnectService } from '../services/farmConnectService.js'

const ORDER_FILTERS = { name: '', minPrice: '', maxPrice: '' }
const defaultProductForm = { id: null, name: '', description: '', price: '', quantity: '', imageUrl: '' }
const EMPTY_AUTH = { token: '', user: null }
const RAZORPAY_SCRIPT_ID = 'farmconnect-razorpay-checkout-sdk'
const RAZORPAY_SCRIPT_SRC = 'https://checkout.razorpay.com/v1/checkout.js'
const RAZORPAY_PUBLIC_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID ?? ''

function toPaise(amountInRupees) {
  const amount = Number(amountInRupees)
  if (!Number.isFinite(amount) || amount <= 0) {
    return null
  }
  const paise = Math.round(amount * 100)
  return paise > 0 ? paise : null
}

function resolveAmountPaise(order, fallbackAmountInRupees) {
  const fromBackend = Number(order?.razorpayAmountPaise)
  if (Number.isFinite(fromBackend) && fromBackend > 0) {
    return Math.round(fromBackend)
  }

  const fromOrderTotal = toPaise(order?.totalAmount)
  if (fromOrderTotal) {
    return fromOrderTotal
  }

  return toPaise(fallbackAmountInRupees)
}

function loadRazorpayCheckoutScript() {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Razorpay checkout is available only in browser.'))
  }

  if (window.Razorpay) {
    return Promise.resolve()
  }

  const existingScript = document.getElementById(RAZORPAY_SCRIPT_ID)
  if (existingScript) {
    return new Promise((resolve, reject) => {
      if (window.Razorpay) {
        resolve()
        return
      }
      existingScript.addEventListener('load', () => {
        if (window.Razorpay) {
          resolve()
        } else {
          reject(new Error('Razorpay checkout SDK did not initialize.'))
        }
      }, { once: true })
      existingScript.addEventListener('error', () => reject(new Error('Unable to load Razorpay checkout SDK.')), {
        once: true,
      })
    })
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.id = RAZORPAY_SCRIPT_ID
    script.src = RAZORPAY_SCRIPT_SRC
    script.async = true
    script.onload = () => {
      if (window.Razorpay) {
        resolve()
      } else {
        reject(new Error('Razorpay checkout SDK did not initialize.'))
      }
    }
    script.onerror = () => reject(new Error('Unable to load Razorpay checkout SDK.'))
    document.body.appendChild(script)
  })
}

function normalizeOrder(order) {
  if (!order || typeof order !== 'object') {
    return null
  }

  return {
    ...order,
    status: order.status ?? order.orderStatus ?? 'PLACED',
    paymentMethod: order.paymentMethod ?? order.paymentMode ?? 'COD',
    paymentStatus: order.paymentStatus ?? 'PENDING',
    farmerPaymentStatus: order.farmerPaymentStatus ?? (order.payoutCompleted ? 'PAID' : 'PENDING'),
    paymentLink: order.paymentLink ?? null,
    razorpayOrderId: order.razorpayOrderId ?? null,
    razorpayAmountPaise: Number.isFinite(Number(order.razorpayAmountPaise))
      ? Number(order.razorpayAmountPaise)
      : null,
    razorpayCurrency: order.razorpayCurrency ?? 'INR',
    razorpayKeyId: order.razorpayKeyId ?? order.razorpayPublicKey ?? null,
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
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false)
  const [forgotPasswordForm, setForgotPasswordForm] = useState({ email: '', otp: '', newPassword: '' })
  const [forgotPasswordOtpSent, setForgotPasswordOtpSent] = useState(false)
  const [forgotPasswordOtpVerified, setForgotPasswordOtpVerified] = useState(false)
  const [pendingVerification, setPendingVerification] = useState(null)
  const [checkoutPaymentMethod, setCheckoutPaymentMethod] = useState('COD')

  useEffect(() => {
    localStorage.setItem('farmconnect-auth', JSON.stringify(auth))
  }, [auth])

  useEffect(() => {
    const handleAuthRefresh = (event) => {
      const nextAuth = event?.detail
      if (!nextAuth || typeof nextAuth !== 'object') {
        return
      }
      if (!nextAuth.token || !nextAuth.user) {
        return
      }
      setAuth(nextAuth)
    }

    window.addEventListener('farmconnect-auth-refreshed', handleAuthRefresh)
    return () => window.removeEventListener('farmconnect-auth-refreshed', handleAuthRefresh)
  }, [])

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

  function openForgotPassword(seedEmail = '') {
    setForgotPasswordMode(true)
    setForgotPasswordForm({
      email: seedEmail?.trim() ? seedEmail.trim() : loginForm.email?.trim() ?? '',
      otp: '',
      newPassword: '',
    })
    setForgotPasswordOtpSent(false)
    setForgotPasswordOtpVerified(false)
    setError('')
    setNotice('')
  }

  function closeForgotPassword() {
    setForgotPasswordMode(false)
    setForgotPasswordForm({ email: '', otp: '', newPassword: '' })
    setForgotPasswordOtpSent(false)
    setForgotPasswordOtpVerified(false)
  }

  async function sendForgotPasswordOtp() {
    const email = forgotPasswordForm.email.trim()
    if (!email) {
      setError('Enter your registered email.')
      return
    }

    setLoading(true)
    setError('')
    setNotice('')
    try {
      await farmConnectService.requestPasswordResetOtp({ email })
      setForgotPasswordForm((current) => ({ ...current, email, otp: '', newPassword: '' }))
      setForgotPasswordOtpSent(true)
      setForgotPasswordOtpVerified(false)
      setNotice('Reset OTP sent to your email.')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function verifyForgotPasswordOtp() {
    const email = forgotPasswordForm.email.trim()
    const otp = forgotPasswordForm.otp.trim()
    if (!email) {
      setError('Enter your registered email.')
      return
    }
    if (otp.length !== 6) {
      setError('Enter valid 6-digit OTP.')
      return
    }

    setLoading(true)
    setError('')
    setNotice('')
    try {
      await farmConnectService.verifyPasswordResetOtp({ email, otp })
      setForgotPasswordOtpVerified(true)
      setNotice('OTP verified. Enter new password.')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function resetForgotPassword() {
    const email = forgotPasswordForm.email.trim()
    const otp = forgotPasswordForm.otp.trim()
    const newPassword = forgotPasswordForm.newPassword

    if (!email) {
      setError('Enter your registered email.')
      return
    }
    if (otp.length !== 6) {
      setError('Enter valid 6-digit OTP.')
      return
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)
    setError('')
    setNotice('')
    try {
      await farmConnectService.resetPassword({ email, otp, newPassword })
      setLoginForm((current) => ({ ...current, email }))
      closeForgotPassword()
      setAuthMode('login')
      setNotice('Password reset successful. Please login.')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function placeOrder(selectedPaymentMethod = checkoutPaymentMethod) {
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
    const isOnline = selectedPaymentMethod === 'ONLINE'
    try {
      const paymentMethod = isOnline ? 'ONLINE' : 'COD'
      const createdOrder = normalizeOrder(
        await farmConnectService.placeOrder({ items, paymentMethod }, auth.token)
      )
      if (paymentMethod === 'ONLINE') {
        if (!createdOrder?.id) {
          throw new Error('Order was created but payment details are missing.')
        }
        const paymentResponse = await openRazorpayCheckout(createdOrder, cartTotal)
        if (paymentResponse?.razorpay_payment_id) {
          await verifyOrderPaymentInternal(createdOrder.id, paymentResponse)
          setNotice('Payment successful. Order placed.')
          await Promise.all([loadProducts(), loadPrivateData()])
        } else {
          setNotice('Payment completed. Refreshing order status...')
          await loadPrivateData()
        }
      } else {
        setCart({})
        setNotice('Order placed successfully with COD.')
        await Promise.all([loadProducts(), loadPrivateData()])
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function reduceCartByOrderItems(orderItems = []) {
    if (!Array.isArray(orderItems) || !orderItems.length) {
      return
    }

    setCart((current) => {
      const next = { ...current }

      orderItems.forEach((item) => {
        const productId = Number(item?.productId)
        const orderedQuantity = Number(item?.quantity)
        if (!Number.isFinite(productId) || !Number.isFinite(orderedQuantity) || orderedQuantity <= 0) {
          return
        }

        const key = String(productId)
        const currentQuantity = Number(next[key] ?? 0)
        const remainingQuantity = currentQuantity - orderedQuantity
        if (remainingQuantity > 0) {
          next[key] = remainingQuantity
        } else {
          delete next[key]
        }
      })

      return next
    })
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

  async function confirmOrderPaymentInternal(orderId, payload = {}) {
    const updatedOrder = normalizeOrder(
      await farmConnectService.confirmOrderPayment(orderId, payload, auth.token)
    )
    setOrders((current) =>
      current.map((order) => (order.id === updatedOrder?.id ? normalizeOrder(updatedOrder) : order))
    )
    reduceCartByOrderItems(updatedOrder?.items ?? [])
    return updatedOrder
  }

  async function verifyOrderPaymentInternal(orderId, paymentResponse) {
    const updatedOrder = normalizeOrder(
      await farmConnectService.verifyRazorpayPayment(
        {
          orderId,
          razorpayPaymentId: paymentResponse?.razorpay_payment_id,
          razorpayOrderId: paymentResponse?.razorpay_order_id,
          razorpaySignature: paymentResponse?.razorpay_signature,
        },
        auth.token
      )
    )
    setOrders((current) =>
      current.map((order) => (order.id === updatedOrder?.id ? normalizeOrder(updatedOrder) : order))
    )
    reduceCartByOrderItems(updatedOrder?.items ?? [])
    return updatedOrder
  }

  async function prepareOnlineOrderForCheckout(order, fallbackAmountInRupees = null) {
    const normalizedOrder = normalizeOrder(order)
    if (!normalizedOrder?.id) {
      return normalizedOrder
    }

    const created = await farmConnectService.createRazorpayOrder(
      { orderId: normalizedOrder.id },
      auth.token
    )

    const createdAmount = Number(created?.amount)
    return {
      ...normalizedOrder,
      razorpayOrderId: created?.order_id ?? created?.orderId ?? normalizedOrder?.razorpayOrderId ?? null,
      razorpayAmountPaise: Number.isFinite(createdAmount) && createdAmount > 0
        ? Math.round(createdAmount)
        : resolveAmountPaise(normalizedOrder, fallbackAmountInRupees),
      razorpayCurrency: created?.currency ?? normalizedOrder?.razorpayCurrency ?? 'INR',
      razorpayKeyId: RAZORPAY_PUBLIC_KEY || normalizedOrder?.razorpayKeyId || normalizedOrder?.razorpayPublicKey || null,
    }
  }

  async function openRazorpayCheckout(order, fallbackAmountInRupees = null) {
    const paymentOrder = await prepareOnlineOrderForCheckout(order, fallbackAmountInRupees)
    const keyId = RAZORPAY_PUBLIC_KEY || paymentOrder?.razorpayKeyId
    const razorpayOrderId = paymentOrder?.razorpayOrderId
    const amountPaise = resolveAmountPaise(paymentOrder, fallbackAmountInRupees)

    if (!keyId || !razorpayOrderId || !amountPaise || amountPaise < 100) {
      throw new Error('Razorpay checkout configuration is missing.')
    }

    await loadRazorpayCheckoutScript()

    if (!window.Razorpay) {
      throw new Error('Razorpay checkout SDK is not available.')
    }

    if (!keyId) {
      throw new Error('Missing Razorpay key. Configure backend Razorpay key id.')
    }
    if (!razorpayOrderId) {
      throw new Error('Missing Razorpay order id from backend.')
    }
    if (!amountPaise || amountPaise < 100) {
      throw new Error('Online payment amount must be at least Rs. 1.00.')
    }

    return new Promise((resolve, reject) => {
      const razorpay = new window.Razorpay({
        key: keyId,
        order_id: razorpayOrderId,
        // Razorpay expects amount in paise.
        amount: amountPaise,
        currency: paymentOrder?.razorpayCurrency || 'INR',
        // Keep payment flow inside popup and avoid callback-based page redirects.
        redirect: false,
        name: 'FarmConnect',
        description: `Order #${paymentOrder?.id ?? ''}`,
        prefill: {
          email: auth.user?.email || '',
        },
        handler: (response) => resolve(response),
        modal: {
          backdropclose: false,
          escape: false,
          confirm_close: true,
          ondismiss: () => reject(new Error('Payment cancelled before completion.')),
        },
      })

      razorpay.on('payment.failed', (response) => {
        const failureMessage =
          response?.error?.description || response?.error?.reason || 'Payment failed. Please try again.'
        reject(new Error(failureMessage))
      })

      razorpay.open()
    })
  }

  async function payOrderOnline(order) {
    const normalizedOrder = normalizeOrder(order)
    if (!normalizedOrder?.id) {
      setError('Invalid order selected for payment.')
      return
    }

    setLoading(true)
    setError('')
    setNotice('')
    try {
      const paymentResponse = await openRazorpayCheckout(normalizedOrder, null)
      if (paymentResponse?.razorpay_payment_id) {
        await verifyOrderPaymentInternal(normalizedOrder.id, paymentResponse)
        setNotice('Payment successful. Order placed.')
        await Promise.all([loadProducts(), loadPrivateData()])
      } else {
        setNotice('Payment completed. Refreshing order status...')
        await loadPrivateData()
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function confirmOrderPayment(orderId, payload = {}) {
    setLoading(true)
    setError('')
    setNotice('')
    try {
      await confirmOrderPaymentInternal(orderId, payload)
      setNotice('Payment marked as SUCCESS.')
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
    closeForgotPassword()
    setCheckoutPaymentMethod('COD')
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
    forgotPasswordMode,
    setForgotPasswordMode,
    forgotPasswordForm,
    setForgotPasswordForm,
    forgotPasswordOtpSent,
    forgotPasswordOtpVerified,
    checkoutPaymentMethod,
    setCheckoutPaymentMethod,
    loadProducts,
    loadPublicStats,
    loadPrivateData,
    handleLogin,
    handleRegister,
    resendRegistrationOtp,
    resetRegisterOtpFlow,
    openForgotPassword,
    closeForgotPassword,
    sendForgotPasswordOtp,
    verifyForgotPasswordOtp,
    resetForgotPassword,
    placeOrder,
    saveProfile,
    saveProduct,
    removeProduct,
    advanceOrder,
    confirmOrderPayment,
    payOrderOnline,
    completePayout,
    setUserBlocked,
    removeAccount,
    signOut,
    resetProductForm,
  }
}
