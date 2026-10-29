import { ART_SIZE, COLORS, STROKE_WIDTH, shapeFill, shapePath, type Art } from '#/cube/art'

const TEXTURE_SIZE = 512

/** Paints a face — its drawing and outline — onto a canvas for use as a 3D texture. */
export function paintFace(art: Art): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = TEXTURE_SIZE
  canvas.height = TEXTURE_SIZE
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Canvas 2D is not available')

  context.scale(TEXTURE_SIZE / ART_SIZE, TEXTURE_SIZE / ART_SIZE)
  context.fillStyle = COLORS.paper
  context.fillRect(0, 0, ART_SIZE, ART_SIZE)
  context.strokeStyle = COLORS.ink
  context.lineWidth = STROKE_WIDTH
  context.lineJoin = 'round'
  context.lineCap = 'round'

  for (const shape of art) {
    const path = new Path2D(shapePath(shape))
    const fill = shapeFill(shape)
    if (fill) {
      context.fillStyle = fill
      context.fill(path)
    }
    context.stroke(path)
  }

  const inset = STROKE_WIDTH / 2
  context.strokeRect(inset, inset, ART_SIZE - STROKE_WIDTH, ART_SIZE - STROKE_WIDTH)
  return canvas
}
