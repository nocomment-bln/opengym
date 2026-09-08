import { TRAVEL_EXERCISES } from './travel-exercises-data.js'

const CENTER_X = 120

const freezePose = points => Object.freeze(Object.fromEntries(
  Object.entries(points).map(([joint, point]) => [joint, Object.freeze([...point])])
))

const pose = (base, overrides = {}) => freezePose({ ...base, ...overrides })

const mirror = source => freezePose(Object.fromEntries(Object.entries(source).map(([joint, point]) => {
  const mirroredJoint = joint.endsWith('L') ? `${joint.slice(0, -1)}R` : joint.endsWith('R') ? `${joint.slice(0, -1)}L` : joint
  return [mirroredJoint, [CENTER_X * 2 - point[0], point[1]]]
})))

const motion = ({ duration, poster, frames, placeholder = false }) => Object.freeze({
  ...(placeholder ? { placeholder: true } : {}),
  duration,
  poster,
  frames: Object.freeze(frames.map(frame => Object.freeze({ at: frame.at, pose: frame.pose }))),
})

const STAND = freezePose({
  head: [120, 32], neck: [120, 52],
  shoulderL: [104, 58], shoulderR: [136, 58],
  elbowL: [94, 92], elbowR: [146, 92],
  wristL: [90, 124], wristR: [150, 124],
  hipL: [108, 122], hipR: [132, 122],
  kneeL: [110, 168], kneeR: [130, 168],
  ankleL: [108, 212], ankleR: [132, 212],
})

const SQUAT_BOTTOM = pose(STAND, {
  head: [120, 50], neck: [120, 70],
  shoulderL: [102, 78], shoulderR: [138, 78],
  elbowL: [86, 108], elbowR: [154, 108],
  wristL: [82, 136], wristR: [158, 136],
  hipL: [104, 138], hipR: [136, 138],
  kneeL: [90, 174], kneeR: [150, 174],
  ankleL: [94, 212], ankleR: [146, 212],
})

const PLANK_TOP = freezePose({
  head: [70, 102], neck: [86, 110],
  shoulderL: [102, 118], shoulderR: [108, 124],
  elbowL: [108, 150], elbowR: [120, 154],
  wristL: [102, 184], wristR: [118, 184],
  hipL: [166, 142], hipR: [174, 148],
  kneeL: [208, 158], kneeR: [216, 164],
  ankleL: [218, 172], ankleR: [226, 178],
})

const PUSH_UP_BOTTOM = freezePose({
  head: [74, 128], neck: [90, 136],
  shoulderL: [106, 144], shoulderR: [112, 150],
  elbowL: [132, 162], elbowR: [140, 168],
  wristL: [102, 184], wristR: [118, 184],
  hipL: [166, 166], hipR: [174, 172],
  kneeL: [208, 182], kneeR: [216, 188],
  ankleL: [218, 196], ankleR: [226, 202],
})

const SINGLE_LEG_STAND = mirror(pose(STAND, {
  kneeL: [102, 178], ankleL: [90, 202],
}))

const HINGE_BOTTOM = pose(SINGLE_LEG_STAND, {
  head: [76, 96], neck: [90, 106],
  shoulderL: [100, 112], shoulderR: [108, 120],
  elbowL: [82, 134], elbowR: [94, 142],
  wristL: [68, 152], wristR: [82, 160],
  hipL: [118, 142], hipR: [130, 150],
  kneeL: [112, 178], ankleL: [108, 212],
  kneeR: [174, 162], ankleR: [218, 178],
})

export const placeholder = motion({
  placeholder: true,
  duration: 3,
  poster: 0,
  frames: [{ at: 0, pose: STAND }, { at: 1, pose: STAND }],
})

const PILOT_MOTIONS = {
  squat: motion({
    duration: 3.6,
    poster: 1,
    frames: [{ at: 0, pose: STAND }, { at: 0.5, pose: SQUAT_BOTTOM }, { at: 1, pose: STAND }],
  }),
  'standard-push-up': motion({
    duration: 3.2,
    poster: 1,
    frames: [{ at: 0, pose: PLANK_TOP }, { at: 0.5, pose: PUSH_UP_BOTTOM }, { at: 1, pose: PLANK_TOP }],
  }),
  'single-leg-hip-hinge': motion({
    duration: 4,
    poster: 1,
    frames: [{ at: 0, pose: SINGLE_LEG_STAND }, { at: 0.5, pose: HINGE_BOTTOM }, { at: 1, pose: SINGLE_LEG_STAND }],
  }),
}

export const BODYWEIGHT_MOTIONS = Object.freeze(Object.fromEntries(
  TRAVEL_EXERCISES.map(({ motion: key }) => [key, PILOT_MOTIONS[key] || placeholder])
))
