import { fourWalls } from './four-walls'
import { quickCut } from './quick-cut'
import { rolling } from './rolling'

/** The three ways of solving cube-net questions, in the order they are offered. */
export const methods = [fourWalls, quickCut, rolling] as const

export type BankMethod = (typeof methods)[number]

export type MethodId = BankMethod['id']
