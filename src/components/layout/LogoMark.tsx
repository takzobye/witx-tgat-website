export function LogoMark({ className }: { className: string }) {
  return (
    <svg viewBox="-10 -11.5 20 23" className={className} aria-hidden="true">
      <path d="M0 -10 8.66 -5 0 0 -8.66 -5Z" className="fill-indigo-500" />
      <path d="M-8.66 -5 0 0 0 10 -8.66 5Z" className="fill-indigo-700" />
      <path d="M8.66 -5 0 0 0 10 8.66 5Z" className="fill-indigo-300" />
    </svg>
  )
}
