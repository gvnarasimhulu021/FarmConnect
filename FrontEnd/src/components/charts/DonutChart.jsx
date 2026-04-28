function DonutChart() {
  return (
    <div className="flex items-center justify-center">
      <div className="relative">
        <div className="h-48 w-48 rounded-full bg-[conic-gradient(#22c55e_0_46%,#38bdf8_46%_77%,#fdba74_77%_100%)] p-4 shadow-inner">
          <div className="flex h-full w-full items-center justify-center rounded-full bg-white shadow-inner">
            <div className="text-center">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Fresh Mix</p>
              <p className="mt-2 font-display text-3xl font-bold tracking-[-0.04em] text-slate-900">100%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DonutChart
