const CENTER_X = 120

const freezePose = points => Object.freeze(Object.fromEntries(
  Object.entries(points).map(([joint, point]) => [joint, Object.freeze([...point])])
))

const pose = (base, overrides = {}) => freezePose({ ...base, ...overrides })

const mirror = source => freezePose(Object.fromEntries(Object.entries(source).map(([joint, point]) => {
  const mirroredJoint = joint.endsWith('L') ? `${joint.slice(0, -1)}R` : joint.endsWith('R') ? `${joint.slice(0, -1)}L` : joint
  return [mirroredJoint, [CENTER_X * 2 - point[0], point[1]]]
})))

const motion = ({ duration, poster, frames, wall }) => Object.freeze({
  ...(wall ? { wall } : {}),
  duration,
  poster,
  frames: Object.freeze(frames.map(frame => Object.freeze({ at: frame.at, pose: frame.pose }))),
})

// Explicit pose sequences share only their timing/closure machinery. Holds repeat
// a pose; alternating exercises always return to their stable base between sides.
const sequence = (poses, duration = 4, poster = 1, wall, times) => motion({
  duration, poster, wall,
  frames: poses.map((pose, index) => ({ at: times?.[index] ?? index / (poses.length - 1), pose })),
})
const rep = (start, end, duration = 4, wall) => sequence([start, end, start], duration, 1, wall)
const alternating = (base, left, right, duration = 6) => sequence([base, left, base, right, base], duration)

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
  ankleL: [108, 212], ankleR: [132, 212],
})

const PLANK_TOP = freezePose({
  head: [48, 130], neck: [62, 140],
  shoulderL: [72, 146], shoulderR: [80, 152],
  elbowL: [69, 179], elbowR: [81, 185],
  wristL: [66, 212], wristR: [82, 218],
  hipL: [132, 174], hipR: [140, 180],
  kneeL: [173, 193], kneeR: [181, 199],
  ankleL: [214, 212], ankleR: [222, 218],
})

