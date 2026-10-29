import { Link, createFileRoute } from '@tanstack/react-router'
import { ArrowRight, Box, Grid2x2, MousePointerClick } from 'lucide-react'
import { questions, type BankQuestion } from '#/content/questions'
import { IsoCube } from '#/components/cube/IsoCube'
import { NetDiagram } from '#/components/cube/NetDiagram'
import { DifficultyBadge } from '#/components/quiz/DifficultyBadge'
import { buttonStyles } from '#/components/ui/button-styles'

export const Route = createFileRoute('/')({ component: HomePage })

const STEPS = [
  { icon: Grid2x2, title: 'ดูแผ่นคลี่', text: 'สังเกตว่าแต่ละหน้าต่อกับหน้าไหน และลวดลายหันไปทางใด' },
  { icon: MousePointerClick, title: 'เลือกรูปที่ใช่', text: 'นึกภาพการพับในหัว แล้วเลือกลูกบาศก์ที่ถูกต้อง' },
  { icon: Box, title: 'พับดูใน 3D', text: 'ตรวจคำตอบแล้วหมุนโมเดลเทียบกับทุกตัวเลือกได้ทันที' },
] as const

function HomePage() {
  const [first] = questions

  return (
    <>
      <section className="grid items-center gap-10 py-10 sm:py-16 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <p className="inline-flex rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700 ring-1 ring-indigo-600/10">
            TGAT2 · ความสามารถทางด้านมิติสัมพันธ์
          </p>
          <h1 className="mt-5 text-4xl leading-tight font-bold tracking-tight text-balance sm:text-5xl">
            ฝึกพับกล่องในหัว แล้วดูการพับจริงแบบ 3 มิติ
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-pretty text-stone-600">
            ดูแผ่นคลี่ เลือกลูกบาศก์ที่พับได้ แล้วเปิดโมเดล 3D เพื่อดูว่าแต่ละหน้าไปอยู่ตรงไหน
            เห็นภาพชัด เข้าใจเร็ว และทำข้อสอบจริงได้มั่นใจขึ้น
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/questions/$questionId"
              params={{ questionId: first.id }}
              className={buttonStyles.primary}
            >
              เริ่มทำข้อแรก <ArrowRight className="size-4" />
            </Link>
            <Link to="/" hash="questions" className={buttonStyles.secondary}>
              ดูโจทย์ทั้งหมด
            </Link>
          </div>
        </div>
        <HeroIllustration question={first} />
      </section>

      <section aria-label="วิธีฝึก" className="grid gap-4 sm:grid-cols-3">
        {STEPS.map(({ icon: Icon, title, text }, i) => (
          <div key={title} className="rounded-2xl border border-stone-200 bg-white p-5">
            <div className="flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
                <Icon className="size-5" />
              </span>
              <span className="text-sm font-medium text-stone-400">ขั้นที่ {i + 1}</span>
            </div>
            <h2 className="mt-3 font-semibold">{title}</h2>
            <p className="mt-1 text-sm leading-relaxed text-stone-600">{text}</p>
          </div>
        ))}
      </section>

      <section id="questions" className="scroll-mt-20 pt-14">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-2xl font-bold">โจทย์ทั้งหมด</h2>
          <p className="text-sm text-stone-500">{questions.length} ข้อ</p>
        </div>
        <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {questions.map((question, index) => (
            <li key={question.id}>
              <QuestionCard question={question} number={index + 1} />
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}

function HeroIllustration({ question }: { question: BankQuestion }) {
  return (
    <div className="relative rounded-3xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="grid grid-cols-[1.4fr_auto_1fr] items-center gap-3 sm:gap-6">
        <figure>
          <NetDiagram net={question.net} className="w-full" />
          <figcaption className="mt-3 text-center text-sm text-stone-500">แผ่นคลี่</figcaption>
        </figure>
        <ArrowRight className="size-6 text-indigo-500" aria-hidden="true" />
        <figure>
          <IsoCube view={question.choices[question.answer]} className="w-full" />
          <figcaption className="mt-3 text-center text-sm text-stone-500">พับได้เป็น</figcaption>
        </figure>
      </div>
    </div>
  )
}

function QuestionCard({ question, number }: { question: BankQuestion; number: number }) {
  return (
    <Link
      to="/questions/$questionId"
      params={{ questionId: question.id }}
      className="group flex h-full flex-col rounded-2xl border border-stone-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-stone-300 hover:shadow-md"
    >
      <div className="grid h-40 place-items-center rounded-xl bg-stone-50 p-5">
        <NetDiagram net={question.net} className="max-h-full w-full" />
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-stone-500">
        <span className="font-medium tabular-nums">ข้อ {number}</span>
        <DifficultyBadge difficulty={question.difficulty} />
        {question.ask === 'impossible' && (
          <span className="text-xs text-stone-500">หารูปที่พับไม่ได้</span>
        )}
      </div>
      <h3 className="mt-1.5 font-semibold text-stone-900 group-hover:text-indigo-700">
        {question.title}
      </h3>
    </Link>
  )
}
