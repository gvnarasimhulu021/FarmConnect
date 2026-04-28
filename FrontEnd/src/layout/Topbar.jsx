function Topbar({
  auth,
  title,
  subtitle,
  search,
  setSearch,
  showSearch,
  notice,
  error,
  showCartShortcut = false,
  cartItemCount = 0,
  onOpenCart,
  showProfileShortcut = false,
  onOpenProfile,
  onSignOut,
}) {
  const isAdmin = auth.user.role === 'ADMIN'
  const isFarmer = auth.user.role === 'FARMER'
  const isUser = auth.user.role === 'USER'
  const hasMessage = Boolean(error || notice)

  return (
    <header
      className={`sticky top-3 z-30 flex flex-col gap-3 rounded-2xl border p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between ${
        isAdmin ? 'border-emerald-200 bg-white/95' : isFarmer ? 'border-emerald-200 bg-[#f5fbf7]' : 'border-emerald-200 bg-white'
      }`}
    >
      <div className="min-w-0">
        <p
          className={`truncate font-bold leading-tight text-emerald-900 ${
            isAdmin ? 'text-4xl sm:text-5xl' : isFarmer ? 'text-4xl sm:text-6xl' : 'text-4xl sm:text-5xl'
          }`}
        >
          {title}
        </p>
        <p className={`truncate ${isFarmer ? 'text-xl text-emerald-700' : isUser ? 'text-lg text-emerald-700' : 'text-sm text-emerald-700'}`}>{subtitle}</p>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
        {showSearch && (
          <input
            className="app-input h-12 min-w-[200px] sm:w-[310px]"
            placeholder="Search products"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        )}
        {showCartShortcut && (
          <button className="app-button app-button-primary h-12 min-w-[220px] px-5 text-lg" type="button" onClick={onOpenCart}>
            Cart / Checkout ({cartItemCount})
          </button>
        )}
        {showProfileShortcut && !isUser && (
          <button className="app-button app-button-secondary h-12 px-5 text-lg" type="button" onClick={onOpenProfile}>
            Profile
          </button>
        )}
        {isFarmer && (
          <span className="inline-flex h-10 items-center rounded-full border border-emerald-300 bg-emerald-50 px-6 text-base font-semibold text-emerald-700">
            FARMER
          </span>
        )}
        {isUser && !hasMessage && (
          <div className="inline-flex h-12 items-center rounded-xl bg-emerald-50 px-4 text-base text-emerald-700">
            Signed in as USER
          </div>
        )}
        {hasMessage && (
          <div
            className={`rounded-lg px-3 py-2 text-xs ${
              error
                ? 'bg-red-50 text-red-700'
                : notice
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-emerald-50 text-emerald-700/80'
            }`}
          >
            {error || notice}
          </div>
        )}
        <button
          className={`${
            isAdmin || isFarmer ? 'hidden sm:inline-flex app-button app-button-primary px-6' : 'app-button app-button-secondary h-12 px-5 text-lg'
          }`}
          type="button"
          onClick={onSignOut}
        >
          Logout
        </button>
      </div>
    </header>
  )
}

export default Topbar
