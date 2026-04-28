function TrackingSteps({ status }) {
  const steps = ['PLACED', 'PACKED', 'SHIPPED', 'DELIVERED']
  const currentIndex = steps.indexOf(status === 'ACCEPTED' ? 'PACKED' : status)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {steps.map((step, index) => {
          const active = index <= currentIndex
          return (
            <div key={step} className="flex flex-1 items-center gap-2">
              <div className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold ${active ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/25' : 'bg-white text-slate-400'}`}>
                {index + 1}
              </div>
              {index < steps.length - 1 && <div className={`h-1 flex-1 rounded-full ${active ? 'bg-green-500' : 'bg-slate-200'}`} />}
            </div>
          )
        })}
      </div>
      <div className="grid grid-cols-4 gap-2 text-center text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
        {steps.map((step) => (
          <span key={step}>{step}</span>
        ))}
      </div>
    </div>
  )
}

export default TrackingSteps
