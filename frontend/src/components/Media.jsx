import { useState } from 'react'
import { imgSrc, gifSrc } from '../lib/exercises.js'
import { useStore } from '../store/useStore.js'
import { t } from '../lib/i18n.js'
import Icon from './Icon.jsx'
import BodyweightMotion from './BodyweightMotion.jsx'

// Big autoplaying animation; tap toggles to the still frame. `compact` shrinks it (superset cards).
// Custom exercises have no media — the animation stays blank by design (issue #11).
// `minimizable` (workout view) adds a persistent minimize/expand control so the animation stops
// eating the screen; the chosen size is saved to settings and carries across exercises and
// future workouts (issue #12).
export default function Media({ ex, id, compact, minimizable }) {
  const [playing, setPlaying] = useState(true)
  const gifSize = useStore(s => s.S.gifSize)
  const update = useStore(s => s.update)
  const hasMotion = Boolean(ex.motion)
  if (!hasMotion && !ex.gif) return null
  const mini = minimizable && gifSize === 'mini'
  const toggleSize = e => { e.stopPropagation(); update(s => { s.gifSize = mini ? 'full' : 'mini' }) }
  const togglePlaying = e => { e.stopPropagation(); setPlaying(p => !p) }
  return (
    <div className={'exmedia' + (compact ? ' compact' : '') + (mini ? ' mini' : '')} id={id} onClick={() => setPlaying(p => !p)}>
      {hasMotion
        ? <BodyweightMotion motionId={ex.motion} label={ex.n} mode="player" paused={!playing} compact={compact} mini={mini} />
        : <img decoding="async" src={playing ? gifSrc(ex) : imgSrc(ex)} alt={ex.n} />}
      {minimizable && (
        <button type="button" className="giftoggle" onClick={toggleSize}>
          <Icon name={mini ? 'expand' : 'minimize'} />{mini ? t('Expand') : t('Minimize')}
        </button>
      )}
      {!mini && (
        <button type="button" className="gifhint" onClick={togglePlaying} aria-label={playing ? t('Pause animation') : t('Play animation')}>
          <Icon name={playing ? 'pause' : 'play'} />{playing ? t('tap to pause') : t('tap to play')}
        </button>
      )}
    </div>
  )
}

export function Thumb({ ex }) {
  if (ex.motion) return <div className="thumb motion-thumb"><BodyweightMotion motionId={ex.motion} label={ex.n} mode="thumbnail" /></div>
  if (!ex.img) return <div className="thumb thumb-x"><Icon name="dumbbell" /></div>
  return <img className="thumb" loading="lazy" decoding="async" src={imgSrc(ex)} alt="" />
}
