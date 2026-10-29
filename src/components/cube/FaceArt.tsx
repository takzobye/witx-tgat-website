import { useId } from 'react'
import { ART_SIZE, COLORS, STROKE_WIDTH, shapeFill, shapePath, type Art } from '#/cube/art'

/** A face drawing in its 100×100 box, clipped to the face. Position it with a parent transform. */
export function FaceArt({ art }: { art: Art }) {
  const clipId = useId()
  return (
    <>
      <clipPath id={clipId}>
        <rect width={ART_SIZE} height={ART_SIZE} />
      </clipPath>
      <g clipPath={`url(#${clipId})`}>
        <rect width={ART_SIZE} height={ART_SIZE} fill={COLORS.paper} />
        {art.map((shape, i) => (
          <path
            key={i}
            d={shapePath(shape)}
            fill={shapeFill(shape) ?? 'none'}
            stroke={COLORS.ink}
            strokeWidth={STROKE_WIDTH}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        ))}
      </g>
    </>
  )
}
