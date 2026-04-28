function MiniPreviewCard({ title, subtitle, body }) {
  return (
    <div className="rounded-[28px] border border-white/70 bg-white/75 p-5 shadow-lg shadow-slate-200/40">
      <p className="font-display text-xl font-bold text-slate-900">{title}</p>
      <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      <div className="mt-5">{body}</div>
    </div>
  )
}

export default MiniPreviewCard
