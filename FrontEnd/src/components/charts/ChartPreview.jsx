function ChartPreview() {
  return (
    <div className="rounded-[22px] bg-slate-50 p-4">
      <svg viewBox="0 0 260 140" className="h-32 w-full">
        <path d="M12 106 C45 80, 78 92, 112 66 S180 40, 248 24" fill="none" stroke="#22c55e" strokeWidth="4" strokeLinecap="round" />
        {[48, 88, 128, 168, 208].map((x, index) => (
          <rect key={x} x={x} y={80 - index * 6} width="16" height={32 + index * 10} rx="8" fill={index % 2 === 0 ? '#bbf7d0' : '#7dd3fc'} opacity="0.9" />
        ))}
      </svg>
    </div>
  )
}

export default ChartPreview
