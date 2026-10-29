import { CameraControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { Box, PackageOpen, RotateCcw } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { IDENTITY, type Matrix3, type Vec3 } from '#/cube/geometry'
import type { FoldedCube } from '#/cube/net'
import { FoldModel } from './FoldModel'

/** Slightly above and to the right, far enough to keep a flat or half-folded net in frame. */
const OVERVIEW_CAMERA: Vec3 = [2, 2.4, 5.8]
/** Close up along +x +y +z — the same view as the isometric answer choices. */
const ISOMETRIC_CAMERA: Vec3 = [2.4, 2.4, 2.4]

export interface FoldStageProps {
  cube: FoldedCube
  /** 0 is the flat net, 1 the closed cube. */
  fold: number
  onFoldChange: (fold: number) => void
  /** Hold the cube like this and look at it isometrically; `null` shows the net as laid out. */
  orientation: Matrix3 | null
  /** Short note shown over the scene, e.g. which choice is being compared. */
  caption?: string
}

export default function FoldStage({ cube, fold, onFoldChange, orientation, caption }: FoldStageProps) {
  // Kept in state: the controls mount inside the canvas after this component does,
  // and the camera can only be aimed once they exist.
  const [controls, setControls] = useState<CameraControls | null>(null)
  const framing = fold === 1 ? ISOMETRIC_CAMERA : OVERVIEW_CAMERA

  const resetCamera = useCallback(() => {
    const [x, y, z] = framing
    void controls?.setLookAt(x, y, z, 0, 0, 0, true)
  }, [controls, framing])

  // Aim when the controls arrive, when the framing switches, and when a different pose is
  // requested even if the framing stays the same — the user may have orbited away since.
  useEffect(() => resetCamera(), [resetCamera, orientation])

  const percent = Math.round(fold * 100)
  const closed = fold === 1

  return (
    <div className="flex h-full flex-col">
      <div className="relative min-h-0 flex-1 touch-none">
        <Canvas
          frameloop="demand"
          flat
          dpr={[1, 2]}
          camera={{ position: OVERVIEW_CAMERA, fov: 35 }}
          className="dark:figure-rim"
        >
          <ambientLight intensity={1.7} />
          <directionalLight position={[2, 6, 3]} intensity={1.2} />
          <directionalLight position={[-4, -2, -3]} intensity={0.5} />
          <FoldModel cube={cube} fold={fold} orientation={orientation ?? IDENTITY} />
          <CameraControls ref={setControls} minDistance={2} maxDistance={14} />
        </Canvas>
        {caption && (
          <p className="pointer-events-none absolute top-3 left-3 rounded-full bg-surface/90 px-3 py-1 text-xs font-medium text-ink-soft shadow-sm ring-1 ring-line">
            {caption}
          </p>
        )}
        <p className="pointer-events-none absolute right-3 bottom-2 text-[11px] text-ink-faint">
          ลากเพื่อหมุน · เลื่อนหรือถ่างนิ้วเพื่อซูม
        </p>
      </div>

      <div className="flex items-center gap-3 border-t border-line bg-sunken/80 px-3 py-2.5">
        <button
          type="button"
          onClick={() => onFoldChange(closed ? 0 : 1)}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-ink px-3.5 py-1.5 text-sm font-medium text-canvas transition hover:bg-ink-soft"
        >
          {closed ? <PackageOpen className="size-4" /> : <Box className="size-4" />}
          {closed ? 'กางออก' : 'พับกล่อง'}
        </button>
        <input
          type="range"
          min={0}
          max={100}
          value={percent}
          onChange={(event) => onFoldChange(Number(event.target.value) / 100)}
          aria-label="ระดับการพับ"
          aria-valuetext={`พับแล้ว ${percent}%`}
          className="min-w-0 flex-1 accent-brand-600"
        />
        <span aria-hidden="true" className="w-10 text-right text-xs text-ink-muted tabular-nums">
          {percent}%
        </span>
        <button
          type="button"
          onClick={resetCamera}
          aria-label="กลับไปมุมมองเริ่มต้น"
          title="กลับไปมุมมองเริ่มต้น"
          className="grid size-8 shrink-0 place-items-center rounded-full text-ink-soft transition hover:bg-fill-strong"
        >
          <RotateCcw className="size-4" />
        </button>
      </div>
    </div>
  )
}
