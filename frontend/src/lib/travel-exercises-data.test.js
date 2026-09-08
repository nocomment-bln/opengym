import { describe, expect, it } from 'vitest'
import { TRAVEL_EXERCISES } from './travel-exercises-data.js'
import { BODYWEIGHT_MOTIONS } from './bodyweight-motion-data.js'

const VALID_BP = new Set(['back', 'chest', 'lower legs', 'shoulders', 'upper arms', 'upper legs', 'waist'])
const VALID_LEVEL = new Set(['beginner', 'intermediate', 'advanced'])
const BANNED = /\b(stuhl|bett|bank|tisch|hantel|band|ball|matte|gerät|chair|bed|bench|table|dumbbell|barbell)\b/i

describe('travel strength catalogue', () => {
  it('gives all 48 exercises unique motion keys and distinct timelines', () => {
    expect(new Set(TRAVEL_EXERCISES.map(ex => ex.motion)).size).toBe(48)
    const timelines = TRAVEL_EXERCISES.map(ex => JSON.stringify(BODYWEIGHT_MOTIONS[ex.motion].frames))
    expect(new Set(timelines).size).toBe(48)
  })

  it.each(TRAVEL_EXERCISES.map(ex => [ex.motion]))('%s has an authored moving demonstration', key => {
    const def = BODYWEIGHT_MOTIONS[key]
    expect(def.placeholder, key).not.toBe(true)
    expect(new Set(def.frames.map(frame => JSON.stringify(frame.pose))).size, key).toBeGreaterThan(1)
  })

  it('contains the exact stable id range', () => {
    expect(TRAVEL_EXERCISES).toHaveLength(48)
    expect(TRAVEL_EXERCISES.map(e => e.id)).toEqual(
      Array.from({ length: 48 }, (_, i) => `travel-strength-${String(i + 1).padStart(3, '0')}`)
    )
  })

  it('contains complete German bodyweight records without equipment', () => {
    for (const ex of TRAVEL_EXERCISES) {
      expect(ex.eq).toBe('body weight')
      expect(ex.collection).toBe('travel-strength')
      expect(VALID_BP.has(ex.bp)).toBe(true)
      expect(VALID_LEVEL.has(ex.level)).toBe(true)
      expect(ex.n.length).toBeGreaterThan(3)
      expect(ex.desc.length).toBeGreaterThan(12)
      expect(ex.st.length).toBeGreaterThanOrEqual(3)
      expect(ex.st.length).toBeLessThanOrEqual(5)
      expect(ex.st.every(step => /[äöüÄÖÜß]|\b(der|die|das|dein|eine|halte|senke|drücke|führe)\b/i.test(step))).toBe(true)
      expect(BANNED.test([ex.n, ex.desc, ...ex.st].join(' '))).toBe(false)
      expect(BODYWEIGHT_MOTIONS[ex.motion]).toBeTruthy()
    }
  })
})
