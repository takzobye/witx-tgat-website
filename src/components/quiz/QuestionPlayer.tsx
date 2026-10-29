import { Link } from '@tanstack/react-router'
import { ArrowRight, Box, CircleCheck, CircleX, RotateCcw } from 'lucide-react'
import { useMemo, useState } from 'react'
import { CHOICE_LABELS, type Question } from '#/cube/question'
import { matchView } from '#/cube/view'
import { ChoiceCard, type ChoiceState } from './ChoiceCard'
import { QuestionFigure } from './QuestionFigure'
import { useFigureState } from './use-figure-state'

interface QuestionPlayerProps {
  question: Question
  /** Id of the following question, or `null` on the last one. */
  nextId: string | null
  /** Called each time an answer is checked. */
  onCheck: (correct: boolean) => void
}

export function QuestionPlayer({ question, nextId, onCheck }: QuestionPlayerProps) {
  const [selected, setSelected] = useState<number | null>(null)
  const [checked, setChecked] = useState(false)
  const figure = useFigureState()
  const matches = useMemo(
    () => question.choices.map((choice) => matchView(question.cube, choice)),
    [question],
  )

  const choose = (index: number) => (checked ? figure.compare(index) : setSelected(index))

  const check = () => {
    setChecked(true)
    figure.compare(question.answer)
    onCheck(selected === question.answer)
  }

  const retry = () => {
    setSelected(null)
    setChecked(false)
    figure.reset()
  }

  const stateOf = (index: number): ChoiceState => {
    if (!checked) return index === selected ? 'selected' : 'idle'
    if (index === question.answer) return 'correct'
    return index === selected ? 'wrong' : 'muted'
  }

  const compared = figure.comparedIndex

  return (
    <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
      <QuestionFigure
        net={question.net}
        cube={question.cube}
        mode={figure.mode}
        onModeChange={figure.setMode}
        fold={figure.fold}
        onFoldChange={figure.setFold}
        comparison={
          compared === null ? null : { label: CHOICE_LABELS[compared], match: matches[compared] }
        }
      />

      <section aria-label="ตัวเลือก" className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {question.choices.map((view, index) => (
            <ChoiceCard
              key={index}
              label={CHOICE_LABELS[index]}
              view={view}
              state={stateOf(index)}
              pressed={checked ? compared === index : selected === index}
              onClick={() => choose(index)}
              footer={checked && <CompareHint active={compared === index} />}
            />
          ))}
        </div>

        {checked ? (
          <div
            role="status"
            className={`rounded-2xl border p-4 sm:p-5 ${
              selected === question.answer
                ? 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-400/25 dark:bg-emerald-400/10 dark:text-emerald-200'
                : 'border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-400/25 dark:bg-rose-400/10 dark:text-rose-200'
            }`}
          >
            {selected === question.answer ? (
              <p className="flex items-center gap-2 text-lg font-semibold">
                <CircleCheck className="size-6" /> ถูกต้อง!
              </p>
            ) : (
              <p className="flex items-center gap-2 text-lg font-semibold">
                <CircleX className="size-6" /> ยังไม่ถูก คำตอบคือข้อ {CHOICE_LABELS[question.answer]}
              </p>
            )}
            {question.explanation && (
              <p className="mt-2 leading-relaxed text-ink-soft">{question.explanation}</p>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={retry}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-line-strong bg-surface px-5 py-2.5 text-sm font-semibold text-ink transition hover:bg-sunken focus-visible:ring-4 focus-visible:ring-ink-faint/30 focus-visible:outline-none"
              >
                <RotateCcw className="size-4" /> ทำข้อนี้อีกครั้ง
              </button>
              {nextId ? (
                <Link
                  to="/questions/$questionId"
                  params={{ questionId: nextId }}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-500 focus-visible:ring-4 focus-visible:ring-brand-500/30 focus-visible:outline-none"
                >
                  ข้อต่อไป <ArrowRight className="size-4" />
                </Link>
              ) : (
                <Link
                  to="/questions"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-500 focus-visible:ring-4 focus-visible:ring-brand-500/30 focus-visible:outline-none"
                >
                  ดูโจทย์ทั้งหมด
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-surface p-2.5 pl-4">
            <p className="text-sm text-ink-muted">
              {selected === null ? 'เลือกคำตอบที่คิดว่าถูก 1 ข้อ' : `เลือกข้อ ${CHOICE_LABELS[selected]}`}
            </p>
            <button
              type="button"
              disabled={selected === null}
              onClick={check}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-500 focus-visible:ring-4 focus-visible:ring-brand-500/30 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-brand-600"
            >
              ตรวจคำตอบ
            </button>
          </div>
        )}
      </section>
    </div>
  )
}

function CompareHint({ active }: { active: boolean }) {
  return active ? (
    <span className="inline-flex items-center gap-1 text-accent-ink">
      <Box className="size-3.5" /> แสดงใน 3D อยู่
    </span>
  ) : (
    <span className="text-ink-faint">แตะเพื่อเทียบใน 3D</span>
  )
}
