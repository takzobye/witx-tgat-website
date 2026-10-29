import { createFileRoute } from '@tanstack/react-router'
import { useDeferredValue, useMemo, useState } from 'react'
import { parseQuestionDraft } from '#/cube/question'
import { questionFiles } from '#/content/question-files'
import { DraftPreview } from '#/components/lab/DraftPreview'
import { DraftStatus } from '#/components/lab/DraftStatus'
import { FormatGuide } from '#/components/lab/FormatGuide'
import { SourceEditor } from '#/components/lab/SourceEditor'

export const Route = createFileRoute('/lab')({
  head: () => ({ meta: [{ title: 'สร้างโจทย์ · ฝึกพับกล่อง TGAT2' }] }),
  component: LabPage,
})

function LabPage() {
  const [source, setSource] = useState(questionFiles[0].text)
  const deferredSource = useDeferredValue(source)
  const parsed = useMemo(() => parseQuestionDraft(deferredSource), [deferredSource])

  return (
    <div className="py-8 sm:py-10">
      <header className="max-w-3xl">
        <h1 className="text-3xl font-bold">สร้างโจทย์</h1>
        <p className="mt-3 leading-relaxed text-ink-soft">
          เขียนโจทย์เป็น JSON แล้วดูผลได้ทันที ระบบจะพับแผ่นคลี่และบอกว่าตัวเลือกไหนพับได้จริง
          เมื่อเรียบร้อยแล้วให้บันทึกเป็นไฟล์ใหม่ใน{' '}
          <code className="rounded bg-fill-strong/70 px-1.5 py-0.5 text-sm">
            src/content/questions/
          </code>{' '}
          ชื่อไฟล์จะเป็นทั้งลำดับและ URL ของโจทย์
        </p>
      </header>

      <div className="mt-8 grid gap-6 lg:grid-cols-2 lg:items-start">
        <SourceEditor source={source} onChange={setSource} />

        <section aria-label="ตัวอย่าง" className="flex flex-col gap-4">
          <DraftStatus parsed={parsed} />
          {parsed.status === 'ready' && (
            <DraftPreview draft={parsed.draft} answer={parsed.answer} />
          )}
        </section>
      </div>

      <FormatGuide />
    </div>
  )
}
