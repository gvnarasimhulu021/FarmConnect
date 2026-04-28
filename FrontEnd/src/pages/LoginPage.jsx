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
    farmers = [],
    publicStats = {},
    handleLogin,
    handleRegister,
  } = farmConnect

  const [selectedRole, setSelectedRole] = useState('')

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

  const canRegister = selectedRole === 'USER' || selectedRole === 'FARMER'
  const showRegister = canRegister && authMode === 'register'
  const selectedRoleLabel = roleOptions.find((role) => role.value === selectedRole)?.label ?? ''

  return (
    <main className="min-h-screen bg-[#eef4ee]">
      <div className="mx-auto grid min-h-screen w-full max-w-[1440px] lg:grid-cols-[1.35fr_1fr]">
        <section
          className="relative overflow-hidden px-6 py-7 text-white lg:px-10"
          style={{
            backgroundImage:
              'radial-gradient(rgba(110, 231, 183, 0.22) 1px, transparent 1px), linear-gradient(125deg, #094936 0%, #073628 50%, #052319 100%)',
            backgroundSize: '36px 36px, auto',
            backgroundPosition: '0 0, center',
          }}
        >
          <div className="mx-auto flex h-full max-w-3xl flex-col">
            <header className="flex flex-wrap items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-400/35 text-lg font-extrabold">
                FC
              </div>
              <div>
                <p className="text-[31px] leading-none font-bold">FarmConnect</p>
                <p className="text-xs uppercase tracking-[0.12em] text-emerald-200">Marketplace</p>
              </div>
              <nav className="ml-auto hidden gap-7 text-sm text-emerald-100/85 md:flex">
                <span>Home</span>
                <span>Products</span>
                <span>Orders</span>
                <span>About</span>
              </nav>
            </header>

            <div className="mt-10 rounded-full border border-emerald-300/45 bg-emerald-300/10 px-4 py-1.5 text-sm text-emerald-100/90">
              Live Marketplace - {totalStock} items in stock
            </div>

            <div className="mt-6 grid gap-5 xl:grid-cols-[1fr_0.5fr] xl:items-start">
              <div>
                <h1 className="text-5xl leading-tight font-extrabold sm:text-6xl">
                  Farm Fresh,
                  <span className="block text-emerald-300">Direct to</span>
                  <span className="block">Your Table.</span>
                </h1>
                <p className="mt-5 max-w-xl text-lg text-emerald-100/85">
                  Buy directly from certified local farmers. No middlemen, no markup, just honest fresh produce.
                </p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <button className="rounded-xl bg-emerald-400 px-8 py-3 text-base font-bold text-emerald-950">
                    Shop Now
                  </button>
                  <button className="rounded-xl border border-emerald-300/70 px-8 py-3 text-base font-semibold text-emerald-50">
                    Start Selling
                  </button>
                </div>
              </div>

              <aside className="rounded-2xl border border-emerald-300/35 bg-emerald-300/8 p-4">
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

            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
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

            <div className="mt-7 grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
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

        <section className="bg-[#f6f8f4] px-6 pt-4 pb-8 lg:px-10 lg:pt-6 lg:pb-12">
          <div className="mx-auto w-full max-w-xl">
            <div>
              <p className="text-sm font-semibold text-emerald-700">Welcome back</p>
              <h2 className="mt-1 text-5xl leading-tight font-extrabold text-emerald-950">
                {showRegister ? 'Create your' : 'Sign in to'}
                <span className="block text-emerald-800">FarmConnect</span>
              </h2>
              <p className="mt-2 text-lg text-emerald-900/70">
                {showRegister ? 'Create your marketplace account' : 'Access your marketplace dashboard'}
              </p>
            </div>

            {error && (
              <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="mt-6">
              <p className="text-xs font-semibold tracking-wide text-emerald-800 uppercase">Select your role</p>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {roleOptions.map((role) => {
                  const isActive = selectedRole === role.value
                  return (
                    <button
                      key={role.value}
                      className={`rounded-2xl border px-2 py-3 text-center transition ${
                        isActive
                          ? 'border-emerald-900 bg-emerald-900 text-white'
                          : 'border-emerald-300 bg-white text-emerald-900 hover:bg-emerald-50'
                      }`}
                      type="button"
                      onClick={() => {
                        setSelectedRole(role.value)
                        if (role.value === 'ADMIN') {
                          setAuthMode('login')
                        }
                      }}
                    >
                      <p className="text-base font-semibold">{role.label}</p>
                      <p className={`text-xs ${isActive ? 'text-emerald-100/85' : 'text-emerald-700'}`}>{role.subtitle}</p>
                    </button>
                  )
                })}
              </div>
              {!selectedRole && <p className="mt-2 text-xs text-amber-700">Select role first to continue.</p>}
            </div>

            {canRegister && (
              <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-1">
                <button
                  className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                    authMode === 'login' ? 'bg-emerald-700 text-white' : 'text-emerald-900 hover:bg-emerald-100'
                  }`}
                  type="button"
                  onClick={() => setAuthMode('login')}
                >
                  Login
                </button>
                <button
                  className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
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
                    className="mt-1 h-11 w-full rounded-xl border border-emerald-300 bg-white px-3 text-base text-emerald-950 outline-none focus:border-emerald-600"
                    value={registerForm.name}
                    onChange={(event) => setRegisterForm((current) => ({ ...current, name: event.target.value }))}
                    placeholder="Your name"
                  />
                </label>
                <label className="block text-sm font-semibold text-emerald-900">
                  Email address
                  <input
                    className="mt-1 h-11 w-full rounded-xl border border-emerald-300 bg-white px-3 text-base text-emerald-950 outline-none focus:border-emerald-600"
                    type="email"
                    value={registerForm.email}
                    onChange={(event) => setRegisterForm((current) => ({ ...current, email: event.target.value }))}
                    placeholder="farmer@example.com"
                  />
                </label>
                <label className="block text-sm font-semibold text-emerald-900">
                  Password
                  <input
                    className="mt-1 h-11 w-full rounded-xl border border-emerald-300 bg-white px-3 text-base text-emerald-950 outline-none focus:border-emerald-600"
                    type="password"
                    value={registerForm.password}
                    onChange={(event) => setRegisterForm((current) => ({ ...current, password: event.target.value }))}
                    placeholder="Minimum 6 characters"
                  />
                </label>
                <button
                  className="mt-1 h-11 w-full rounded-xl bg-emerald-700 text-lg font-bold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
                  type="submit"
                  disabled={loading || !selectedRole}
                >
                  Create Account
                </button>
                <button
                  className="w-full text-center text-sm font-semibold text-emerald-700"
                  type="button"
                  onClick={() => setAuthMode('login')}
                >
                  Already have an account? Sign in
                </button>
              </form>
            ) : (
              <form className="mt-5 space-y-3" onSubmit={handleLogin}>
                <label className="block text-sm font-semibold text-emerald-900">
                  Email address
                  <input
                    className="mt-1 h-11 w-full rounded-xl border border-emerald-300 bg-white px-3 text-base text-emerald-950 outline-none focus:border-emerald-600"
                    type="email"
                    value={loginForm.email}
                    onChange={(event) => setLoginForm((current) => ({ ...current, email: event.target.value }))}
                    placeholder="farmer@example.com"
                  />
                </label>
                <label className="block text-sm font-semibold text-emerald-900">
                  Password
                  <input
                    className="mt-1 h-11 w-full rounded-xl border border-emerald-300 bg-white px-3 text-base text-emerald-950 outline-none focus:border-emerald-600"
                    type="password"
                    value={loginForm.password}
                    onChange={(event) => setLoginForm((current) => ({ ...current, password: event.target.value }))}
                    placeholder="Enter password"
                  />
                </label>
                <button
                  className="mt-1 h-11 w-full rounded-xl bg-emerald-700 text-lg font-bold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
                  type="submit"
                  disabled={loading || !selectedRole}
                >
                  Sign In
                </button>
                {canRegister && (
                  <button
                    className="w-full text-center text-sm font-semibold text-emerald-700"
                    type="button"
                    onClick={() => setAuthMode('register')}
                  >
                    Don&apos;t have an account? Create one free
                  </button>
                )}
              </form>
            )}

            <div className="mt-6 grid grid-cols-3 gap-2">
              <div className="rounded-2xl border border-emerald-200 bg-white px-2 py-3 text-center">
                <p className="text-4xl font-bold text-emerald-900">{farmerCount}</p>
              </div>
              <div className="rounded-2xl border border-emerald-200 bg-white px-2 py-3 text-center">
                <p className="text-4xl font-bold text-emerald-900">{totalUsers}</p>
              </div>
              <div className="rounded-2xl border border-emerald-200 bg-white px-2 py-3 text-center">
                <p className="text-4xl font-bold text-emerald-900">{totalStock}</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

export default LoginPage
