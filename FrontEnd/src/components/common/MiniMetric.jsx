function MiniMetric({ title, value }) {
  return (
    <div className="rounded-[22px] bg-slate-50 p-4">
      <p className="text-sm text-slate-500">{title}</p>
      <p className="mt-2 font-display text-2xl font-bold tracking-[-0.03em] text-slate-900">{value}</p>
    </div>
  )
}

export default MiniMetric
