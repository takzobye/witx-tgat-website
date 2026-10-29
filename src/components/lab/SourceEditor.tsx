import { Check, Copy, Download } from 'lucide-react'
import { useState } from 'react'
import { questionFiles } from '#/content/question-files'

interface SourceEditorProps {
  source: string
  onChange: (source: string) => void
}

/** The question JSON being written, with a question file to start from, and copy and download. */
export function SourceEditor({ source, onChange }: SourceEditorProps) {
  const [copied, setCopied] = useState(false)

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
    <section className="flex flex-col overflow-hidden rounded-3xl border border-line bg-surface shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-3 py-2">
        <label className="flex items-center gap-2 pl-1 text-sm text-ink-soft">
          เริ่มจาก
          <select
            defaultValue={questionFiles[0].id}
            onChange={(event) => {
              const file = questionFiles.find((f) => f.id === event.target.value)
              if (file) onChange(file.text)
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
          <button
            type="button"
            onClick={copy}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-ink-soft transition hover:bg-fill hover:text-ink"
          >
            {copied ? (
              <Check className="size-4 text-emerald-700 dark:text-emerald-400" />
            ) : (
              <Copy className="size-4" />
            )}
            {copied ? 'คัดลอกแล้ว' : 'คัดลอก'}
          </button>
          <button
            type="button"
            onClick={download}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-ink-soft transition hover:bg-fill hover:text-ink"
          >
            <Download className="size-4" /> ดาวน์โหลด
          </button>
        </div>
      </div>
      <textarea
        value={source}
        onChange={(event) => onChange(event.target.value)}
        spellCheck={false}
        wrap="off"
        aria-label="JSON ของโจทย์"
        className="min-h-[65vh] w-full resize-y bg-surface p-4 font-mono text-[13px] leading-relaxed text-ink outline-none"
      />
    </section>
  )
}
