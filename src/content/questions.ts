import { z } from 'zod'
import { questionSchema, type Question } from '#/cube/question'

export type BankQuestion = Question & {
  id: string
  /** Position in the bank, counting from 1 — shown as "ข้อ 3". */
  number: number
}

const files = import.meta.glob<unknown>('./questions/*.json', { eager: true, import: 'default' })

/** Raw question files; the id is the file name without `.json`, and file names set the order. */
const questionSources: readonly { id: string; json: unknown }[] = Object.entries(files)
  .map(([path, json]) => ({ id: path.replace(/^.*\/|\.json$/g, ''), json }))
  .sort((a, b) => a.id.localeCompare(b.id))

export const questions: readonly BankQuestion[] = questionSources.map(({ id, json }, index) => {
  const result = questionSchema.safeParse(json)
  if (!result.success) {
    throw new Error(`Invalid question file ${id}.json\n${z.prettifyError(result.error)}`)
  }
  return { id, number: index + 1, ...result.data }
})
