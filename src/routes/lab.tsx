import { createFileRoute } from '@tanstack/react-router'
import { AlertTriangle, Check, CircleCheck, Copy, Download, X } from 'lucide-react'
import { useDeferredValue, useMemo, useState } from 'react'
import {
  CHOICE_LABELS,
  checkAnswer,
  questionDraftSchema,
  type AnswerCheck,
  type QuestionDraft,
} from '#/cube/question'
import { matchView } from '#/cube/view'
import { questionFiles } from '#/content/question-files'
import { ChoiceCard } from '#/components/quiz/ChoiceCard'
import { QuestionFigure } from '#/components/quiz/QuestionFigure'
import { useFigureState } from '#/components/quiz/use-figure-state'
import { toneStyles } from '#/components/ui/tone-styles'

export const Route = createFileRoute('/lab')({
  head: () => ({ meta: [{ title: 'สร้างโจทย์ · ฝึกพับกล่อง TGAT2' }] }),
  component: LabPage,
})

type Parsed =
  | { status: 'syntax-error'; message: string }
  | { status: 'invalid'; issues: { path: string; message: string }[] }
  | { status: 'ready'; draft: QuestionDraft; answer: AnswerCheck }

function parse(source: string): Parsed {
  let json: unknown
  try {
    json = JSON.parse(source)
  } catch (error) {
    return { status: 'syntax-error', message: error instanceof Error ? error.message : String(error) }
  }
  const result = questionDraftSchema.safeParse(json)
  if (!result.success) {
    const issues = result.error.issues.map((issue) => ({
      path: issue.path.map(String).join('.'),
      message: issue.message,
    }))
    return { status: 'invalid', issues }
  }
  return { status: 'ready', draft: result.data, answer: checkAnswer(result.data) }
}

const TOOLBAR_BUTTON =
  'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-ink-soft transition hover:bg-fill hover:text-ink'