const PUSH_UP_BOTTOM = freezePose({
  head: [44, 176], neck: [58, 182],
  shoulderL: [68, 184], shoulderR: [76, 190],
  elbowL: [99, 197], elbowR: [111, 203],
  wristL: [66, 212], wristR: [82, 218],
  hipL: [130, 196], hipR: [138, 202],
  kneeL: [172, 204], kneeR: [180, 210],
  ankleL: [214, 212], ankleR: [222, 218],
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

// 001–018: front projection for knee tracking, side projection for hinges and
// bridges. Ground contacts remain fixed except deliberate steps/heel raises.
const WALL_SQUAT_TOP = freezePose({
  head: [38, 40], neck: [36, 62], shoulderL: [28, 70], shoulderR: [44, 74],
  elbowL: [44, 104], elbowR: [58, 108], wristL: [66, 130], wristR: [78, 134],
  hipL: [30, 134], hipR: [46, 138], kneeL: [70, 170], kneeR: [86, 174],
  ankleL: [94, 212], ankleR: [110, 218],
})
const WALL_SQUAT_LOW = pose(WALL_SQUAT_TOP, {
  head: [38, 65], neck: [36, 87], shoulderL: [28, 95], shoulderR: [44, 99],
  elbowL: [56, 121], elbowR: [70, 125], wristL: [84, 142], wristR: [98, 146],
  hipL: [30, 158], hipR: [46, 162], kneeL: [94, 160], kneeR: [110, 166],
})
const NARROW_STAND = pose(STAND, { kneeL: [116, 168], kneeR: [124, 168], ankleL: [116, 212], ankleR: [124, 212] })
const NARROW_LOW = pose(SQUAT_BOTTOM, {
  hipL: [108, 132], hipR: [132, 132], kneeL: [112, 174], kneeR: [128, 174],
  ankleL: [116, 212], ankleR: [124, 212],
})
const WIDE_STAND = pose(STAND, { kneeL: [84, 170], kneeR: [156, 170], ankleL: [60, 212], ankleR: [180, 212] })
const SUMO_LOW = pose(SQUAT_BOTTOM, { hipL: [100, 148], hipR: [140, 148], kneeL: [60, 176], kneeR: [180, 176], ankleL: [60, 212], ankleR: [180, 212] })
const LUNGE_LEFT = pose(STAND, {
  head: [116, 58], neck: [116, 78], shoulderL: [100, 84], shoulderR: [132, 84],
  elbowL: [88, 112], elbowR: [144, 112], wristL: [102, 136], wristR: [130, 136],
  hipL: [104, 148], hipR: [128, 148], kneeL: [104, 178], kneeR: [166, 192],
  ankleL: [108, 212], ankleR: [192, 212],
})
const SPLIT_TOP = pose(LUNGE_LEFT, {
  head: [116, 32], neck: [116, 52], shoulderL: [100, 58], shoulderR: [132, 58],
  elbowL: [88, 86], elbowR: [144, 86], wristL: [102, 110], wristR: [130, 110],
  hipL: [104, 122], hipR: [128, 122], kneeL: [104, 168], kneeR: [160, 168],
})
const LATERAL_LEFT = pose(WIDE_STAND, {
  head: [86, 60], neck: [86, 80], shoulderL: [70, 86], shoulderR: [102, 86],
  elbowL: [64, 116], elbowR: [116, 116], wristL: [80, 136], wristR: [102, 136],
  hipL: [72, 148], hipR: [96, 148], kneeL: [60, 178], kneeR: [138, 180],
})
const COSSACK_LEFT = pose(LATERAL_LEFT, {
  head: [76, 82], neck: [76, 102], shoulderL: [60, 108], shoulderR: [92, 108],
  elbowL: [68, 132], elbowR: [112, 132], wristL: [90, 148], wristR: [122, 148],
  hipL: [62, 172], hipR: [86, 172], kneeL: [44, 188], kneeR: [133, 192],
})
const CALF_TOP = freezePose(Object.fromEntries(Object.entries(STAND).map(([joint, [x, y]]) => [joint, [x, y - 7]])))
const HINGE_STAND = pose(STAND, { head: [104, 32], neck: [112, 52], shoulderL: [110, 60], shoulderR: [126, 64], hipL: [118, 124], hipR: [132, 128], kneeL: [114, 168], kneeR: [130, 172], ankleL: [108, 212], ankleR: [124, 218] })
const HINGE_LOW = pose(HINGE_STAND, {
  head: [64, 100], neck: [80, 110], shoulderL: [94, 116], shoulderR: [106, 124],
  elbowL: [90, 148], elbowR: [106, 156], wristL: [86, 178], wristR: [106, 186],
  hipL: [144, 144], hipR: [156, 152], kneeL: [116, 174], kneeR: [132, 180],
})
const BRIDGE_LOW = freezePose({
  head: [38, 198], neck: [58, 206], shoulderL: [70, 206], shoulderR: [78, 212],
  elbowL: [102, 210], elbowR: [110, 216], wristL: [132, 212], wristR: [140, 218],
  hipL: [132, 202], hipR: [140, 208], kneeL: [160, 166], kneeR: [174, 172],
  ankleL: [190, 212], ankleR: [204, 218],
})
const BRIDGE_HIGH = pose(BRIDGE_LOW, { hipL: [124, 172], hipR: [132, 178], kneeL: [164, 150], kneeR: [178, 156] })
const SINGLE_BRIDGE_LOW = pose(BRIDGE_LOW, { kneeR: [170, 170], ankleR: [198, 140] })
const SINGLE_BRIDGE_HIGH = pose(BRIDGE_HIGH, { kneeR: [162, 142], ankleR: [190, 112] })
const FROG_LOW = pose(BRIDGE_LOW, { kneeL: [150, 162], kneeR: [188, 192], ankleL: [196, 214], ankleR: [196, 218] })
const FROG_HIGH = pose(BRIDGE_HIGH, { kneeL: [150, 140], kneeR: [192, 178], ankleL: [196, 214], ankleR: [196, 218] })
const WALKOUT_STEP = pose(BRIDGE_HIGH, { kneeL: [170, 184], ankleL: [220, 212] })
const WALKOUT_LONG = pose(WALKOUT_STEP, { kneeR: [180, 190], ankleR: [228, 218] })
const QUADRUPED = freezePose({
  head: [40, 124], neck: [58, 136], shoulderL: [72, 142], shoulderR: [82, 148],
  elbowL: [70, 177], elbowR: [84, 183], wristL: [68, 212], wristR: [86, 218],
  hipL: [138, 146], hipR: [150, 152], kneeL: [136, 206], kneeR: [150, 212],
  ankleL: [184, 212], ankleR: [198, 218],
})
const HIP_EXTENSION_L = pose(QUADRUPED, { kneeL: [176, 146], ankleL: [218, 146] })
const HIP_EXTENSION_R = pose(QUADRUPED, { kneeR: [188, 152], ankleR: [230, 152] })
const LATERAL_LEG_L = pose(QUADRUPED, { kneeL: [172, 114], ankleL: [208, 150] })
const LATERAL_LEG_R = pose(QUADRUPED, { kneeR: [186, 178], ankleR: [218, 210] })

const LOWER_MOTIONS = {
  'wall-squat': rep(WALL_SQUAT_TOP, WALL_SQUAT_LOW, 4, 'left'),
  'pause-squat': sequence([STAND, SQUAT_BOTTOM, SQUAT_BOTTOM, STAND], 5, 1, undefined, [0, 0.3, 0.6, 1]),
  'narrow-squat': rep(NARROW_STAND, NARROW_LOW, 3.8),
  'sumo-squat': rep(WIDE_STAND, SUMO_LOW),
  'reverse-lunge': alternating(STAND, LUNGE_LEFT, mirror(LUNGE_LEFT)),
  'split-squat': rep(SPLIT_TOP, LUNGE_LEFT),
  'lateral-lunge': alternating(WIDE_STAND, LATERAL_LEFT, mirror(LATERAL_LEFT)),
  'cossack-squat': alternating(WIDE_STAND, COSSACK_LEFT, mirror(COSSACK_LEFT)),
  'squat-calf-raise': sequence([STAND, SQUAT_BOTTOM, STAND, CALF_TOP, STAND], 5, 3),
  'hip-hinge': rep(HINGE_STAND, HINGE_LOW),
  'glute-bridge': rep(BRIDGE_LOW, BRIDGE_HIGH),
  'single-leg-glute-bridge': rep(SINGLE_BRIDGE_LOW, SINGLE_BRIDGE_HIGH),
  'frog-pump': rep(FROG_LOW, FROG_HIGH, 3.6),
  'hamstring-walkout': sequence([BRIDGE_HIGH, WALKOUT_STEP, WALKOUT_LONG, WALKOUT_STEP, BRIDGE_HIGH], 6, 2),
  'quadruped-hip-extension': alternating(QUADRUPED, HIP_EXTENSION_L, HIP_EXTENSION_R),
  'quadruped-lateral-leg-raise': alternating(QUADRUPED, LATERAL_LEG_L, LATERAL_LEG_R),
}

// 019–032: oblique side views keep the hands/toes visible. Hand spacing is
// projected consistently for the four bilateral push-up variants.
const WALL_PUSH_TOP = freezePose({
  head: [146, 72], neck: [150, 90], shoulderL: [150, 98], shoulderR: [160, 104],
  elbowL: [186, 97], elbowR: [191, 105], wristL: [222, 96], wristR: [222, 106],
  hipL: [126, 150], hipR: [136, 156], kneeL: [112, 181], kneeR: [122, 187],
  ankleL: [98, 212], ankleR: [108, 218],
})
const WALL_PUSH_LOW = pose(WALL_PUSH_TOP, {
  head: [180, 82], neck: [184, 102], shoulderL: [184, 110], shoulderR: [194, 116],
  elbowL: [196, 140], elbowR: [207, 148], hipL: [144, 158], hipR: [154, 164],
  kneeL: [121, 185], kneeR: [131, 191],
})
const KNEE_PUSH_TOP = pose(PLANK_TOP, {
  hipL: [124, 181], hipR: [132, 187], kneeL: [170, 212], kneeR: [182, 218],
  ankleL: [210, 185], ankleR: [222, 191],
})
const KNEE_PUSH_LOW = pose(PUSH_UP_BOTTOM, {
  hipL: [122, 199], hipR: [130, 205], kneeL: [170, 212], kneeR: [182, 218],
  ankleL: [210, 185], ankleR: [222, 191],
})
const WIDE_HANDS = { wristL: [48, 212], wristR: [100, 218] }
const CLOSE_HANDS = { wristL: [72, 212], wristR: [80, 218] }
const DIAMOND_HANDS = { wristL: [77, 214], wristR: [81, 216] }
const OFFSET_HANDS = { wristL: [46, 212], wristR: [96, 218] }
const ARCHER_TOP = freezePose({
  head: [120, 104], neck: [120, 125], shoulderL: [100, 134], shoulderR: [140, 134],
  elbowL: [70, 173], elbowR: [170, 173], wristL: [40, 212], wristR: [200, 212],
  hipL: [106, 177], hipR: [134, 177], kneeL: [100, 195], kneeR: [140, 195],
  ankleL: [94, 218], ankleR: [146, 218],
})
const ARCHER_LEFT = pose(ARCHER_TOP, {
  head: [86, 148], neck: [86, 168], shoulderL: [66, 174], shoulderR: [106, 174],
  elbowL: [42, 179], elbowR: [153, 193], hipL: [90, 195], hipR: [118, 195],
  kneeL: [92, 206], kneeR: [132, 206],
})
const PIKE_TOP = pose(PLANK_TOP, {
  head: [76, 158], neck: [88, 140], shoulderL: [86, 128], shoulderR: [100, 134],
  elbowL: [76, 170], elbowR: [91, 176], hipL: [142, 74], hipR: [154, 80],
  kneeL: [178, 143], kneeR: [190, 149],
})
const PIKE_LOW = pose(PIKE_TOP, {
  head: [54, 186], neck: [68, 166], shoulderL: [76, 154], shoulderR: [90, 160],
  elbowL: [108, 178], elbowR: [120, 184], hipL: [132, 96], hipR: [144, 102],
  kneeL: [173, 154], kneeR: [187, 160],
})
const FOREARM_PLANK = pose(PLANK_TOP, {
  head: [48, 146], neck: [62, 156], shoulderL: [72, 162], shoulderR: [84, 168],
  elbowL: [72, 212], elbowR: [84, 218], wristL: [36, 212], wristR: [48, 218],
  hipL: [132, 183], hipR: [144, 189], kneeL: [173, 198], kneeR: [183, 204],
})
const DOLPHIN_HIGH = pose(FOREARM_PLANK, {
  head: [84, 171], neck: [96, 153], shoulderL: [100, 140], shoulderR: [112, 146],
  hipL: [146, 92], hipR: [158, 98], kneeL: [180, 152], kneeR: [190, 158],
})
const SCAPULAR_RETRACT = pose(PLANK_TOP, {
  head: [49, 133], neck: [63, 143], shoulderL: [73, 149], shoulderR: [81, 155],
  elbowL: [69.5, 180.5], elbowR: [81.5, 186.5],
})
const HANDSTAND = freezePose({
  head: [178, 177], neck: [188, 159], shoulderL: [184, 148], shoulderR: [198, 154],
  elbowL: [183, 180], elbowR: [198, 186], wristL: [182, 212], wristR: [198, 218],
  hipL: [202, 94], hipR: [212, 100], kneeL: [214, 60], kneeR: [220, 66],
  ankleL: [222, 26], ankleR: [222, 34],
})
const HANDSTAND_TENSION = pose(HANDSTAND, { neck: [188, 158], head: [178, 176] })
const WALL_WALK_START = pose(PLANK_TOP, { ankleL: [222, 212], ankleR: [222, 218] })
const WALL_WALK_MID = freezePose({
  head: [132, 180], neck: [144, 164], shoulderL: [146, 148], shoulderR: [158, 154],
  elbowL: [136, 180], elbowR: [150, 186], wristL: [126, 212], wristR: [142, 218],
  hipL: [182, 112], hipR: [194, 118], kneeL: [202, 109], kneeR: [208, 115],
  ankleL: [222, 106], ankleR: [222, 112],
})
const WALL_ANGEL_LOW = freezePose({
  head: [38, 54], neck: [38, 76], shoulderL: [30, 84], shoulderR: [54, 84],
  elbowL: [22, 112], elbowR: [90, 102], wristL: [24, 78], wristR: [92, 66],
  hipL: [30, 144], hipR: [50, 144], kneeL: [42, 178], kneeR: [66, 178],
  ankleL: [52, 212], ankleR: [76, 212],
})
const WALL_ANGEL_HIGH = pose(WALL_ANGEL_LOW, { elbowL: [24, 54], elbowR: [78, 56], wristL: [24, 22], wristR: [66, 24] })

const PUSH_MOTIONS = {
  'wall-push-up': rep(WALL_PUSH_TOP, WALL_PUSH_LOW, 3.8, 'right'),
  'knee-push-up': rep(KNEE_PUSH_TOP, KNEE_PUSH_LOW, 3.4),
  'wide-push-up': rep(pose(PLANK_TOP, { ...WIDE_HANDS, elbowL: [60, 179], elbowR: [90, 185] }), pose(PUSH_UP_BOTTOM, { ...WIDE_HANDS, elbowL: [48, 181], elbowR: [116, 193] }), 3.6),
  'close-push-up': rep(pose(PLANK_TOP, { ...CLOSE_HANDS, elbowL: [72, 179], elbowR: [80, 185] }), pose(PUSH_UP_BOTTOM, { ...CLOSE_HANDS, elbowL: [102, 193], elbowR: [112, 201] }), 3.6),
  'diamond-push-up': rep(pose(PLANK_TOP, { ...DIAMOND_HANDS, elbowL: [74.5, 180], elbowR: [80.5, 184] }), pose(PUSH_UP_BOTTOM, { ...DIAMOND_HANDS, elbowL: [106, 192], elbowR: [116, 200] }), 4),
  'offset-push-up': rep(pose(PLANK_TOP, { ...OFFSET_HANDS, elbowL: [59, 179], elbowR: [88, 185] }), pose(PUSH_UP_BOTTOM, { ...OFFSET_HANDS, elbowL: [72, 212], elbowR: [118, 200] }), 4),
  'archer-push-up': alternating(ARCHER_TOP, ARCHER_LEFT, mirror(ARCHER_LEFT)),
  'pike-push-up': rep(PIKE_TOP, PIKE_LOW, 4.2),
  'dolphin-push-up': rep(DOLPHIN_HIGH, FOREARM_PLANK, 4.4),
  'scapular-push-up': rep(PLANK_TOP, SCAPULAR_RETRACT, 3.6),
  'wall-handstand': rep(HANDSTAND, HANDSTAND_TENSION, 4, 'right'),
  'wall-walk': sequence([WALL_WALK_START, WALL_WALK_MID, HANDSTAND, WALL_WALK_MID, WALL_WALK_START], 6, 2, 'right'),
  'wall-angel': rep(WALL_ANGEL_LOW, WALL_ANGEL_HIGH, 4.8, 'left'),
}

// 033–038 use an oblique overhead view: the head is on the left and both
// shoulder blades/arm shapes are visible. Small raises avoid depicting lumbar
// hyperextension; these projected y coordinates are not a side-view floor plane.
const PRONE = freezePose({
  head: [62, 156], neck: [80, 160], shoulderL: [94, 146], shoulderR: [94, 174],
  elbowL: [124, 140], elbowR: [124, 182], wristL: [156, 136], wristR: [156, 188],
  hipL: [146, 152], hipR: [146, 170], kneeL: [184, 150], kneeR: [184, 172],
  ankleL: [220, 148], ankleR: [220, 174],
})
const PRONE_Y = pose(PRONE, { elbowL: [66, 120], wristL: [36, 92], elbowR: [66, 194], wristR: [36, 218] })
const PRONE_Y_LIFT = pose(PRONE_Y, { elbowL: [66, 115], wristL: [36, 86], elbowR: [66, 189], wristR: [36, 212] })
const PRONE_T = pose(PRONE, { elbowL: [94, 112], wristL: [94, 78], elbowR: [94, 196], wristR: [94, 218] })
const PRONE_T_LIFT = pose(PRONE_T, { elbowL: [94, 107], wristL: [94, 72], elbowR: [94, 191], wristR: [94, 212] })
const PRONE_W = pose(PRONE, { elbowL: [112, 118], wristL: [82, 100], elbowR: [112, 202], wristR: [82, 218] })
const PRONE_W_LIFT = pose(PRONE_W, { elbowL: [110, 113], wristL: [80, 94], elbowR: [110, 197], wristR: [80, 212] })
const SUPERMAN_LONG = pose(PRONE, {
  head: [62, 152], neck: [80, 156], shoulderL: [94, 142], shoulderR: [94, 170],
  elbowL: [54, 130], wristL: [18, 118], elbowR: [54, 180], wristR: [18, 190],
  kneeL: [184, 147], kneeR: [184, 169], ankleL: [220, 142], ankleR: [220, 168],
})
const SUPERMAN_PULL = pose(SUPERMAN_LONG, { elbowL: [124, 120], wristL: [92, 112], elbowR: [124, 196], wristR: [92, 204] })
const SWIM_LONG = pose(PRONE, { elbowL: [54, 134], wristL: [18, 122], elbowR: [54, 184], wristR: [18, 194] })
const SWIM_L = pose(SWIM_LONG, { elbowL: [54, 130], wristL: [18, 116], kneeR: [184, 168], ankleR: [220, 168] })
const SWIM_R = pose(SWIM_LONG, { elbowR: [54, 180], wristR: [18, 188], kneeL: [184, 146], ankleL: [220, 142] })

// 039–048: pelvis and support points stay quiet in the holds/contralateral
// reaches. The one-pixel neck pulse suggests breathing, never repeated hip dips.
const SIDE_PLANK = freezePose({
  head: [62, 116], neck: [78, 130], shoulderL: [82, 150], shoulderR: [88, 120],
  elbowL: [82, 212], wristL: [46, 212], elbowR: [94, 86], wristR: [100, 52],
  hipL: [144, 180], hipR: [150, 154], kneeL: [180, 196], kneeR: [184, 182],
  ankleL: [216, 212], ankleR: [218, 212],
})
const SIDE_ROTATE = pose(SIDE_PLANK, {
  head: [64, 125], neck: [80, 139], shoulderR: [106, 148],
  elbowR: [122, 179], wristR: [72, 184],
})
const DEAD_BUG_BASE = pose(BRIDGE_LOW, {
  elbowL: [72, 172], wristL: [74, 138], elbowR: [84, 178], wristR: [90, 144],
  kneeL: [136, 156], ankleL: [174, 156], kneeR: [150, 162], ankleR: [188, 162],
})
const DEAD_BUG_L = pose(DEAD_BUG_BASE, {
  elbowL: [42, 190], wristL: [18, 172], kneeR: [180, 201], ankleR: [222, 194],
})
const DEAD_BUG_R = pose(DEAD_BUG_BASE, {
  elbowR: [52, 194], wristR: [26, 176], kneeL: [173, 195], ankleL: [214, 188],
})
const BIRD_DOG_L = pose(HIP_EXTENSION_R, { elbowL: [42, 140], wristL: [12, 138] })
const BIRD_DOG_R = pose(HIP_EXTENSION_L, { elbowR: [52, 146], wristR: [22, 144] })
const HOLLOW = pose(BRIDGE_LOW, {
  head: [42, 176], neck: [62, 190], shoulderL: [74, 192], shoulderR: [84, 198],
  elbowL: [48, 174], wristL: [22, 156], elbowR: [56, 178], wristR: [28, 158],
  kneeL: [174, 188], kneeR: [182, 194], ankleL: [214, 174], ankleR: [222, 180],
})
const CRUNCH_BASE = pose(DEAD_BUG_BASE, { elbowL: [102, 210], elbowR: [110, 216], wristL: [132, 212], wristR: [140, 218] })
const CRUNCH_CURL = pose(CRUNCH_BASE, { hipL: [126, 194], hipR: [134, 200], kneeL: [116, 150], kneeR: [130, 156], ankleL: [152, 140], ankleR: [166, 146] })
const LEGS_UP = pose(BRIDGE_LOW, { kneeL: [140, 158], kneeR: [148, 164], ankleL: [148, 114], ankleR: [156, 120] })
const LEGS_LOW = pose(BRIDGE_LOW, { kneeL: [173, 185], kneeR: [181, 191], ankleL: [214, 168], ankleR: [222, 174] })
const BEAR = pose(QUADRUPED, { kneeL: [136, 194], kneeR: [150, 200] })
const BEAR_TAP_L = pose(BEAR, { elbowL: [54, 168], wristL: [82, 148] })
const BEAR_TAP_R = pose(BEAR, { elbowR: [108, 170], wristR: [72, 142] })

const BACK_CORE_MOTIONS = {
  'prone-y-raise': rep(PRONE_Y, PRONE_Y_LIFT, 3.8),
  'prone-t-raise': rep(PRONE_T, PRONE_T_LIFT, 3.8),
  'prone-w-raise': rep(PRONE_W, PRONE_W_LIFT, 3.8),
  'reverse-snow-angel': sequence([PRONE, PRONE_T_LIFT, PRONE_Y_LIFT, PRONE_T_LIFT, PRONE], 6, 2),
  'superman-lat-pulldown': rep(SUPERMAN_LONG, SUPERMAN_PULL, 4.8),
  'prone-swimmer': alternating(SWIM_LONG, SWIM_L, SWIM_R),
  'forearm-plank': rep(FOREARM_PLANK, pose(FOREARM_PLANK, { neck: [62, 155], head: [48, 145] })),
  'slow-mountain-climber': alternating(PLANK_TOP, pose(PLANK_TOP, { kneeL: [98, 190], ankleL: [142, 207] }), pose(PLANK_TOP, { kneeR: [110, 196], ankleR: [154, 213] })),
  'side-plank': rep(SIDE_PLANK, pose(SIDE_PLANK, { neck: [78, 129], head: [62, 115] })),
  'rotating-side-plank': sequence([SIDE_PLANK, SIDE_ROTATE, SIDE_PLANK], 4.8, 0),
  'dead-bug': alternating(DEAD_BUG_BASE, DEAD_BUG_L, DEAD_BUG_R),
  'bird-dog': alternating(QUADRUPED, BIRD_DOG_L, BIRD_DOG_R),
  'hollow-body-hold': rep(HOLLOW, pose(HOLLOW, { neck: [62, 189], head: [42, 175] })),
  'reverse-crunch': rep(CRUNCH_BASE, CRUNCH_CURL, 4.2),
  'straight-leg-raise': rep(LEGS_UP, LEGS_LOW, 4.8),
  'bear-plank-shoulder-tap': alternating(BEAR, BEAR_TAP_L, BEAR_TAP_R),
}

export const BODYWEIGHT_MOTIONS = Object.freeze({
  ...PILOT_MOTIONS, ...LOWER_MOTIONS, ...PUSH_MOTIONS, ...BACK_CORE_MOTIONS,
})
