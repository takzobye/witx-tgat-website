import { CHOICE_LABELS, type AnswerCheck, type QuestionDraft } from '#/cube/question'
import { ChoiceCard } from '#/components/quiz/ChoiceCard'
import { QuestionFigure } from '#/components/quiz/QuestionFigure'
import { useFigureState } from '#/components/quiz/use-figure-state'

interface DraftPreviewProps {
  draft: QuestionDraft
  answer: AnswerCheck
}

/** The draft as the learner will see it, with each choice marked foldable or not. */
export function DraftPreview({ draft, answer }: DraftPreviewProps) {
  const figure = useFigureState()

  return (
    <>
      <QuestionFigure
        net={draft.net}
        cube={draft.cube}
        choices={draft.choices}
        figure={figure}
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
            pressed={figure.comparedIndex === index}
            onClick={() => figure.compare(index)}
            footer={
              draft.foldable[index] ? (
                <span className="text-emerald-700 dark:text-emerald-400">พับได้</span>
              ) : (
                <span className="text-rose-700 dark:text-rose-400">พับไม่ได้</span>
              )
            }
          />
        ))}
      </div>
    </>
  )
}