function LabPage() {
  const [source, setSource] = useState(questionFiles[0].text)
  const [copied, setCopied] = useState(false)
  const deferredSource = useDeferredValue(source)
  const parsed = useMemo(() => parse(deferredSource), [deferredSource])

  const copy = async () => {
    await navigator.clipboard.writeText(source)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const download = () => {
    const url = URL.createObjectURL(new Blob([source], { type: 'application/json' }))
    const link = document.createElement('a')
    link.href = url
    link.download = 'new-question.json'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="py-8 sm:py-10">
      <header className="max-w-3xl">
        <h1 className="text-3xl font-bold">สร้างโจทย์</h1>
        <p className="mt-3 leading-relaxed text-ink-soft">
          เขียนโจทย์เป็น JSON แล้วดูผลได้ทันที ระบบจะพับแผ่นคลี่และบอกว่าตัวเลือกไหนพับได้จริง
          เมื่อเรียบร้อยแล้วให้บันทึกเป็นไฟล์ใหม่ใน{' '}
          <code className="rounded bg-fill-strong/70 px-1.5 py-0.5 text-sm">src/content/questions/</code>{' '}
          ชื่อไฟล์จะเป็นทั้งลำดับและ URL ของโจทย์
        </p>
      </header>

      <div className="mt-8 grid gap-6 lg:grid-cols-2 lg:items-start">
        <section className="flex flex-col overflow-hidden rounded-3xl border border-line bg-surface shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-3 py-2">
            <label className="flex items-center gap-2 pl-1 text-sm text-ink-soft">
              เริ่มจาก
              <select
                defaultValue={questionFiles[0].id}
                onChange={(event) => {
                  const file = questionFiles.find((f) => f.id === event.target.value)
                  if (file) setSource(file.text)
                }}
                className="rounded-lg border border-line-strong bg-surface px-2 py-1 text-sm"
              >
                {questionFiles.map((file) => (
                  <option key={file.id} value={file.id}>
                    {file.id}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex items-center gap-1">
              <button type="button" onClick={copy} className={TOOLBAR_BUTTON}>
                {copied ? <Check className={`size-4 ${toneStyles.emerald.text}`} /> : <Copy className="size-4" />}
                {copied ? 'คัดลอกแล้ว' : 'คัดลอก'}
              </button>
              <button type="button" onClick={download} className={TOOLBAR_BUTTON}>
                <Download className="size-4" /> ดาวน์โหลด
              </button>
            </div>
          </div>
          <textarea
            value={source}
            onChange={(event) => setSource(event.target.value)}
            spellCheck={false}
            wrap="off"
            aria-label="JSON ของโจทย์"
            className="min-h-[65vh] w-full resize-y bg-surface p-4 font-mono text-[13px] leading-relaxed text-ink outline-none"
          />
        </section>

        <section aria-label="ตัวอย่าง" className="flex flex-col gap-4">
          <StatusBanner parsed={parsed} />
          {parsed.status === 'ready' && <Preview draft={parsed.draft} answer={parsed.answer} />}
        </section>
      </div>

      <FormatGuide />
    </div>
  )
}

function StatusBanner({ parsed }: { parsed: Parsed }) {
  if (parsed.status === 'ready') {
    return parsed.answer.ok ? (
      <Banner tone="success" title={`พร้อมใช้งาน คำตอบคือข้อ ${CHOICE_LABELS[parsed.answer.answer]}`} />
    ) : (
      <Banner tone="warning" title="ยังไม่มีคำตอบที่ชัดเจน">
        {parsed.answer.problem}
      </Banner>
    )
  }
  if (parsed.status === 'syntax-error') {
    return (
      <Banner tone="error" title="รูปแบบ JSON ไม่ถูกต้อง">
        <code className="text-sm">{parsed.message}</code>
      </Banner>
    )
  }
  return (
    <Banner tone="error" title="ยังใช้ไม่ได้ แก้ตามนี้">
      <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
        {parsed.issues.map(({ path, message }, i) => (
          <li key={i}>
            {path && <code className="mr-1.5 rounded bg-rose-100 px-1 py-0.5 dark:bg-rose-400/15">{path}</code>}
            {message}
          </li>
        ))}
      </ul>
    </Banner>
  )
}

const BANNER_TONES = {
  success: { box: toneStyles.emerald.panel, icon: CircleCheck },
  warning: { box: toneStyles.amber.panel, icon: AlertTriangle },
  error: { box: toneStyles.rose.panel, icon: X },
} as const

function Banner({
  tone,
  title,
  children,
}: {
  tone: keyof typeof BANNER_TONES
  title: string
  children?: React.ReactNode
}) {
  const { box, icon: Icon } = BANNER_TONES[tone]
  return (
    <div role="status" className={`rounded-2xl border px-4 py-3 ${box}`}>
      <p className="flex items-center gap-2 font-semibold">
        <Icon className="size-5 shrink-0" /> {title}
      </p>
      {children && <div className="mt-1">{children}</div>}
    </div>
  )
}

function Preview({ draft, answer }: { draft: QuestionDraft; answer: AnswerCheck }) {
  const figure = useFigureState()
  const matches = useMemo(
    () => draft.choices.map((choice) => matchView(draft.cube, choice)),
    [draft],
  )
  // The draft changes as the author types; forget a comparison whose choice is gone.
  const compared =
    figure.comparedIndex !== null && figure.comparedIndex < draft.choices.length
      ? figure.comparedIndex
      : null

  return (
    <>
      <QuestionFigure
        net={draft.net}
        cube={draft.cube}
        mode={figure.mode}
        onModeChange={figure.setMode}
        fold={figure.fold}
        onFoldChange={figure.setFold}
        comparison={
          compared === null ? null : { label: CHOICE_LABELS[compared], match: matches[compared] }
        }
        showFaceIds
      />
      <p className="font-semibold text-balance">{draft.prompt}</p>
      <div className="grid grid-cols-2 gap-3">
        {draft.choices.map((view, index) => (
          <ChoiceCard
            key={index}
            label={CHOICE_LABELS[index]}
            view={view}
            state={answer.ok && answer.answer === index ? 'correct' : 'idle'}
            pressed={compared === index}
            onClick={() => figure.compare(index)}
            footer={
              draft.foldable[index] ? (
                <span className={toneStyles.emerald.text}>พับได้</span>
              ) : (
                <span className={toneStyles.rose.text}>พับไม่ได้</span>
              )
            }
          />
        ))}
      </div>
    </>
  )
}

function FormatGuide() {
  return (
    <details className="mt-10 rounded-3xl border border-line bg-surface p-5 sm:p-6" open>
      <summary className="cursor-pointer text-lg font-semibold">คู่มือรูปแบบโจทย์</summary>
      <dl className="mt-4 grid gap-x-8 gap-y-4 text-sm leading-relaxed text-ink-soft md:grid-cols-[10rem_1fr]">
        <dt className="font-mono font-semibold text-ink">layout</dt>
        <dd>
          วาดแผ่นคลี่เป็นแถวตัวอักษร 1 ตัวต่อ 1 หน้า (A–Z หรือตัวเลข) และใช้ <code>.</code>{' '}
          แทนช่องว่าง ต้องมี 6 หน้าที่พับเป็นลูกบาศก์ได้จริง เช่น{' '}
          <code>["A...", "BCDE", ".F.."]</code>
        </dd>
        <dt className="font-mono font-semibold text-ink">faces</dt>
        <dd>
          ลวดลายของแต่ละหน้า วาดในกรอบ 100×100 โดยมุมซ้ายบนคือ (0, 0) และมองจากด้านนอกกล่อง
          หน้าที่ไม่ได้ใส่จะเป็นหน้าว่าง รูปที่ใช้ได้:{' '}
          <code>{'{ "type": "rect", "x", "y", "w", "h" }'}</code>,{' '}
          <code>{'{ "type": "circle", "cx", "cy", "r" }'}</code>,{' '}
          <code>{'{ "type": "polygon", "points": [[x, y], …] }'}</code>,{' '}
          <code>{'{ "type": "line", "from": [x, y], "to": [x, y] }'}</code> ใส่{' '}
          <code>"fill"</code> เป็น <code>"black"</code> (ค่าเริ่มต้น), <code>"gray"</code> หรือ{' '}
          <code>"none"</code> (เส้นขอบอย่างเดียว)
        </dd>
        <dt className="font-mono font-semibold text-ink">choices</dt>
        <dd>
          ตัวเลือก 2–5 ข้อ แต่ละข้อบอกหน้าที่เห็นด้าน <code>top</code>, <code>left</code>,{' '}
          <code>right</code> เขียนเป็น <code>"A"</code> หรือ{' '}
          <code>{'{ "face": "A", "rotate": 90 }'}</code> (หมุนตามเข็มนาฬิกา) ถ้าไม่หมุน
          ลายด้านซ้ายและขวาจะตั้งตรง ส่วนด้านบนจะวางเหมือนพับขึ้นมาจากหน้าด้านซ้าย
          สลับไปดู 3D เพื่อเช็กว่าหน้าตาตรงกับที่ตั้งใจไว้
        </dd>
        <dt className="font-mono font-semibold text-ink">ask</dt>
        <dd>
          <code>"possible"</code> (ค่าเริ่มต้น) ถามหารูปที่พับได้ หรือ <code>"impossible"</code>{' '}
          ถามหารูปที่พับไม่ได้ ระบบหาคำตอบเองจากการพับจริง จึงต้องมีคำตอบที่ถูกเพียงข้อเดียว
        </dd>
        <dt className="font-mono font-semibold text-ink">อื่น ๆ</dt>
        <dd>
          <code>title</code> ชื่อโจทย์, <code>difficulty</code> เป็น <code>"easy"</code>,{' '}
          <code>"medium"</code> หรือ <code>"hard"</code>, <code>explanation</code>{' '}
          คำอธิบายหลังตรวจคำตอบ (ไม่ใส่ก็ได้) และ <code>prompt</code> ถ้าต้องการเปลี่ยนคำถาม
        </dd>
      </dl>
    </details>
  )
}
