function InputWithIcon({ label, placeholder, value, onChange, type = 'text', icon }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">{label}</span>
      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">{icon}</span>
        <input className="premium-input pl-12" placeholder={placeholder} value={value} type={type} onChange={(event) => onChange(event.target.value)} />
      </div>
    </label>
  )
}

export default InputWithIcon
