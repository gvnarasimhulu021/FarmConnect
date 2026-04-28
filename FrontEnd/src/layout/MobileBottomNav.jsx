function MobileBottomNav({ navItems, activeView, setActiveView }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-emerald-200 bg-white/95 px-2 pb-[max(8px,env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_18px_rgba(15,23,42,0.08)] lg:hidden">
      <div className="mx-auto grid max-w-2xl grid-cols-4 gap-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`app-nav-mobile ${activeView === item.id ? 'app-nav-mobile-active' : ''}`}
            type="button"
            onClick={() => setActiveView(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default MobileBottomNav
