function SalesChart() {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900">Sales trend</p>
          <p className="text-xs text-slate-500">Last 7 days</p>
        </div>
        <div className="flex gap-2 text-xs">
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-slate-500"><span className="h-2.5 w-2.5 rounded-full bg-green-500" /> Sales</span>
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-slate-500"><span className="h-2.5 w-2.5 rounded-full bg-sky-400" /> Orders</span>
        </div>
      </div>
      <svg viewBox="0 0 420 220" className="h-56 w-full">
        <defs>
          <linearGradient id="salesFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="rgba(34,197,94,0.28)" />
            <stop offset="100%" stopColor="rgba(34,197,94,0.02)" />
          </linearGradient>
        </defs>
        {[40, 85, 130, 175].map((y) => (
          <line key={y} x1="10" y1={y} x2="410" y2={y} stroke="#e5e7eb" strokeDasharray="4 8" />
        ))}
        <path d="M20 170 C70 150, 90 120, 130 132 S205 82, 240 95 S320 45, 400 58 L400 200 L20 200 Z" fill="url(#salesFill)" />
        <path d="M20 170 C70 150, 90 120, 130 132 S205 82, 240 95 S320 45, 400 58" fill="none" stroke="#22c55e" strokeWidth="4" strokeLinecap="round" />
        <path d="M20 180 C70 165, 100 155, 140 145 S220 130, 260 120 S330 95, 400 104" fill="none" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" strokeDasharray="8 10" />
      </svg>
    </div>
  )
}

export default SalesChart
