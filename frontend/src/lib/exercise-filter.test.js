import { describe, expect, it } from 'vitest'
import { equipmentForFilters, filterExercises } from './exercise-filter.js'

const list = [
  { id: 'a', n: 'Kniebeuge', bp: 'upper legs', eq: 'body weight', tg: 'quads', desc: '', collection: 'travel-strength', level: 'beginner' },
  { id: 'b', n: 'Beinpresse', bp: 'upper legs', eq: 'leverage machine', tg: 'quads', desc: '' },
  { id: 'c', n: 'Liegestütz', bp: 'chest', eq: 'body weight', tg: 'pectorals', desc: '', collection: 'travel-strength', level: 'intermediate' },
]

describe('exercise filters', () => {
  it('combines collection, body part, equipment, and query', () => {
    expect(filterExercises(list, { collection: 'travel-strength', bp: 'upper legs', eq: 'body weight', q: 'knie' }).map(e => e.id)).toEqual(['a'])
  })

  it('includes level in search', () => {
    expect(filterExercises(list, { q: 'intermediate' }).map(e => e.id)).toEqual(['c'])
  })

  it('derives equipment before applying a stale equipment choice', () => {
    expect(equipmentForFilters(list, { collection: 'travel-strength', bp: 'chest', q: '' })).toEqual(['body weight'])
  })
})
