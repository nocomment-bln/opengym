import { useEffect, useRef } from 'react'
import { BONES, keySplines, keyTimes, motionFor, posterPose, timelineValues } from '../lib/bodyweight-motion.js'

const AnimatedNumber = ({ name, values, times, splines, duration }) => (
  <animate attributeName={name} values={values} keyTimes={times}
    dur={`${duration}s`} repeatCount="indefinite" calcMode="spline"
    keySplines={splines} />
)

function MotionBone({ bone, pose, def, animated, times, splines }) {
  const [from, to, kind] = bone
  const [x1, y1] = pose[from]
  const [x2, y2] = pose[to]

  return (
    <line className={`motion-${kind}`} x1={x1} y1={y1} x2={x2} y2={y2}>
      {animated && <>
        <AnimatedNumber name="x1" values={timelineValues(def, from, 0)} times={times} splines={splines} duration={def.duration} />
        <AnimatedNumber name="y1" values={timelineValues(def, from, 1)} times={times} splines={splines} duration={def.duration} />
        <AnimatedNumber name="x2" values={timelineValues(def, to, 0)} times={times} splines={splines} duration={def.duration} />
        <AnimatedNumber name="y2" values={timelineValues(def, to, 1)} times={times} splines={splines} duration={def.duration} />
      </>}
    </line>
  )
}

export default function BodyweightMotion({ motionId, label, mode = 'player', paused = false, compact = false, mini = false }) {
  const svgRef = useRef(null)
  const def = motionFor(motionId)
  const animated = mode === 'player'

  useEffect(() => {
    const svg = svgRef.current
    if (!svg || !animated) return

    let pageVisible = document.visibilityState !== 'hidden'
    let inViewport = true
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

    const syncPlayback = () => {
      const canPlay = !paused && pageVisible && inViewport && !reducedMotion.matches
      if (canPlay) svg.unpauseAnimations?.()
      else svg.pauseAnimations?.()
    }
    const onVisibilityChange = () => {
      pageVisible = document.visibilityState !== 'hidden'
      syncPlayback()
    }
    const onReducedMotionChange = () => syncPlayback()
    const observer = 'IntersectionObserver' in window
      ? new IntersectionObserver(([entry]) => {
        inViewport = entry.isIntersecting
        syncPlayback()
      })
      : null

    document.addEventListener('visibilitychange', onVisibilityChange)
    reducedMotion.addEventListener?.('change', onReducedMotionChange)
    reducedMotion.addListener?.(onReducedMotionChange)
    observer?.observe(svg)
    syncPlayback()

    return () => {
      observer?.disconnect()
      document.removeEventListener('visibilitychange', onVisibilityChange)
      reducedMotion.removeEventListener?.('change', onReducedMotionChange)
      reducedMotion.removeListener?.(onReducedMotionChange)
    }
  }, [animated, paused])

  if (!def) return <div className="motion-fallback" role="img" aria-label={label} />

  const pose = posterPose(def)
  const times = keyTimes(def)
  const splines = keySplines(def)
  const [headX, headY] = pose.head
  const [hipLX, hipLY] = pose.hipL
  const [hipRX, hipRY] = pose.hipR
  const [shoulderLX, shoulderLY] = pose.shoulderL
  const [shoulderRX, shoulderRY] = pose.shoulderR
  const joints = [...new Set(BONES.flatMap(([from, to]) => [from, to]))]
  const className = `bodymotion${mode === 'thumbnail' ? ' motion-thumb' : ''}${compact ? ' compact' : ''}${mini ? ' mini' : ''}`

  return (
    <svg ref={svgRef} className={className} viewBox="0 0 240 240" role={mode === 'thumbnail' ? undefined : 'img'} aria-hidden={mode === 'thumbnail' ? true : undefined} aria-label={mode === 'thumbnail' ? undefined : label}>
      <line className="motion-floor" x1="16" y1="220" x2="224" y2="220" />
      {def.wall && <line className="motion-wall" x1={def.wall === 'left' ? 18 : 222} y1="16" x2={def.wall === 'left' ? 18 : 222} y2="220" />}
      {BONES.map(bone => <MotionBone key={`${bone[0]}-${bone[1]}`} bone={bone} pose={pose} def={def} animated={animated} times={times} splines={splines} />)}
      <path className="motion-torso" d={`M ${shoulderLX} ${shoulderLY} L ${shoulderRX} ${shoulderRY} L ${hipRX} ${hipRY} L ${hipLX} ${hipLY} Z`} />
      <ellipse className="motion-torso" cx={(hipLX + hipRX) / 2} cy={(hipLY + hipRY) / 2} rx="16" ry="8" />
      <circle className="motion-head" cx={headX} cy={headY} r="16" />
      {joints.map(joint => {
        const [cx, cy] = pose[joint]
        return <circle key={joint} className="motion-joint" cx={cx} cy={cy} r="3" />
      })}
    </svg>
  )
}
