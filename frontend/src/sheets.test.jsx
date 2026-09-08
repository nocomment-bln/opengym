import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.hoisted(() => {
  vi.stubGlobal('document', {
    addEventListener: () => {},
    removeEventListener: () => {},
    visibilityState: 'visible',
  })
})
import { EXDB } from './lib/exercises.js'
import { setLang } from './lib/i18n.js'
import { useUI } from './store/useUI.js'
import { exerciseDetailSheet } from './sheets.jsx'

const renderExerciseDetail = exercise => {
  exerciseDetailSheet(exercise)
  const sheet = useUI.getState().sheets.at(-1)
  return renderToStaticMarkup(sheet.render(() => {}))
}

describe('exercise detail instruction language', () => {
  afterEach(async () => {
    useUI.setState({ sheets: [] })
    await setLang('en')
  })

  it('labels travel-strength instructions as German in the German UI', async () => {
    await setLang('de')
    const exercise = EXDB.find(item => item.collection === 'travel-strength')

    expect(renderExerciseDetail(exercise)).toContain('Anleitung auf Deutsch')
  })

  it('keeps the English instruction label for legacy exercises in the German UI', async () => {
    await setLang('de')
    const exercise = EXDB.find(item => item.collection !== 'travel-strength' && item.st?.length)

    expect(renderExerciseDetail(exercise)).toContain('Anleitung auf Englisch')
  })
})
