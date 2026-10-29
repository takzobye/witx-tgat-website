import { Link } from '@tanstack/react-router'
import { LayoutGrid, ListChecks, Shuffle } from 'lucide-react'
import type { ReactNode } from 'react'
import type { BankMethod } from '#/content/methods'
import type { BankQuestion } from '#/content/questions'
import { recordAttempt } from '#/progress/attempts'
import { QuestionPlayer } from '#/components/quiz/QuestionPlayer'
import { buttonStyles } from '#/components/ui/button-styles'
import { surfaceStyles } from '#/components/ui/surface-styles'

interface PracticeStepProps {
  method: BankMethod
  question: BankQuestion
  /** The question after it in the bank, for "ข้อต่อไป". */
  next: BankQuestion | null
  number: number
  onPickAnother: () => void
  /** Link back to the last lesson step. */
  back: ReactNode
}

/** The last step: the method as an exam checklist, tried on a real question from the bank. */
export function PracticeStep({ method, question, next, number, onPickAnother, back }: PracticeStepProps) {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="text-sm font-medium text-accent-ink">ขั้นที่ {number} · ลงสนาม</p>
        <h1 className="mt-1 text-2xl font-bold text-balance sm:text-3xl">ลองใช้{method.name}กับโจทย์จริง</h1>
        <p className="mt-2 max-w-2xl leading-relaxed text-ink-soft">
          ทำตามลำดับนี้ทุกข้อ จนทำได้โดยไม่ต้องเปิดดู แล้วค่อยกดตรวจคำตอบ
        </p>
      </header>

      <section aria-label="ลำดับขั้นตอนในห้องสอบ" className={surfaceStyles.tray}>
        <div className="flex items-center gap-2 px-3 pt-2 pb-3 text-sm font-semibold text-ink-muted">
          <ListChecks className="size-4" aria-hidden="true" /> ลำดับในห้องสอบ
        </div>
        <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          {method.checklist.map((item, index) => (
            <li key={item} className={`${surfaceStyles.card} flex gap-3 p-3.5 text-sm leading-snug text-ink-soft`}>
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-accent-soft text-xs font-semibold text-accent-ink">
                {index + 1}
              </span>
              {item}
            </li>
          ))}
        </ol>
      </section>

      <section aria-label="โจทย์จริง">
        <h2 className="mb-4 text-lg font-semibold text-balance sm:text-xl">{question.prompt}</h2>
        <QuestionPlayer
          key={question.id}
          question={question}
          nextId={next?.id ?? null}
          onCheck={(correct) => recordAttempt(question.id, correct)}
        />
      </section>

      <nav className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
        {back}
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={onPickAnother} className={buttonStyles.secondary}>
            <Shuffle className="size-4" aria-hidden="true" /> ลองวิธีอื่น
          </button>
          <Link to="/questions" className={buttonStyles.primary}>
            <LayoutGrid className="size-4" aria-hidden="true" /> ฝึกต่อในคลังโจทย์
          </Link>
        </div>
      </nav>
    </div>
  )
}
