/**
 * Each splash is a soft ellipse of paint: its colour, its spot on the wall, and the path it
 * drifts along. Different durations keep the splashes from ever moving in step.
 */
const SPLASHES = [
  {
    paint: 'from-brand-400',
    spot: '-top-[30%] -left-[15%] h-[70vmax] w-[85vmax]',
    drift:
      '[--drift-duration:31s] [--drift-rotate:18deg] [--drift-scale:1.15] [--drift-x:14vw] [--drift-y:12vh]',
  },
  {
    paint: 'from-cyan-300',
    spot: '-top-[35%] left-[30%] h-[60vmax] w-[70vmax]',
    drift:
      '[--drift-duration:43s] [--drift-rotate:-24deg] [--drift-scale:1.25] [--drift-x:-12vw] [--drift-y:18vh]',
  },
  {
    paint: 'from-amber-300',
    spot: '-top-[20%] -right-[20%] h-[65vmax] w-[60vmax]',
    drift:
      '[--drift-duration:27s] [--drift-rotate:30deg] [--drift-scale:1.1] [--drift-x:-16vw] [--drift-y:22vh]',
  },
  {
    paint: 'from-sky-300',
    spot: 'top-[30%] -left-[25%] h-[60vmax] w-[75vmax]',
    drift:
      '[--drift-duration:37s] [--drift-rotate:-16deg] [--drift-scale:1.2] [--drift-x:20vw] [--drift-y:-12vh]',
  },
  {
    paint: 'from-rose-300',
    spot: 'top-[40%] -right-[20%] h-[65vmax] w-[70vmax]',
    drift:
      '[--drift-duration:47s] [--drift-rotate:22deg] [--drift-scale:1.15] [--drift-x:-18vw] [--drift-y:-16vh]',
  },
  {
    paint: 'from-teal-200',
    spot: '-bottom-[40%] left-[20%] h-[60vmax] w-[80vmax]',
    drift:
      '[--drift-duration:34s] [--drift-rotate:-28deg] [--drift-scale:1.2] [--drift-x:10vw] [--drift-y:-20vh]',
  },
] as const

/**
 * Blurred colour splashed across the whole window, slowly moving behind every page.
 * Paint soaks into the light wall (multiply) and glows out of the dark one (screen).
 */
export function AppBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {SPLASHES.map(({ paint, spot, drift }) => (
        <div
          key={paint}
          className={`absolute bg-radial ${paint} to-transparent to-70% opacity-35 mix-blend-multiply motion-safe:animate-drift dark:opacity-15 dark:mix-blend-screen ${spot} ${drift}`}
        />
      ))}
      <div className="bg-grain absolute inset-0 opacity-[0.08] mix-blend-multiply dark:opacity-[0.12] dark:mix-blend-overlay" />
    </div>
  )
}
