import { describe, expect, it } from 'vitest'
import { keySplines, keyTimes, motionFor, posterPose, timelineValues, validateMotion } from './bodyweight-motion.js'
import { BODYWEIGHT_MOTIONS } from './bodyweight-motion-data.js'

const def = {
  duration: 3.6,
  poster: 1,
  frames: [
    {
      at: 0,
      pose: {
        head: [100, 30], neck: [100, 48], shoulderL: [84, 56], shoulderR: [116, 56], elbowL: [76, 82], elbowR: [124, 82], wristL: [72, 104], wristR: [128, 104], hipL: [88, 112], hipR: [112, 112], kneeL: [88, 154], kneeR: [112, 154], ankleL: [88, 196], ankleR: [112, 196],
      },
    },
    {
      at: 0.5,
      pose: {
        head: [92, 44], neck: [96, 58], shoulderL: [80, 66], shoulderR: [112, 66], elbowL: [72, 92], elbowR: [120, 92], wristL: [68, 114], wristR: [124, 114], hipL: [84, 122], hipR: [108, 122], kneeL: [84, 164], kneeR: [108, 164], ankleL: [84, 206], ankleR: [108, 206],
      },
    },
    {
      at: 1,
      pose: {
        head: [100, 30], neck: [100, 48], shoulderL: [84, 56], shoulderR: [116, 56], elbowL: [76, 82], elbowR: [124, 82], wristL: [72, 104], wristR: [128, 104], hipL: [88, 112], hipR: [112, 112], kneeL: [88, 154], kneeR: [112, 154], ankleL: [88, 196], ankleR: [112, 196],
      },
    },
  ],
}

describe('bodyweight motion helpers', () => {
  it('validates a closed normalized timeline', () => expect(validateMotion(def)).toEqual([]))
  it('returns the selected poster frame', () => expect(posterPose(def)).toBe(def.frames[1].pose))
  it('serializes SMIL values and key times', () => {
    expect(timelineValues(def, 'head', 0)).toBe('100;92;100')
    expect(timelineValues(def, 'head', 1)).toBe('30;44;30')
    expect(keyTimes(def)).toBe('0;0.5;1')
    expect(keySplines(def)).toBe('0.4 0 0.2 1;0.4 0 0.2 1')
  })
  it('returns null instead of throwing for an unknown key', () => expect(motionFor('missing')).toBeNull())
  it('does not resolve inherited names as motion definitions', () => expect(motionFor('constructor')).toBeNull())
  it('rejects a missing, fractional, or out-of-range poster index', () => {
    expect(validateMotion({ ...def, poster: undefined })).toContain('poster')
    expect(validateMotion({ ...def, poster: 1.5 })).toContain('poster')
    expect(validateMotion({ ...def, poster: 3 })).toContain('poster')
  })
  it('returns errors instead of throwing for non-object frames', () => {
    const malformed = { ...def, frames: [null, def.frames[1], def.frames[2]] }
    expect(() => validateMotion(malformed)).not.toThrow()
    expect(validateMotion(malformed)).toContain('frame')
  })

  it('uses real closed timelines for the three pilot motions', () => {
    expect(BODYWEIGHT_MOTIONS.squat).toMatchObject({ duration: 3.6, poster: 1 })
    expect(BODYWEIGHT_MOTIONS['standard-push-up']).toMatchObject({ duration: 3.2, poster: 1 })
    expect(BODYWEIGHT_MOTIONS['single-leg-hip-hinge']).toMatchObject({ duration: 4, poster: 1 })
    for (const key of ['squat', 'standard-push-up', 'single-leg-hip-hinge']) {
      expect(BODYWEIGHT_MOTIONS[key].placeholder).not.toBe(true)
      expect(BODYWEIGHT_MOTIONS[key].frames).toHaveLength(3)
    }
  })

  it('keeps pilot body anchors clear of the fixed renderer edge', () => {
    for (const key of ['squat', 'standard-push-up', 'single-leg-hip-hinge']) {
      for (const frame of BODYWEIGHT_MOTIONS[key].frames) {
        for (const [joint, point] of Object.entries(frame.pose)) {
          expect(point[0], `${key}:${joint}`).toBeLessThanOrEqual(232)
        }
      }
    }
  })

  it('keeps the other 45 catalogue motions as marked neutral placeholders', () => {
    const pilots = new Set(['squat', 'standard-push-up', 'single-leg-hip-hinge'])
    const placeholders = Object.entries(BODYWEIGHT_MOTIONS).filter(([key]) => !pilots.has(key))
    expect(placeholders).toHaveLength(45)
    expect(placeholders.every(([, motion]) => motion.placeholder === true)).toBe(true)
  })

  it('validates every exported motion definition', () => {
    for (const [key, motion] of Object.entries(BODYWEIGHT_MOTIONS)) {
      expect(validateMotion(motion), key).toEqual([])
    }
  })
})
