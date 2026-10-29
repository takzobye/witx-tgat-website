import { useState } from 'react'

export type FigureMode = 'net' | '3d'

/** What the question figure shows: 2D net or 3D model, how far it is folded, and which choice it is compared with. */
export function useFigureState() {
  const [mode, setMode] = useState<FigureMode>('net')
  const [fold, setFold] = useState(0)
  const [comparedIndex, setComparedIndex] = useState<number | null>(null)

  /** Folds the cube in 3D and holds it the way a choice shows it. */
  const compare = (index: number) => {
    setComparedIndex(index)
    setMode('3d')
    setFold(1)
  }

  const reset = () => {
    setComparedIndex(null)
    setMode('net')
    setFold(0)
  }

  return { mode, setMode, fold, setFold, comparedIndex, compare, reset }
}

export type FigureState = ReturnType<typeof useFigureState>
