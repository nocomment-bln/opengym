import { TRAVEL_EXERCISES } from './travel-exercises-data.js'

const POSE = {
  head: [120, 32], neck: [120, 52],
  shoulderL: [104, 58], shoulderR: [136, 58],
  elbowL: [94, 92], elbowR: [146, 92],
  wristL: [90, 124], wristR: [150, 124],
  hipL: [108, 122], hipR: [132, 122],
  kneeL: [110, 168], kneeR: [130, 168],
  ankleL: [108, 212], ankleR: [132, 212],
}

export const placeholder = {
  placeholder: true,
  duration: 3,
  poster: 0,
  frames: [{ at: 0, pose: POSE }, { at: 1, pose: POSE }],
}

export const BODYWEIGHT_MOTIONS = Object.fromEntries(
  TRAVEL_EXERCISES.map(exercise => [exercise.motion, placeholder])
)
