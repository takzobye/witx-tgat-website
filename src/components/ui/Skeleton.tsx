/**
 * Placeholder for content that needs the visitor's browser, shown until the page hydrates.
 * `className` sets its size and corner radius.
 */
export function Skeleton({ className }: { className: string }) {
  return <span aria-hidden="true" className={`block animate-pulse bg-fill-strong/70 ${className}`} />
}
