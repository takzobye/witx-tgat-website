import {
  ART_SIZE,
  COLORS,
  STROKE_WIDTH,
  shapeFill,
  shapePath,
  type Art,
  type Shape,
} from '#/cube/art'

const TEXTURE_SIZE = 512
/** In an alpha map, white is fully opaque. */
const OPAQUE = '#ffffff'
const ID_TEXTURE_SIZE = 128
/** `brand-600` from styles.css; a canvas cannot use Tailwind classes. */
const BRAND = '#0084ff'

interface Palette {
  paper: string
  ink: string
  /** Colour to fill a shape with, or `null` to leave it as an outline. */
  fill: (shape: Shape) => string | null
}

/** Paints a face — its drawing and outline — onto a canvas for use as a 3D texture. */
export function paintFace(art: Art): HTMLCanvasElement {
  return paint(art, { paper: COLORS.paper, ink: COLORS.ink, fill: shapeFill })
}

/**
 * Paints how opaque each point of a face is, for use as an alpha map: the drawing and outline
 * solid, the bare paper at `paperOpacity` so whatever lies behind it shows through.
 */
export function paintFaceOpacity(art: Art, paperOpacity: number): HTMLCanvasElement {
  const level = Math.round(paperOpacity * 255)
  return paint(art, {
    paper: `rgb(${level} ${level} ${level})`,
    ink: OPAQUE,
    fill: (shape) => (shapeFill(shape) === null ? null : OPAQUE),
  })
}

/**
 * Paints a face's id in white on brand blue, centred, for a round badge: a circle mesh
 * maps the square texture onto the disc, so the corners never show.
 */
export function paintFaceId(id: string): HTMLCanvasElement {
  const context = createContext(ID_TEXTURE_SIZE)
  context.fillStyle = BRAND
  context.fillRect(0, 0, ID_TEXTURE_SIZE, ID_TEXTURE_SIZE)
  context.fillStyle = COLORS.paper
  // A system font: the texture is painted once, possibly before the page's web font loads.
  context.font = `600 ${0.6 * ID_TEXTURE_SIZE}px ui-sans-serif, system-ui, sans-serif`
  context.textAlign = 'center'
  // Centred on the letter's ink rather than the font's line box, which sits capitals low.
  const { actualBoundingBoxAscent: ascent, actualBoundingBoxDescent: descent } =
    context.measureText(id)
  context.fillText(id, ID_TEXTURE_SIZE / 2, (ID_TEXTURE_SIZE + ascent - descent) / 2)
  return context.canvas
}

function paint(art: Art, palette: Palette): HTMLCanvasElement {
  const context = createContext(TEXTURE_SIZE)
  context.scale(TEXTURE_SIZE / ART_SIZE, TEXTURE_SIZE / ART_SIZE)
  context.fillStyle = palette.paper
  context.fillRect(0, 0, ART_SIZE, ART_SIZE)
  context.strokeStyle = palette.ink
  context.lineWidth = STROKE_WIDTH
  context.lineJoin = 'round'
  context.lineCap = 'round'

  for (const shape of art) {
    const path = new Path2D(shapePath(shape))
    const fill = palette.fill(shape)
    if (fill) {
      context.fillStyle = fill
      context.fill(path)
    }
    context.stroke(path)
  }

  const inset = STROKE_WIDTH / 2
  context.strokeRect(inset, inset, ART_SIZE - STROKE_WIDTH, ART_SIZE - STROKE_WIDTH)
  return context.canvas
}

function createContext(size: number): CanvasRenderingContext2D {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Canvas 2D is not available')
  return context
}
