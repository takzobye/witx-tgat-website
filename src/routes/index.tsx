import { createFileRoute } from '@tanstack/react-router'
import { useProgress } from '#/progress/use-progress'
import { DashboardHero } from '#/components/dashboard/DashboardHero'
import { DifficultyProgress } from '#/components/dashboard/DifficultyProgress'
import { GuidedPracticeCard } from '#/components/dashboard/GuidedPracticeCard'
import { NextQuestionCard } from '#/components/dashboard/NextQuestionCard'
import { QuestionShelf } from '#/components/dashboard/QuestionShelf'
import { RecentAnswers } from '#/components/dashboard/RecentAnswers'
import { WeeklyActivity } from '#/components/dashboard/WeeklyActivity'
import { Widget } from '#/components/dashboard/Widget'

export const Route = createFileRoute('/')({ component: DashboardPage })

function DashboardPage() {
  const progress = useProgress()

  return (
    <div className="flex flex-col gap-10 pt-8 sm:pt-12">
      <DashboardHero progress={progress} />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <Widget title="แนะนำสำหรับคุณ">
          <div className="grid flex-1 gap-2 sm:grid-cols-2">
            <NextQuestionCard progress={progress} />
            <GuidedPracticeCard />
          </div>
        </Widget>
        <DifficultyProgress progress={progress} />
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-[1fr_1fr_1.4fr]">
        <WeeklyActivity progress={progress} />
        <QuestionShelf progress={progress} />
        <RecentAnswers progress={progress} className="md:col-span-2 xl:col-span-1" />
      </div>
    </div>
  )
}
