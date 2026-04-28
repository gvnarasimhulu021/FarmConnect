function SettingToggle({ title, description, defaultChecked }) {
  return (
    <div className="flex items-center justify-between rounded-[22px] bg-slate-50 px-4 py-4">
      <div className="pr-4">
        <p className="font-semibold text-slate-900">{title}</p>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
      <label className="relative inline-flex cursor-pointer items-center">
        <input className="peer sr-only" type="checkbox" defaultChecked={defaultChecked} />
        <div className="h-7 w-12 rounded-full bg-slate-300 transition peer-checked:bg-green-500" />
        <div className="absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow transition peer-checked:translate-x-5" />
      </label>
    </div>
  )
}

export default SettingToggle
