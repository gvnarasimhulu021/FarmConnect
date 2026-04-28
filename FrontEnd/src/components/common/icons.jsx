export function LeafMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current">
      <path d="M18.7 3.3c-4.5.1-8.4 1.7-11.1 4.4-3.7 3.7-4.5 8.7-1.8 11.4s7.7 1.9 11.4-1.8c2.7-2.7 4.3-6.6 4.4-11.1V3.3h-2.9ZM8.8 16.6c-1.1-1.1-.8-3.4 1-5.2 1.6-1.6 4.3-2.9 7.8-3.3-.4 3.5-1.7 6.2-3.3 7.8-1.8 1.8-4.1 2.1-5.2 1Z" />
    </svg>
  )
}

export function GridIcon() {
  return <IconBox path="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" />
}

export function BoxIcon() {
  return <IconBox path="M12 3 4 7v10l8 4 8-4V7l-8-4Zm0 2.2 5.2 2.6L12 10.4 6.8 7.8 12 5.2Zm-6 4.2 5 2.5v6.3l-5-2.5V9.4Zm7 8.8v-6.3l5-2.5v6.3l-5 2.5Z" />
}

export function CartIcon() {
  return <IconBox path="M4 5h2l2.2 9.2A2 2 0 0 0 10.1 16H18a2 2 0 0 0 1.9-1.4L22 8H8.3M10 20a1.5 1.5 0 1 0 0 .01M18 20a1.5 1.5 0 1 0 0 .01" stroke />
}

export function UsersIcon() {
  return <IconBox path="M16 11a4 4 0 1 0-4-4 4 4 0 0 0 4 4ZM8 13a3 3 0 1 0-3-3 3 3 0 0 0 3 3Zm8 1c-3.3 0-6 1.6-6 3.5V20h12v-2.5c0-1.9-2.7-3.5-6-3.5ZM8 15c-2.8 0-5 1.3-5 3v2h5v-2.5c0-.8.3-1.7.9-2.5H8Z" />
}

export function SettingsIcon() {
  return <IconBox path="M12 8.5A3.5 3.5 0 1 0 15.5 12 3.5 3.5 0 0 0 12 8.5Zm8 3-1.8-.5a6.8 6.8 0 0 0-.7-1.7l1.1-1.5-1.4-1.4-1.5 1.1a6.8 6.8 0 0 0-1.7-.7L12.5 4h-2l-.5 1.8a6.8 6.8 0 0 0-1.7.7L6.8 5.4 5.4 6.8l1.1 1.5a6.8 6.8 0 0 0-.7 1.7L4 11.5v2l1.8.5a6.8 6.8 0 0 0 .7 1.7l-1.1 1.5 1.4 1.4 1.5-1.1a6.8 6.8 0 0 0 1.7.7l.5 1.8h2l.5-1.8a6.8 6.8 0 0 0 1.7-.7l1.5 1.1 1.4-1.4-1.1-1.5a6.8 6.8 0 0 0 .7-1.7l1.8-.5Z" />
}

export function SearchIcon() {
  return <IconBox path="M11 4a7 7 0 1 0 4.9 12l4.1 4.1 1.4-1.4-4.1-4.1A7 7 0 0 0 11 4Zm0 2a5 5 0 1 1 0 10 5 5 0 0 1 0-10Z" />
}

export function BellIcon() {
  return <IconBox path="M12 22a2.5 2.5 0 0 0 2.4-2h-4.8A2.5 2.5 0 0 0 12 22Zm7-6V11a7 7 0 1 0-14 0v5l-2 2v1h18v-1Z" />
}

export function MailIcon() {
  return <IconBox path="M4 6h16v12H4zM4 7l8 6 8-6" stroke />
}

export function LockIcon() {
  return <IconBox path="M7 10V8a5 5 0 0 1 10 0v2M6 10h12v10H6z" stroke />
}

export function UserIcon() {
  return <IconBox path="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-4 0-7 2-7 4.5V20h14v-1.5C19 16 16 14 12 14Z" />
}

export function BarIcon() {
  return <IconBox path="M5 19h14M8 17V9m4 8V5m4 12v-6" stroke />
}

export function CheckCircleIcon() {
  return <IconBox path="M12 22a10 10 0 1 0-10-10 10 10 0 0 0 10 10Zm-1.5-6-4-4 1.4-1.4 2.6 2.6 5.6-5.6 1.4 1.4Z" />
}

function IconBox({ path, stroke = false }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill={stroke ? 'none' : 'currentColor'} stroke={stroke ? 'currentColor' : 'none'} strokeWidth={stroke ? '2' : '0'} strokeLinecap="round" strokeLinejoin="round">
      <path d={path} />
    </svg>
  )
}
