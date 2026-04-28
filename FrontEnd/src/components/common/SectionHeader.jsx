function SectionHeader({ title, subtitle, actionLabel, onAction }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <h3 className="font-display text-2xl font-bold tracking-[-0.03em] text-slate-900">{title}</h3>
        <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      </div>
      {actionLabel && (
        <button className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-200" type="button" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  )
}

export default SectionHeader
