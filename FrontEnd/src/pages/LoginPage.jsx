import { useEffect, useMemo, useState } from 'react'

const roleOptions = [
  { value: 'USER', label: 'Consumer', subtitle: 'Browse & Order' },
  { value: 'FARMER', label: 'Farmer', subtitle: 'Sell Products' },
  { value: 'ADMIN', label: 'Admin', subtitle: 'Full Control' },
]

function LoginPage({ farmConnect, notice, error, loading, products = [] }) {
  const {
    authMode,
    setAuthMode,
    loginForm,
    setLoginForm,
    registerForm,
    setRegisterForm,
    registerOtpStage,
    registerOtp,
    setRegisterOtp,
    resendRegistrationOtp,
    resetRegisterOtpFlow,
    forgotPasswordMode,
    forgotPasswordForm,
    setForgotPasswordForm,
    forgotPasswordOtpSent,
    forgotPasswordOtpVerified,
    openForgotPassword,
    closeForgotPassword,
    sendForgotPasswordOtp,
    verifyForgotPasswordOtp,
    resetForgotPassword,
    farmers = [],
    publicStats = {},
    handleLogin,
    handleRegister,
  } = farmConnect

  const [selectedRole, setSelectedRole] = useState('')
  const [showAboutModal, setShowAboutModal] = useState(false)
  const [toast, setToast] = useState(null)

  const totalStock = useMemo(
    () => products.reduce((sum, product) => sum + Math.max(0, Number(product.quantity) || 0), 0),
    [products]
  )
  const farmerCount = Math.max(Number(publicStats.totalFarmers) || 0, farmers.length || 0)
  const totalUsers = Number(publicStats.totalUsers) || 0
  const topStockItems = useMemo(
    () =>
      [...products]
        .sort((first, second) => (Number(second.quantity) || 0) - (Number(first.quantity) || 0))
        .slice(0, 5),
    [products]
  )
  const previewStocks = topStockItems.slice(0, 3)

  useEffect(() => {
    if (!selectedRole) return

    setLoginForm((current) => (current.role === selectedRole ? current : { ...current, role: selectedRole }))

    if (selectedRole === 'USER' || selectedRole === 'FARMER') {
      setRegisterForm((current) => (current.role === selectedRole ? current : { ...current, role: selectedRole }))
    }

    if (selectedRole === 'ADMIN' && authMode !== 'login') {
      setAuthMode('login')
    }
  }, [selectedRole, authMode, setAuthMode, setLoginForm, setRegisterForm])

  useEffect(() => {
    if (!error) return
    setToast({ type: 'error', text: error })
  }, [error])

  useEffect(() => {
    if (!notice) return
    setToast({ type: 'success', text: notice })
  }, [notice])

  useEffect(() => {
    if (!toast) return
    const timerId = setTimeout(() => setToast(null), 2400)
    return () => clearTimeout(timerId)
  }, [toast])

  const canRegister = selectedRole === 'USER' || selectedRole === 'FARMER'
  const showRegister = canRegister && authMode === 'register'

  const openRoleLogin = (role) => {
    setSelectedRole(role)
    setAuthMode('login')
    resetRegisterOtpFlow()
    closeForgotPassword()
    setLoginForm((current) => ({ ...current, role }))
    if (role === 'USER' || role === 'FARMER') {
      setRegisterForm((current) => ({ ...current, role }))
    }
  }

  const showLoginPrompt = (section) => {
    setShowAboutModal(false)
    setToast({ type: 'warning', text: `Please login to access ${section}.` })
  }

  const openAboutModal = () => {
    setToast(null)
    setShowAboutModal(true)
  }

  return (
    <main className="min-h-screen bg-[#eef4ee]">
      <div className="mx-auto grid min-h-screen w-full max-w-[1440px] lg:grid-cols-[1.35fr_1fr]">
        <section
          className="relative overflow-hidden px-4 py-5 text-white sm:px-6 sm:py-7 lg:px-10"
          style={{
            backgroundImage:
              'radial-gradient(rgba(110, 231, 183, 0.22) 1px, transparent 1px), linear-gradient(125deg, #094936 0%, #073628 50%, #052319 100%)',
            backgroundSize: '36px 36px, auto',
            backgroundPosition: '0 0, center',
          }}
        >
          <div className="mx-auto flex h-full max-w-3xl flex-col">
            <header className="flex flex-wrap items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/35 text-base font-extrabold sm:h-11 sm:w-11 sm:text-lg">
                FC
              </div>
              <div>
                <p className="text-[24px] leading-none font-bold sm:text-[31px]">FarmConnect</p>
                <p className="text-xs uppercase tracking-[0.12em] text-emerald-200">Marketplace</p>
              </div>
              <div className="ml-auto hidden w-fit flex-col md:flex">
                <nav className="grid grid-cols-4 gap-7 text-sm text-emerald-100/85">
                  <button className="transition hover:text-emerald-50" type="button" onClick={() => showLoginPrompt('Home')}>
                    Home
                  </button>
                  <button className="transition hover:text-emerald-50" type="button" onClick={() => showLoginPrompt('Products')}>
                    Products
                  </button>
                  <button className="transition hover:text-emerald-50" type="button" onClick={() => showLoginPrompt('Orders')}>
                    Orders
                  </button>
                  <button className="transition hover:text-emerald-50" type="button" onClick={openAboutModal}>
                    About
                  </button>
                </nav>
                <div className="mt-1 grid grid-cols-4 gap-7">
                  <p className="col-start-2 col-span-3 text-sm text-emerald-200">
                    Founder : <span className="font-semibold text-emerald-50">G V Narasimhulu (JOY)</span>
                  </p>
                </div>
              </div>
            </header>

            <div className="mt-6 rounded-full border border-emerald-300/45 bg-emerald-300/10 px-3 py-1 text-xs text-emerald-100/90 sm:mt-10 sm:px-4 sm:py-1.5 sm:text-sm">
              Live Marketplace - {totalStock} items in stock
            </div>

            <div className="mt-5 grid gap-4 sm:mt-6 sm:gap-5 lg:grid-cols-[1fr_0.5fr] lg:items-start">
              <div>
                <h1 className="text-3xl leading-tight font-extrabold sm:text-6xl">
                  Farm Fresh,
                  <span className="block text-emerald-300">Direct to</span>
                  <span className="block">Your Table.</span>
                </h1>
                <p className="mt-4 max-w-xl text-base text-emerald-100/85 sm:mt-5 sm:text-lg">
                  Buy directly from certified local farmers. No middlemen, no markup, just honest fresh produce.
                </p>
                <div className="mt-5 flex flex-wrap gap-2 sm:mt-7 sm:gap-3">
                  <button
                    className="rounded-xl bg-emerald-400 px-5 py-2.5 text-sm font-bold text-emerald-950 sm:px-8 sm:py-3 sm:text-base"
                    type="button"
                    onClick={() => openRoleLogin('USER')}
                  >
                    Shop Now
                  </button>
                  <button
                    className="rounded-xl border border-emerald-300/70 px-5 py-2.5 text-sm font-semibold text-emerald-50 sm:px-8 sm:py-3 sm:text-base"
                    type="button"
                    onClick={() => openRoleLogin('FARMER')}
                  >
                    Sell Now
                  </button>
                </div>
              </div>

              <aside className="hidden rounded-2xl border border-emerald-300/35 bg-emerald-300/8 p-4 lg:block">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-400/55 text-sm font-bold">
                    RK
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-emerald-50">Farm Network</p>
                    <p className="text-xs text-emerald-100/70">Verified sellers</p>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  {previewStocks.length ? (
                    previewStocks.map((item) => (
                      <div key={item.id ?? item.name} className="flex items-center justify-between text-sm">
                        <p className="truncate text-emerald-100">{item.name}</p>
                        <span className="rounded-full bg-emerald-400/35 px-2 py-0.5 text-xs text-emerald-50">
                          {Number(item.quantity) || 0} stock
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-emerald-100/80">No products yet.</p>
                  )}
                </div>
              </aside>
            </div>

            <div className="mt-8 hidden grid-cols-2 gap-4 sm:grid-cols-4 lg:grid">
              <div>
                <p className="text-5xl font-bold">{farmerCount}+</p>
                <p className="text-sm text-emerald-100/75">Farmers</p>
              </div>
              <div>
                <p className="text-5xl font-bold">{totalUsers}+</p>
                <p className="text-sm text-emerald-100/75">Users</p>
              </div>
              <div>
                <p className="text-5xl font-bold">{totalStock}</p>
                <p className="text-sm text-emerald-100/75">In Stock</p>
              </div>
              <div>
                <p className="text-5xl font-bold">{products.length}+</p>
                <p className="text-sm text-emerald-100/75">Products</p>
              </div>
            </div>

            <div className="mt-7 hidden gap-2 sm:grid-cols-2 xl:grid-cols-5 lg:grid">
              {topStockItems.length ? (
                topStockItems.map((item) => (
                  <div
                    key={item.id ?? item.name}
                    className="rounded-xl border border-emerald-300/40 bg-emerald-300/8 px-3 py-2"
                  >
                    <p className="truncate text-sm font-semibold text-emerald-50">{item.name}</p>
                    <p className="text-xs text-emerald-100/80">{Number(item.quantity) || 0} in stock</p>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-emerald-300/40 bg-emerald-300/8 px-3 py-2 text-sm text-emerald-100/80 sm:col-span-2 xl:col-span-5">
                  Inventory data will appear here after products are added.
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="bg-[#f6f8f4] px-4 pt-4 pb-7 sm:px-6 sm:pb-8 lg:px-10 lg:pt-6 lg:pb-12">
          <div className="mx-auto w-full max-w-xl">
            <div>
              <p className="text-sm font-semibold text-emerald-700">Trusted access for farmers and consumers</p>
              <h2 className="mt-1 text-3xl leading-tight font-extrabold text-emerald-950 sm:text-5xl">
                {showRegister ? 'Create your' : 'Sign in to'}
                <span className="block text-emerald-800">FarmConnect</span>
              </h2>
              <p className="mt-2 text-sm text-emerald-900/70 sm:text-lg">
                {showRegister ? 'Create your marketplace account' : 'Access your marketplace dashboard'}
              </p>
            </div>

            <div className="mt-6">
              <p className="text-xs font-semibold tracking-wide text-emerald-800 uppercase">Select your role</p>
              <div className="mt-2 grid grid-cols-3 gap-1.5 sm:gap-2">
                {roleOptions.map((role) => {
                  const isActive = selectedRole === role.value
                  return (
                    <button
                      key={role.value}
                      className={`rounded-xl border px-2 py-2.5 text-center transition sm:rounded-2xl sm:py-3 ${
                        isActive
                          ? 'border-emerald-900 bg-emerald-900 text-white'
                          : 'border-emerald-300 bg-white text-emerald-900 hover:bg-emerald-50'
                      }`}
                      type="button"
                      onClick={() => {
                        setSelectedRole(role.value)
                        resetRegisterOtpFlow()
                        closeForgotPassword()
                        if (role.value === 'ADMIN') {
                          setAuthMode('login')
                        }
                      }}
                    >
                      <p className="text-sm font-semibold sm:text-base">{role.label}</p>
                      <p className={`text-xs ${isActive ? 'text-emerald-100/85' : 'text-emerald-700'}`}>{role.subtitle}</p>
                    </button>
                  )
                })}
              </div>
              {!selectedRole && <p className="mt-2 text-xs text-amber-700">Select role first to continue.</p>}
            </div>

            {canRegister && (
              <div className="mt-4 grid grid-cols-2 gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 p-1">
                <button
                  className={`rounded-lg px-2 py-2 text-xs font-semibold transition sm:px-3 sm:text-sm ${
                    authMode === 'login' ? 'bg-emerald-700 text-white' : 'text-emerald-900 hover:bg-emerald-100'
                  }`}
                  type="button"
                  onClick={() => {
                    setAuthMode('login')
                    resetRegisterOtpFlow()
                  }}
                >
                  Login
                </button>
                <button
                  className={`rounded-lg px-2 py-2 text-xs font-semibold transition sm:px-3 sm:text-sm ${
                    authMode === 'register' ? 'bg-emerald-700 text-white' : 'text-emerald-900 hover:bg-emerald-100'
                  }`}
                  type="button"
                  onClick={() => setAuthMode('register')}
                >
                  Register
                </button>
              </div>
            )}

            {!canRegister && selectedRole === 'ADMIN' && (
              <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-800">
                Admin has login only. Registration is disabled.
              </p>
            )}

            {showRegister ? (
              <form className="mt-5 space-y-3" onSubmit={handleRegister}>
                <label className="block text-sm font-semibold text-emerald-900">
                  Full name
                  <input
                    className="mt-1 h-10 w-full rounded-xl border border-emerald-300 bg-white px-3 text-sm text-emerald-950 outline-none focus:border-emerald-600 sm:h-11 sm:text-base"
                    value={registerForm.name}
                    disabled={registerOtpStage}
                    onChange={(event) => setRegisterForm((current) => ({ ...current, name: event.target.value }))}
                    placeholder="Your name"
                  />
                </label>
                <label className="block text-sm font-semibold text-emerald-900">
                  Email address
                  <input
                    className="mt-1 h-10 w-full rounded-xl border border-emerald-300 bg-white px-3 text-sm text-emerald-950 outline-none focus:border-emerald-600 sm:h-11 sm:text-base"
                    type="email"
                    value={registerForm.email}
                    disabled={registerOtpStage}
                    onChange={(event) => setRegisterForm((current) => ({ ...current, email: event.target.value }))}
                    placeholder="farmer@example.com"
                  />
                </label>
                {!registerOtpStage ? (
                  <label className="block text-sm font-semibold text-emerald-900">
                    Password
                    <input
                      className="mt-1 h-10 w-full rounded-xl border border-emerald-300 bg-white px-3 text-sm text-emerald-950 outline-none focus:border-emerald-600 sm:h-11 sm:text-base"
                      type="password"
                      value={registerForm.password}
                      onChange={(event) => setRegisterForm((current) => ({ ...current, password: event.target.value }))}
                      placeholder="Minimum 6 characters"
                    />
                  </label>
                ) : (
                  <label className="block text-sm font-semibold text-emerald-900">
                    Enter OTP
                    <input
                      className="mt-1 h-10 w-full rounded-xl border border-emerald-300 bg-white px-3 text-sm text-emerald-950 outline-none focus:border-emerald-600 sm:h-11 sm:text-base"
                      type="text"
                      value={registerOtp}
                      onChange={(event) => setRegisterOtp(event.target.value)}
                      placeholder="6-digit OTP"
                      maxLength={6}
                    />
                  </label>
                )}
                <button
                  className="mt-1 h-10 w-full rounded-xl bg-emerald-700 text-base font-bold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60 sm:h-11 sm:text-lg"
                  type="submit"
                  disabled={loading || !selectedRole || (registerOtpStage ? registerOtp.length !== 6 : false)}
                >
                  {registerOtpStage ? 'Verify OTP' : 'Send OTP'}
                </button>
                {registerOtpStage && (
                  <button
                    className="w-full text-center text-sm font-semibold text-emerald-700"
                    type="button"
                    onClick={resendRegistrationOtp}
                    disabled={loading}
                  >
                    Resend OTP
                  </button>
                )}
                <button
                  className="w-full text-center text-sm font-semibold text-emerald-700"
                  type="button"
                  onClick={() => {
                    setAuthMode('login')
                    resetRegisterOtpFlow()
                  }}
                >
                  Already have an account? Sign in
                </button>
              </form>
            ) : forgotPasswordMode ? (
              <form
                className="mt-5 space-y-3"
                onSubmit={(event) => {
                  event.preventDefault()
                  if (!forgotPasswordOtpSent) {
                    void sendForgotPasswordOtp()
                    return
                  }
                  if (!forgotPasswordOtpVerified) {
                    void verifyForgotPasswordOtp()
                    return
                  }
                  void resetForgotPassword()
                }}
              >
                <label className="block text-sm font-semibold text-emerald-900">
                  Registered email
                  <input
                    className="mt-1 h-10 w-full rounded-xl border border-emerald-300 bg-white px-3 text-sm text-emerald-950 outline-none focus:border-emerald-600 sm:h-11 sm:text-base"
                    type="email"
                    value={forgotPasswordForm.email}
                    onChange={(event) =>
                      setForgotPasswordForm((current) => ({ ...current, email: event.target.value }))
                    }
                    disabled={forgotPasswordOtpSent}
                    placeholder="your@email.com"
                  />
                </label>

                {forgotPasswordOtpSent && (
                  <label className="block text-sm font-semibold text-emerald-900">
                    Enter OTP
                    <input
                      className="mt-1 h-10 w-full rounded-xl border border-emerald-300 bg-white px-3 text-sm text-emerald-950 outline-none focus:border-emerald-600 sm:h-11 sm:text-base"
                      type="text"
                      value={forgotPasswordForm.otp}
                      onChange={(event) =>
                        setForgotPasswordForm((current) => ({ ...current, otp: event.target.value }))
                      }
                      maxLength={6}
                      placeholder="6-digit OTP"
                      disabled={forgotPasswordOtpVerified}
                    />
                  </label>
                )}

                {forgotPasswordOtpVerified && (
                  <label className="block text-sm font-semibold text-emerald-900">
                    New password
                    <input
                      className="mt-1 h-10 w-full rounded-xl border border-emerald-300 bg-white px-3 text-sm text-emerald-950 outline-none focus:border-emerald-600 sm:h-11 sm:text-base"
                      type="password"
                      value={forgotPasswordForm.newPassword}
                      onChange={(event) =>
                        setForgotPasswordForm((current) => ({ ...current, newPassword: event.target.value }))
                      }
                      placeholder="Minimum 6 characters"
                    />
                  </label>
                )}

                <button
                  className="mt-1 h-10 w-full rounded-xl bg-emerald-700 text-base font-bold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60 sm:h-11 sm:text-lg"
                  type="submit"
                  disabled={
                    loading
                    || (!forgotPasswordOtpSent && !forgotPasswordForm.email.trim())
                    || (forgotPasswordOtpSent && !forgotPasswordOtpVerified && forgotPasswordForm.otp.trim().length !== 6)
                    || (forgotPasswordOtpVerified && forgotPasswordForm.newPassword.length < 6)
                  }
                >
                  {!forgotPasswordOtpSent
                    ? 'Send OTP'
                    : !forgotPasswordOtpVerified
                      ? 'Verify OTP'
                      : 'Reset Password'}
                </button>

                <div className="flex items-center justify-between gap-3">
                  {forgotPasswordOtpSent && !forgotPasswordOtpVerified ? (
                    <button
                      className="text-sm font-semibold text-emerald-700"
                      type="button"
                      onClick={sendForgotPasswordOtp}
                      disabled={loading}
                    >
                      Resend OTP
                    </button>
                  ) : (
                    <span />
                  )}
                  <button
                    className="text-sm font-semibold text-emerald-700"
                    type="button"
                    onClick={closeForgotPassword}
                  >
                    Back to login
                  </button>
                </div>
              </form>
            ) : (
              <form className="mt-5 space-y-3" onSubmit={handleLogin}>
                <label className="block text-sm font-semibold text-emerald-900">
                  Email address
                  <input
                    className="mt-1 h-10 w-full rounded-xl border border-emerald-300 bg-white px-3 text-sm text-emerald-950 outline-none focus:border-emerald-600 sm:h-11 sm:text-base"
                    type="email"
                    value={loginForm.email}
                    onChange={(event) => setLoginForm((current) => ({ ...current, email: event.target.value }))}
                    placeholder="farmer@example.com"
                  />
                </label>
                <label className="block text-sm font-semibold text-emerald-900">
                  Password
                  <input
                    className="mt-1 h-10 w-full rounded-xl border border-emerald-300 bg-white px-3 text-sm text-emerald-950 outline-none focus:border-emerald-600 sm:h-11 sm:text-base"
                    type="password"
                    value={loginForm.password}
                    onChange={(event) => setLoginForm((current) => ({ ...current, password: event.target.value }))}
                    placeholder="Enter password"
                  />
                </label>
                <button
                  className="mt-1 h-10 w-full rounded-xl bg-emerald-700 text-base font-bold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60 sm:h-11 sm:text-lg"
                  type="submit"
                  disabled={loading || !selectedRole}
                >
                  Sign In
                </button>
                <button
                  className="w-full text-center text-sm font-semibold text-emerald-700"
                  type="button"
                  onClick={() => openForgotPassword(loginForm.email)}
                >
                  Forgot password?
                </button>
                {canRegister && (
                  <button
                    className="w-full text-center text-sm font-semibold text-emerald-700"
                    type="button"
                    onClick={() => {
                      setAuthMode('register')
                      resetRegisterOtpFlow()
                      closeForgotPassword()
                    }}
                  >
                    Don&apos;t have an account? Create one free
                  </button>
                )}
              </form>
            )}

            <div className="mt-6 grid grid-cols-3 gap-2">
              <div className="rounded-2xl border border-emerald-200 bg-white px-2 py-3 text-center">
                <p className="text-2xl font-bold text-emerald-900 sm:text-4xl">{farmerCount}</p>
              </div>
              <div className="rounded-2xl border border-emerald-200 bg-white px-2 py-3 text-center">
                <p className="text-2xl font-bold text-emerald-900 sm:text-4xl">{totalUsers}</p>
              </div>
              <div className="rounded-2xl border border-emerald-200 bg-white px-2 py-3 text-center">
                <p className="text-2xl font-bold text-emerald-900 sm:text-4xl">{totalStock}</p>
              </div>
            </div>

          </div>
        </section>
      </div>

      {toast && (
        <div className="fixed top-3 right-3 z-50 sm:top-4 sm:right-4">
          <div
            className={`rounded-xl border px-3 py-2 text-xs font-semibold shadow-lg sm:px-4 sm:text-sm ${
              toast.type === 'error'
                ? 'border-red-200 bg-red-50 text-red-700'
                : toast.type === 'success'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-amber-300 bg-amber-50 text-amber-800'
            }`}
          >
            {toast.text}
          </div>
        </div>
      )}

      {showAboutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-emerald-950/60 p-4">
          <div className="w-full max-w-2xl rounded-3xl border border-emerald-200 bg-white p-4 shadow-2xl sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-2xl font-bold text-emerald-950 sm:text-3xl">About FarmConnect</p>
                <p className="mt-1 text-sm uppercase tracking-[0.1em] text-emerald-700">
                  Farm Fresh - Fair Price - Direct Trust
                </p>
              </div>
              <button className="app-button app-button-secondary h-10 px-4" type="button" onClick={() => setShowAboutModal(false)}>
                Close
              </button>
            </div>

            <div className="mt-5 space-y-3 text-emerald-900">
              <p>
                FarmConnect is built to connect farmers and consumers directly. Our platform supports transparent
                pricing, reliable ordering, and real-time tracking to make farm-to-home commerce simple and fair.
              </p>
              <p>
                Our motto is to keep every transaction fresh, honest, and farmer-first while giving customers better
                quality and better value.
              </p>
              <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-800">
                Message: Together, we can strengthen local farming communities and deliver healthy produce to every
                home with trust and dignity.
              </p>
            </div>

            <div className="mt-6 border-t border-emerald-200 pt-4">
              <p className="text-lg font-bold text-emerald-950 sm:text-xl">Founder : G V Narasimhulu (JOY)</p>
            </div>
          </div>
        </div>
      )}

    </main>
  )
}

export default LoginPage
