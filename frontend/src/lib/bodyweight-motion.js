import { BODYWEIGHT_MOTIONS } from './bodyweight-motion-data.js'

export const JOINTS = ['head', 'neck', 'shoulderL', 'shoulderR', 'elbowL', 'elbowR', 'wristL', 'wristR', 'hipL', 'hipR', 'kneeL', 'kneeR', 'ankleL', 'ankleR']

export const BONES = [
  ['neck', 'shoulderL', 'arm'], ['shoulderL', 'elbowL', 'arm'], ['elbowL', 'wristL', 'arm'],
  ['neck', 'shoulderR', 'arm'], ['shoulderR', 'elbowR', 'arm'], ['elbowR', 'wristR', 'arm'],
  ['hipL', 'kneeL', 'leg'], ['kneeL', 'ankleL', 'leg'],
  ['hipR', 'kneeR', 'leg'], ['kneeR', 'ankleR', 'leg'],
]

export const motionFor = id => Object.hasOwn(BODYWEIGHT_MOTIONS, id) ? BODYWEIGHT_MOTIONS[id] : null
export const keyTimes = def => def.frames.map(frame => frame.at).join(';')
export const keySplines = def => def.frames.slice(1).map(() => '0.4 0 0.2 1').join(';')
export const timelineValues = (def, joint, axis) => def.frames.map(frame => frame.pose[joint][axis]).join(';')
export const posterPose = def => def.frames[Math.max(0, Math.min(def.poster, def.frames.length - 1))].pose

export function validateMotion(def) {
  const errors = []
  if (!def || typeof def !== 'object') return ['definition']
  if (!(def.duration >= 2 && def.duration <= 6)) errors.push('duration')
  if (!Array.isArray(def.frames) || def.frames.length < 2) return [...errors, 'frames']
  if (!Number.isInteger(def.poster) || def.poster < 0 || def.poster >= def.frames.length) errors.push('poster')
  if (def.frames.some(frame => !frame || typeof frame !== 'object' || !Number.isFinite(frame.at))) return [...errors, 'frame']
  if (def.frames[0].at !== 0 || def.frames.at(-1).at !== 1) errors.push('range')
  if (def.frames.some((frame, i) => i && frame.at <= def.frames[i - 1].at)) errors.push('order')
  for (const frame of def.frames) {
    for (const joint of JOINTS) {
      const point = frame.pose?.[joint]
      if (!Array.isArray(point) || point.length !== 2 || point.some(n => !Number.isFinite(n))) errors.push(`joint:${joint}`)
    }
  }
  if (!JOINTS.every(joint => {
    const first = def.frames[0].pose?.[joint]
    const last = def.frames.at(-1).pose?.[joint]
    return Array.isArray(first) && Array.isArray(last) && first[0] === last[0] && first[1] === last[1]
  })) errors.push('loop')
  return [...new Set(errors)]
}
