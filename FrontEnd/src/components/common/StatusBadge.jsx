function StatusBadge({ status }) {
  const tone = {
    PLACED: 'bg-slate-100 text-slate-600',
    ACCEPTED: 'bg-blue-50 text-blue-700',
    PACKED: 'bg-amber-50 text-amber-700',
    SHIPPED: 'bg-sky-50 text-sky-700',
    DELIVERED: 'bg-green-50 text-green-700',
  }[status]

  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${tone}`}>{status}</span>
}

export default StatusBadge
