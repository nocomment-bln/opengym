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
  it('returns errors instead of throwing for sparse frame arrays', () => {
    const frames = [...def.frames]
    delete frames[0]
    const malformed = { ...def, frames }
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

  it('keeps both feet planted throughout squat repetitions', () => {
    for (const key of ['squat', 'pause-squat', 'narrow-squat', 'sumo-squat', 'wall-squat']) {
      const { frames } = BODYWEIGHT_MOTIONS[key]
      for (const joint of ['ankleL', 'ankleR']) {
        expect(new Set(frames.map(frame => frame.pose[joint].join(','))).size, `${key}:${joint}`).toBe(1)
      }
    }
  })

  it('keeps hand and toe support planted while push-up shoulders descend', () => {
    for (const key of ['standard-push-up', 'wide-push-up', 'close-push-up', 'diamond-push-up']) {
      const { frames } = BODYWEIGHT_MOTIONS[key]
      for (const joint of ['wristL', 'wristR', 'ankleL', 'ankleR']) {
        expect(new Set(frames.map(frame => frame.pose[joint].join(','))).size, `${key}:${joint}`).toBe(1)
        expect(frames[0].pose[joint][1], `${key}:${joint} ground`).toBeGreaterThanOrEqual(210)
      }
      expect(frames[1].pose.shoulderL[1], key).toBeGreaterThan(frames[0].pose.shoulderL[1])
    }
  })

  it('shows a real pause at squat depth and successively narrower push-up hands', () => {
    const pause = BODYWEIGHT_MOTIONS['pause-squat']
    expect(pause.frames.length).toBeGreaterThanOrEqual(4)
    expect(pause.frames[1].pose.hipL[1]).toBe(pause.frames[2].pose.hipL[1])
    expect(pause.frames[2].at - pause.frames[1].at).toBeGreaterThanOrEqual(0.2)
    const widths = ['wide-push-up', 'standard-push-up', 'close-push-up', 'diamond-push-up'].map(key => {
      const p = posterPose(BODYWEIGHT_MOTIONS[key])
      return Math.hypot(p.wristR[0] - p.wristL[0], p.wristR[1] - p.wristL[1])
    })
    for (let i = 1; i < widths.length; i++) expect(widths[i]).toBeLessThan(widths[i - 1])
  })

  it('provides walls for all wall-supported movements', () => {
    expect(BODYWEIGHT_MOTIONS['wall-squat'].wall).toBe('left')
    for (const key of ['wall-push-up', 'wall-handstand', 'wall-walk', 'wall-angel']) {
      expect(['left', 'right']).toContain(BODYWEIGHT_MOTIONS[key].wall)
    }
  })

  it('keeps isometric support and pelvis still during small tension pulses', () => {
    for (const key of ['wall-handstand', 'forearm-plank', 'side-plank', 'hollow-body-hold']) {
      const { frames } = BODYWEIGHT_MOTIONS[key]
      expect(new Set(frames.map(frame => frame.pose.neck.join(','))).size, key).toBeGreaterThan(1)
      for (const joint of ['hipL', 'hipR', 'ankleL', 'ankleR']) {
        expect(new Set(frames.map(frame => frame.pose[joint].join(','))).size, `${key}:${joint}`).toBe(1)
      }
    }
  })

  it('returns to a stable base between alternating limb reaches', () => {
    for (const key of ['reverse-lunge', 'quadruped-hip-extension', 'quadruped-lateral-leg-raise', 'slow-mountain-climber', 'dead-bug', 'bird-dog', 'bear-plank-shoulder-tap']) {
      const { frames } = BODYWEIGHT_MOTIONS[key]
      expect(frames.length, key).toBeGreaterThanOrEqual(5)
      for (const joint of ['hipL', 'wristL', 'ankleR']) {
        expect(frames[2].pose[joint].join(','), `${key}:${joint}`).toBe(frames[0].pose[joint].join(','))
      }
      const activeJoint = key === 'bear-plank-shoulder-tap' ? 'wrist' : 'knee'
      for (const side of ['L', 'R']) {
        expect(new Set(frames.map(frame => frame.pose[`${activeJoint}${side}`].join(','))).size, `${key}:${side}`).toBeGreaterThan(1)
      }
    }
  })

  it('keeps every pose inside the visible canvas including head radius', () => {
    for (const [key, def] of Object.entries(BODYWEIGHT_MOTIONS)) {
      for (const { pose } of def.frames) {
        for (const [joint, [x, y]] of Object.entries(pose)) {
          expect(x, `${key}:${joint}`).toBeGreaterThanOrEqual(joint === 'head' ? 16 : 8)
          expect(x, `${key}:${joint}`).toBeLessThanOrEqual(joint === 'head' ? 224 : 232)
          expect(y, `${key}:${joint}`).toBeGreaterThanOrEqual(joint === 'head' ? 16 : 8)
          expect(y, `${key}:${joint}`).toBeLessThanOrEqual(joint === 'head' ? 204 : 220)
        }
      }
    }
  })

  it('validates every exported motion definition', () => {
    for (const [key, motion] of Object.entries(BODYWEIGHT_MOTIONS)) {
      expect(validateMotion(motion), key).toEqual([])
    }
  })
})
