import { describe, expect, it } from 'vitest'
import { NetError, foldNet } from './net'
import { CUBE_NETS, netFromRows } from './test-nets'

describe('foldNet', () => {
  it.each(CUBE_NETS.map((rows) => [rows]))('folds every cube net onto six sides: %j', (rows) => {
    const cube = foldNet(netFromRows(rows))
    expect(new Set(cube.faces.map((f) => f.normal.join())).size).toBe(6)
  })

  it.each([
    [['XXXXXX']],
    [['XXX', 'XXX']],
    [['XXXXX', 'X....']],
    [['XXX.', '.XXX']],
    [['XXX.X', 'X...X']],
    [['XXXXX']],
  ])('rejects shapes that are not cube nets: %j', (rows) => {
    expect(() => foldNet(netFromRows(rows))).toThrow(NetError)
  })

  it('places faces where folding by hand puts them', () => {
    //  A . . .
    //  B C D E    C has the most neighbours, so it stays in front and the rest fold back.
    //  . F . .
    const cube = foldNet(netFromRows(['X...', 'XXXX', '.X..']))
    const normalOf = (id: string) => cube.faces.find((f) => f.face.id === id)?.normal

    expect(cube.root.face.id).toBe('C')
    expect(normalOf('C')).toEqual([0, 0, 1])
    expect(normalOf('D')).toEqual([1, 0, 0])
    expect(normalOf('E')).toEqual([0, 0, -1])
    expect(normalOf('B')).toEqual([-1, 0, 0])
    expect(normalOf('F')).toEqual([0, -1, 0])
    expect(normalOf('A')).toEqual([0, 1, 0])
  })
})
