function NavIcon({ id }) {
  const common = 'h-5 w-5'
  if (id === 'dashboard') {
    return (
      <svg className={common} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" />
      </svg>
    )
  }
  if (id === 'inventory') {
    return (
      <svg className={common} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M6 7v12h12V7M9 7V4h6v3" />
      </svg>
    )
  }
  if (id === 'orders') {
    return (
      <svg className={common} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h2l2 12h11l2-8H7M9 20a1 1 0 100 2 1 1 0 000-2zm8 0a1 1 0 100 2 1 1 0 000-2z" />
      </svg>
    )
  }
  return (
    <svg className={common} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 12a4 4 0 100-8 4 4 0 000 8zM4 20a8 8 0 0116 0" />
    </svg>
  )
}

function UserNavIcon({ id }) {
  if (id === 'home') return <span aria-hidden="true">🏠</span>
  if (id === 'cart') return <span aria-hidden="true">🛒</span>
  if (id === 'orders') return <span aria-hidden="true">📦</span>
  return <span aria-hidden="true">👤</span>
}

function Sidebar({ navItems, activeView, setActiveView, auth, onSignOut }) {
  const isAdmin = auth.user.role === 'ADMIN'
  const isFarmer = auth.user.role === 'FARMER'

  if (isAdmin) {
    return (
      <aside className="hidden w-64 shrink-0 lg:block">
        <div
          className="sticky top-3 flex h-[calc(100vh-24px)] flex-col overflow-hidden rounded-xl border border-emerald-800/70 bg-[#052c20] p-4 shadow-lg"
          style={{
            backgroundImage:
              'radial-gradient(rgba(94, 234, 212, 0.2) 1px, transparent 1px), linear-gradient(120deg, #073628 0%, #052c20 55%, #041e16 100%)',
            backgroundSize: '30px 30px, auto',
          }}
        >
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-400/45 text-xs font-bold text-white">
              FC
            </div>
            <div>
              <p className="text-xl font-semibold text-emerald-50">FarmConnect</p>
              <p className="text-xs uppercase tracking-wide text-emerald-200">Admin portal</p>
            </div>
          </div>

          <nav className="mt-6 space-y-1.5">
            {navItems.map((item) => (
              <button
                key={item.id}
                className={`block w-full rounded-md px-3 py-2 text-left text-sm transition ${
                  activeView === item.id
                    ? 'bg-emerald-400/25 font-semibold text-white'
                    : 'text-emerald-100/80 hover:bg-emerald-300/10'
                }`}
                type="button"
                onClick={() => setActiveView(item.id)}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="mt-auto rounded-xl border border-emerald-700/80 bg-emerald-900/30 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-200">Signed in</p>
            <p className="mt-1 truncate text-base font-semibold text-emerald-50">{auth.user.name}</p>
            <p className="truncate text-xs text-emerald-200">{auth.user.email}</p>
            <button
              className="mt-3 inline-flex h-9 w-full items-center justify-center rounded-lg border border-emerald-500/80 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-500/20"
              type="button"
              onClick={() => onSignOut?.()}
            >
              Logout
            </button>
          </div>
        </div>
      </aside>
    )
  }

  if (isFarmer) {
    return (
      <aside className="hidden w-80 shrink-0 lg:block">
        <div className="sticky top-3 flex h-[calc(100vh-24px)] flex-col overflow-hidden rounded-3xl border border-emerald-200 bg-white/90">
          <div className="border-b border-emerald-200 px-6 py-7">
            <p className="text-4xl font-semibold leading-tight text-emerald-800">FarmConnect</p>
            <p className="mt-1 text-sm uppercase tracking-[0.12em] text-emerald-600">Farmer Portal</p>
          </div>

          <nav className="space-y-2 px-4 py-6">
            {navItems.map((item) => (
              <button
                key={item.id}
                className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-xl font-medium transition ${
                  activeView === item.id
                    ? 'bg-emerald-700 text-white'
                    : 'text-emerald-800 hover:bg-emerald-50'
                }`}
                type="button"
                onClick={() => setActiveView(item.id)}
              >
                <NavIcon id={item.id} />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="mt-auto m-4 rounded-3xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-emerald-600">Signed in</p>
            <p className="mt-1 truncate text-2xl font-semibold text-emerald-900">{auth.user.name}</p>
            <p className="truncate text-base text-emerald-700">{auth.user.email}</p>
            <button className="app-button app-button-secondary mt-4 h-11 w-full text-base" type="button" onClick={() => onSignOut?.()}>
              Logout
            </button>
          </div>
        </div>
      </aside>
    )
  }

  return (
    <aside className="hidden w-80 shrink-0 lg:block">
      <div className="sticky top-3 flex h-[calc(100vh-24px)] flex-col overflow-hidden rounded-[18px] border border-emerald-200 bg-white">
        <div className="border-b border-emerald-200 px-6 py-7">
          <p className="text-5xl font-semibold leading-tight text-emerald-900">FarmConnect</p>
          <p className="mt-1 text-sm uppercase tracking-[0.14em] text-emerald-700">{auth.user.role} portal</p>
        </div>

        <nav className="space-y-2 px-4 py-6">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-2xl font-medium transition ${
                activeView === item.id
                  ? 'bg-emerald-600 text-white'
                  : 'text-emerald-800 hover:bg-emerald-50'
              }`}
              type="button"
              onClick={() => setActiveView(item.id)}
            >
              <span className="text-2xl leading-none">
                <UserNavIcon id={item.id} />
              </span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto m-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <p className="text-lg uppercase tracking-[0.12em] text-emerald-700">Signed in</p>
          <p className="mt-2 truncate text-4xl font-semibold text-emerald-900">{auth.user.name}</p>
          <p className="truncate text-2xl text-emerald-700">{auth.user.email}</p>
          <button className="app-button app-button-secondary mt-5 h-12 w-full text-xl" type="button" onClick={() => onSignOut?.()}>
            Logout
          </button>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
