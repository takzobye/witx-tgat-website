import type { QuarterTurns } from './geometry'

export type Point = readonly [x: number, y: number]

export type Fill = 'black' | 'gray' | 'none'

export type Shape =
  | { type: 'rect'; x: number; y: number; w: number; h: number; fill: Fill }
  | { type: 'circle'; cx: number; cy: number; r: number; fill: Fill }
  | { type: 'polygon'; points: readonly Point[]; fill: Fill }
  | { type: 'line'; from: Point; to: Point }

/**
 * The drawing on one face: shapes in a 100×100 box, origin at the top-left,
 * y pointing down — exactly as the face is seen from outside the cube.
 */
export type Art = readonly Shape[]

export const ART_SIZE = 100
export const STROKE_WIDTH = 3

export const COLORS = {
  ink: '#111827',
  gray: '#9ca3af',
  paper: '#ffffff',
} as const

/** SVG path data, shared by the SVG diagrams and the 3D face textures (via Path2D). */
export function shapePath(shape: Shape): string {
  switch (shape.type) {
    case 'rect':
      return `M${shape.x} ${shape.y}h${shape.w}v${shape.h}h${-shape.w}Z`
    case 'circle': {
      const { cx, cy, r } = shape
      return `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`
    }
    case 'polygon':
      return `M${shape.points.map(([x, y]) => `${x} ${y}`).join('L')}Z`
    case 'line':
      return `M${shape.from[0]} ${shape.from[1]}L${shape.to[0]} ${shape.to[1]}`
  }
}

/** Fill colour of a shape, or `null` when only its outline is drawn. */
export function shapeFill(shape: Shape): string | null {
  if (shape.type === 'line' || shape.fill === 'none') return null
  return shape.fill === 'black' ? COLORS.ink : COLORS.gray
}

/** The drawing turned clockwise by `turns` about the centre of its box. */
export function turnArt(art: Art, turns: QuarterTurns): Art {
  return art.map((shape) => turnShape(shape, turns))
}

function turnShape(shape: Shape, turns: QuarterTurns): Shape {
  const turn = (point: Point) => turnPoint(point, turns)

  switch (shape.type) {
    case 'rect': {
      // A quarter turn keeps a rectangle axis-aligned; only its opposite corners move.
      const [x1, y1] = turn([shape.x, shape.y])
      const [x2, y2] = turn([shape.x + shape.w, shape.y + shape.h])
      const x = Math.min(x1, x2)
      const y = Math.min(y1, y2)
      return { ...shape, x, y, w: Math.max(x1, x2) - x, h: Math.max(y1, y2) - y }
    }
    case 'circle': {
      const [cx, cy] = turn([shape.cx, shape.cy])
      return { ...shape, cx, cy }
    }
    case 'polygon':
      return { ...shape, points: shape.points.map(turn) }
    case 'line':
      return { ...shape, from: turn(shape.from), to: turn(shape.to) }
  }
}

/**
 * A canonical description of how `art` looks after turning it clockwise by `turns`.
 * Two faces look identical exactly when their keys are equal — so blank faces match
 * each other and a symmetric drawing matches its own rotations.
 */
export function appearanceKey(art: Art, turns: QuarterTurns): string {
  return art
    .map((shape) => primitiveKey(turnPrimitive(toPrimitive(shape), turns)))
    .sort()
    .join('|')
}

type Primitive =
  | { kind: 'area'; points: readonly Point[]; fill: Fill }
  | { kind: 'circle'; center: Point; r: number; fill: Fill }
  | { kind: 'line'; ends: readonly [Point, Point] }

function toPrimitive(shape: Shape): Primitive {
  switch (shape.type) {
    case 'rect': {
      const { x, y, w, h } = shape
      const corners: Point[] = [
        [x, y],
        [x + w, y],
        [x + w, y + h],
        [x, y + h],
      ]
      return { kind: 'area', points: corners, fill: shape.fill }
    }
    case 'polygon':
      return { kind: 'area', points: shape.points, fill: shape.fill }
    case 'circle':
      return { kind: 'circle', center: [shape.cx, shape.cy], r: shape.r, fill: shape.fill }
    case 'line':
      return { kind: 'line', ends: [shape.from, shape.to] }
  }
}

function turnPrimitive(primitive: Primitive, turns: QuarterTurns): Primitive {
  const turn = (point: Point) => turnPoint(point, turns)

  switch (primitive.kind) {
    case 'area':
      return { ...primitive, points: primitive.points.map(turn) }
    case 'circle':
      return { ...primitive, center: turn(primitive.center) }
    case 'line':
      return { ...primitive, ends: [turn(primitive.ends[0]), turn(primitive.ends[1])] }
  }
}

/** Turns a point clockwise about the centre of the box (y points down). */
function turnPoint([x, y]: Point, turns: QuarterTurns): Point {
  let turned: Point = [x, y]
  for (let i = 0; i < turns; i++) turned = [ART_SIZE - turned[1], turned[0]]
  return turned
}

function primitiveKey(primitive: Primitive): string {
  switch (primitive.kind) {
    case 'area':
      return `area:${primitive.fill}:${canonicalOutline(primitive.points)}`
    case 'circle':
      return `circle:${primitive.fill}:${formatPoint(primitive.center)}:${formatNumber(primitive.r)}`
    case 'line':
      return `line:${primitive.ends.map(formatPoint).sort().join(';')}`
  }
}

/** The same outline reads the same regardless of start vertex or winding direction. */
function canonicalOutline(points: readonly Point[]): string {
  const formatted = points.map(formatPoint)
  const windings = [formatted, [...formatted].reverse()]
  const readings = windings.flatMap((cycle) =>
    cycle.map((_, start) => [...cycle.slice(start), ...cycle.slice(0, start)].join(';')),
  )
  return readings.sort()[0]
}

function formatPoint([x, y]: Point): string {
  return `${formatNumber(x)},${formatNumber(y)}`
}

/** Rounds away floating-point noise; also normalises -0 to 0. */
function formatNumber(value: number): string {
  return String(Number(value.toFixed(3)))
}
