function ShowcaseStat({ label, value, accent }) {
  return (
    <div className="rounded-[24px] border border-white/70 bg-white/80 p-5 shadow-lg shadow-slate-200/40">
      <div className={`h-1.5 w-16 rounded-full bg-gradient-to-r ${accent}`} />
      <p className="mt-4 text-sm text-slate-500">{label}</p>
      <p className="mt-2 font-display text-4xl font-bold tracking-[-0.04em] text-slate-900">{value}</p>
    </div>
  )
}

export default ShowcaseStat
