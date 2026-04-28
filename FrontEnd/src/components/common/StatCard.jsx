function StatCard({ label, value, change, icon, tone }) {
  const toneClasses = {
    green: 'from-green-500/15 to-emerald-500/5 text-green-700',
    blue: 'from-sky-400/15 to-cyan-400/5 text-sky-700',
    orange: 'from-orange-300/20 to-amber-300/5 text-orange-700',
  }

  return (
    <div className={`rounded-[24px] border border-slate-100 bg-gradient-to-br ${toneClasses[tone]} p-5`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">{label}</span>
        <div className="rounded-2xl bg-white/85 p-3 text-slate-700 shadow-sm">{icon}</div>
      </div>
      <p className="mt-5 font-display text-3xl font-bold tracking-[-0.04em] text-slate-900">{value}</p>
      <p className="mt-2 text-sm font-medium text-green-600">{change} this week</p>
    </div>
  )
}

export default StatCard
