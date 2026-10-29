import { ArrowRight, GraduationCap } from 'lucide-react'
import { useState } from 'react'
import { methods } from '#/content/methods'
import { MethodIcon } from '#/components/learn/MethodIcon'
import { MethodPickerDialog } from '#/components/learn/MethodPickerDialog'
import { FeatureCard } from './FeatureCard'

/** Step-by-step lessons in the three methods; opens the picker to choose one. */
export function GuidedPracticeCard() {
  const [picking, setPicking] = useState(false)

  return (
    <>
      <FeatureCard
        tone="amber"
        media={
          <div className="flex flex-col items-center gap-3">
            <div className="flex gap-2">
              {methods.map((method) => (
                <MethodIcon
                  key={method.id}
                  methodId={method.id}
                  title={method.name}
                  className="shadow-sm ring-1 ring-contrast/5"
                />
              ))}
            </div>
            <p className="text-sm font-bold text-ink">3 สูตรพับกล่อง</p>
          </div>
        }
        tag={
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-amber-600/20 ring-inset dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/25">
            <GraduationCap className="size-3.5" aria-hidden="true" /> บทเรียน
          </span>
        }
        aside={<span>ทีละขั้น · ภาพ 3 มิติ</span>}
        title="เริ่มฝึกทีละขั้น พร้อมลงสนามสอบจริง"
        description="เลือก 1 ใน 3 สูตรพับกล่อง เรียนทีละขั้นด้วยภาพ 3 มิติ แล้วลองกับโจทย์จริง"
        action={
          <button
            type="button"
            onClick={() => setPicking(true)}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-accent-soft px-5 py-2.5 text-sm font-semibold text-accent-ink transition hover:bg-brand-100 focus-visible:ring-4 focus-visible:ring-brand-500/30 focus-visible:outline-none dark:hover:bg-brand-400/25"
          >
            เลือกวิธีฝึก <ArrowRight className="size-4" />
          </button>
        }
      />
      <MethodPickerDialog open={picking} onClose={() => setPicking(false)} />
    </>
  )
}
