# Reise-Krafttraining Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 48 globally available German bodyweight strength exercises with consistent code-rendered SVG previews and controllable animations to openGym.

**Architecture:** Merge a dedicated first-party travel catalogue into the existing exercise index, render normalized joint timelines through one dependency-free SVG component, and reuse a pure filter helper in the library and exercise picker. Existing GIF media, custom exercises, plans, progression, sharing, and the disabled Coach remain compatible.

**Tech Stack:** React 19, Vite 8, Vitest 4, semantic SVG/SMIL, existing CSS design tokens, Portainer/GHCR deployment.

**Spec:** `docs/superpowers/specs/2026-09-08-travel-bodyweight-strength-design.md`

## Global Constraints

- The catalogue contains exactly 48 IDs from `travel-strength-001` through `travel-strength-048`.
- Every catalogue entry uses `eq: 'body weight'` and `collection: 'travel-strength'`.
- Every exercise works with floor and/or wall only; no furniture or equipment may appear in names, descriptions, steps, or motion scenery.
- Exercise names, descriptions, and steps are German.
- No image-generation service, video service, external CDN, runtime API key, or new npm dependency is allowed.
- List thumbnails are static; only the large player animates.
- Existing `ex.gif`/`ex.img` behavior and personal custom exercises must remain unchanged.
- `prefers-reduced-motion: reduce`, manual pause, tab visibility, and viewport visibility must stop spatial motion.
- The Coach remains hard-disabled with `COACH_DISABLED=1`.
- Production uses the same immutable `sha-<commit>` tag for API and Web, never `latest`.
- GitHub push, consistent production backup, and Portainer update are separate approval gates.

## File Map

- Create `frontend/src/lib/travel-exercises-data.js`: the 48 canonical exercise records.
- Create `frontend/src/lib/travel-exercises-data.test.js`: catalogue schema, uniqueness, language, equipment, and cross-reference checks.
- Create `frontend/src/lib/bodyweight-motion-data.js`: reusable normalized poses and 48 motion timelines.
- Create `frontend/src/lib/bodyweight-motion.js`: pure validation and SVG timeline helpers.
- Create `frontend/src/lib/bodyweight-motion.test.js`: deterministic validation/interpolation/poster tests.
- Create `frontend/src/components/BodyweightMotion.jsx`: static and animated SVG renderer.
- Create `frontend/src/components/BodyweightMotion.test.jsx`: server-rendered semantic SVG tests.
- Create `frontend/src/lib/exercise-filter.js`: shared query/body-part/equipment/collection filtering.
- Create `frontend/src/lib/exercise-filter.test.js`: filter composition and stale-filter tests.
- Modify `frontend/src/lib/exercises.js`: merge travel catalogue before building `EXIDX`.
- Modify `frontend/src/components/Media.jsx`: route `ex.motion` through the SVG renderer while preserving GIFs.
- Modify `frontend/src/views/Library.jsx`: collection chip, level metadata, and shared filtering.
- Modify `frontend/src/sheets.jsx`: same collection/filter behavior in the exercise picker.
- Modify `frontend/src/index.css`: scoped SVG player, poster, control, compact, mini, theme, and reduced-motion styles.
- Modify `frontend/src/locales/*.js`: translate the collection and level labels.

---

### Task 1: Canonical Travel Exercise Catalogue

**Files:**
- Create: `frontend/src/lib/travel-exercises-data.js`
- Create: `frontend/src/lib/travel-exercises-data.test.js`
- Modify: `frontend/src/lib/exercises.js:1-8`

**Interfaces:**
- Produces: `TRAVEL_EXERCISES: Exercise[]` where each exercise has `id`, `n`, `bp`, `eq`, `tg`, `sm`, `st`, `desc`, `collection`, `level`, and `motion`.
- Produces: `EXDB`, with the existing dataset followed by the 48 travel records; `EXIDX` resolves every new stable ID.
- Consumes later: `exercise.motion`, `exercise.collection`, and `exercise.level` in Tasks 2-5.

- [ ] **Step 1: Write the failing catalogue integrity test**

```js
import { describe, expect, it } from 'vitest'
import { TRAVEL_EXERCISES } from './travel-exercises-data.js'
import { BODYWEIGHT_MOTIONS } from './bodyweight-motion-data.js'

const VALID_BP = new Set(['back', 'chest', 'lower legs', 'shoulders', 'upper arms', 'upper legs', 'waist'])
const VALID_LEVEL = new Set(['beginner', 'intermediate', 'advanced'])
const BANNED = /\b(stuhl|bett|bank|tisch|hantel|band|ball|matte|gerät|chair|bed|bench|table|dumbbell|barbell)\b/i

describe('travel strength catalogue', () => {
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
```

- [ ] **Step 2: Create a temporary motion-data export so the catalogue test fails for the intended reason**

Create `frontend/src/lib/bodyweight-motion-data.js` with:

```js
export const BODYWEIGHT_MOTIONS = {}
```

- [ ] **Step 3: Run the targeted test and confirm red state**

Run: `cd frontend && npm test -- src/lib/travel-exercises-data.test.js`

Expected: FAIL because `travel-exercises-data.js` does not exist.

- [ ] **Step 4: Implement the 48 catalogue records**

Use the exact order, names, body areas, targets, levels, and ID suffixes from the approved spec. Encode every record with this complete shape:

```js
export const TRAVEL_EXERCISES = [
  {
    id: 'travel-strength-001',
    n: 'Wand-Kniebeuge',
    bp: 'upper legs',
    eq: 'body weight',
    tg: 'quads',
    sm: ['glutes', 'hamstrings'],
    collection: 'travel-strength',
    level: 'beginner',
    motion: 'wall-squat',
    desc: 'Halte Knie und Fußspitzen in derselben Richtung und bewege dich nur so tief, wie du stabil bleibst.',
    st: [
      'Stelle dich mit dem Rücken an die Wand und setze die Füße etwa einen Schritt nach vorn.',
      'Spanne den Rumpf an und gleite kontrolliert an der Wand nach unten.',
      'Stoppe, bevor die Knie nach innen fallen oder sich die Fersen lösen.',
      'Drücke dich über die ganzen Füße wieder nach oben.',
    ],
  },
]
```

Add the remaining 47 records in the exact approved spec-table order through
`travel-strength-048`. Use the same complete object shape for every row; map
`Anfänger` to `beginner`, `Mittel` to `intermediate`, and `Fortgeschritten` to
`advanced`. For every unilateral entry, include one final instruction that
explicitly says to repeat on the other side. Use unique English kebab-case
motion keys derived from the German exercise names; the keys must match Task
6's exports exactly.

- [ ] **Step 5: Merge the records into the built-in index**

Change `frontend/src/lib/exercises.js` to:

```js
import { EXDB as DATASET_EXERCISES } from './exercises-data.js'
import { TRAVEL_EXERCISES } from './travel-exercises-data.js'
import { t } from './i18n.js'

export const EXDB = [...DATASET_EXERCISES, ...TRAVEL_EXERCISES]
export const EXIDX = {}
EXDB.forEach(e => { EXIDX[e.id] = e })
```

Keep all remaining exports and custom-exercise behavior in the file unchanged.

- [ ] **Step 6: Add temporary valid motion keys and make the catalogue tests green**

Until Task 2 replaces them with complete motion definitions, export one structurally valid `placeholder` timeline and map each unique catalogue `motion` key to it. The test must verify every key resolves; no application code will be committed with missing keys.

Run: `cd frontend && npm test -- src/lib/travel-exercises-data.test.js`

Expected: PASS.

- [ ] **Step 7: Run existing data-dependent tests**

Run: `cd frontend && npm test -- src/lib/history.test.js src/lib/progression.test.js src/lib/coach.test.js`

Expected: PASS with the enlarged `EXDB` and unchanged existing IDs.

- [ ] **Step 8: Commit the catalogue slice**

```bash
git add frontend/src/lib/travel-exercises-data.js frontend/src/lib/travel-exercises-data.test.js frontend/src/lib/bodyweight-motion-data.js frontend/src/lib/exercises.js
git commit -m "feat: add travel strength exercise catalogue"
```

### Task 2: Pure Motion Model and Three Pilot Timelines

**Files:**
- Create: `frontend/src/lib/bodyweight-motion.js`
- Create: `frontend/src/lib/bodyweight-motion.test.js`
- Modify: `frontend/src/lib/bodyweight-motion-data.js`

**Interfaces:**
- Produces: `JOINTS`, `BONES`, `motionFor(id)`, `validateMotion(def)`, `posterPose(def)`, `timelineValues(def, joint, axis)`, `keyTimes(def)`, and `keySplines(def)`.
- Motion definition: `{ duration: number, poster: number, wall?: 'left'|'right', frames: MotionFrame[] }`.
- Motion frame: `{ at: number, pose: Record<JointName, [number, number]> }` with `at` from `0` to `1`, first `0`, last `1`, and matching first/last poses for a seamless loop.

- [ ] **Step 1: Write failing tests for validation and timeline helpers**

```js
import { describe, expect, it } from 'vitest'
import { keySplines, keyTimes, motionFor, posterPose, timelineValues, validateMotion } from './bodyweight-motion.js'

const def = {
  duration: 3.6,
  poster: 1,
  frames: [
    { at: 0, pose: { head: [100, 30], neck: [100, 48] } },
    { at: 0.5, pose: { head: [92, 44], neck: [96, 58] } },
    { at: 1, pose: { head: [100, 30], neck: [100, 48] } },
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
})
```

- [ ] **Step 2: Run the test and confirm red state**

Run: `cd frontend && npm test -- src/lib/bodyweight-motion.test.js`

Expected: FAIL because `bodyweight-motion.js` does not exist.

- [ ] **Step 3: Implement strict pure helpers**

```js
import { BODYWEIGHT_MOTIONS } from './bodyweight-motion-data.js'

export const JOINTS = ['head', 'neck', 'shoulderL', 'shoulderR', 'elbowL', 'elbowR', 'wristL', 'wristR', 'hipL', 'hipR', 'kneeL', 'kneeR', 'ankleL', 'ankleR']
export const BONES = [
  ['neck', 'shoulderL', 'arm'], ['shoulderL', 'elbowL', 'arm'], ['elbowL', 'wristL', 'arm'],
  ['neck', 'shoulderR', 'arm'], ['shoulderR', 'elbowR', 'arm'], ['elbowR', 'wristR', 'arm'],
  ['hipL', 'kneeL', 'leg'], ['kneeL', 'ankleL', 'leg'],
  ['hipR', 'kneeR', 'leg'], ['kneeR', 'ankleR', 'leg'],
]

export const motionFor = id => BODYWEIGHT_MOTIONS[id] || null
export const keyTimes = def => def.frames.map(frame => frame.at).join(';')
export const keySplines = def => def.frames.slice(1).map(() => '0.4 0 0.2 1').join(';')
export const timelineValues = (def, joint, axis) => def.frames.map(frame => frame.pose[joint][axis]).join(';')
export const posterPose = def => def.frames[Math.max(0, Math.min(def.poster, def.frames.length - 1))].pose

export function validateMotion(def) {
  const errors = []
  if (!def || !(def.duration >= 2 && def.duration <= 6)) errors.push('duration')
  if (!Array.isArray(def?.frames) || def.frames.length < 2) return [...errors, 'frames']
  if (def.frames[0].at !== 0 || def.frames.at(-1).at !== 1) errors.push('range')
  if (def.frames.some((frame, i) => i && frame.at <= def.frames[i - 1].at)) errors.push('order')
  for (const frame of def.frames) {
    for (const joint of JOINTS) {
      const point = frame.pose?.[joint]
      if (!Array.isArray(point) || point.length !== 2 || point.some(n => !Number.isFinite(n))) errors.push(`joint:${joint}`)
    }
  }
  if (JSON.stringify(def.frames[0].pose) !== JSON.stringify(def.frames.at(-1).pose)) errors.push('loop')
  return [...new Set(errors)]
}
```

- [ ] **Step 4: Replace placeholders with shared pose builders and three real pilot timelines**

Define a complete neutral standing pose with all `JOINTS`, then small immutable helpers such as `pose(base, overrides)` and `mirror(pose)`. Add accurate closed timelines for:

```js
export const BODYWEIGHT_MOTIONS = {
  squat: { duration: 3.6, poster: 1, frames: [
    { at: 0, pose: STAND }, { at: 0.5, pose: SQUAT_BOTTOM }, { at: 1, pose: STAND },
  ] },
  'standard-push-up': { duration: 3.2, poster: 1, frames: [
    { at: 0, pose: PLANK_TOP }, { at: 0.5, pose: PUSH_UP_BOTTOM }, { at: 1, pose: PLANK_TOP },
  ] },
  'single-leg-hip-hinge': { duration: 4, poster: 1, frames: [
    { at: 0, pose: SINGLE_LEG_STAND }, { at: 0.5, pose: HINGE_BOTTOM }, { at: 1, pose: SINGLE_LEG_STAND },
  ] },
}
```

Keep the remaining 45 catalogue keys mapped to the valid neutral definition
with `placeholder: true` until Task 6 replaces each one.

The pilot pose requirements are exact: squat knees follow toes with heels grounded; push-up is a straight head-to-heel line with elbows approximately 45 degrees; hip hinge keeps hips square and spine neutral with the free leg extending backward.

- [ ] **Step 5: Extend validation tests to all exported definitions**

```js
import { BODYWEIGHT_MOTIONS } from './bodyweight-motion-data.js'

it('validates every exported motion definition', () => {
  for (const [key, motion] of Object.entries(BODYWEIGHT_MOTIONS)) {
    expect(validateMotion(motion), key).toEqual([])
  }
})
```

Run: `cd frontend && npm test -- src/lib/bodyweight-motion.test.js src/lib/travel-exercises-data.test.js`

Expected: PASS.

- [ ] **Step 6: Commit the motion model and pilot definitions**

```bash
git add frontend/src/lib/bodyweight-motion.js frontend/src/lib/bodyweight-motion.test.js frontend/src/lib/bodyweight-motion-data.js
git commit -m "feat: define bodyweight motion model"
```

### Task 3: Accessible SVG Renderer

**Files:**
- Create: `frontend/src/components/BodyweightMotion.jsx`
- Create: `frontend/src/components/BodyweightMotion.test.jsx`
- Modify: `frontend/src/index.css:529-543`

**Interfaces:**
- Consumes: `motionFor`, `posterPose`, `timelineValues`, `keyTimes`, `BONES` from Task 2.
- Produces: `<BodyweightMotion motionId label mode="player|thumbnail" paused compact mini />`.
- Fallback: returns `<div className="motion-fallback" role="img" aria-label={label}>` when the key is invalid.

- [ ] **Step 1: Write server-rendered component tests**

```jsx
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import BodyweightMotion from './BodyweightMotion.jsx'

describe('BodyweightMotion', () => {
  it('renders an accessible animated player', () => {
    const html = renderToStaticMarkup(<BodyweightMotion motionId="squat" label="Kniebeuge" mode="player" />)
    expect(html).toContain('<svg')
    expect(html).toContain('aria-label="Kniebeuge"')
    expect(html).toContain('<animate')
  })

  it('renders a silent static thumbnail', () => {
    const html = renderToStaticMarkup(<BodyweightMotion motionId="squat" label="Kniebeuge" mode="thumbnail" />)
    expect(html).toContain('aria-hidden="true"')
    expect(html).not.toContain('<animate')
  })

  it('renders a safe fallback for bad data', () => {
    const html = renderToStaticMarkup(<BodyweightMotion motionId="missing" label="Unbekannt" mode="player" />)
    expect(html).toContain('motion-fallback')
    expect(html).toContain('aria-label="Unbekannt"')
  })
})
```

- [ ] **Step 2: Run the component test and confirm red state**

Run: `cd frontend && npm test -- src/components/BodyweightMotion.test.jsx`

Expected: FAIL because the component does not exist.

- [ ] **Step 3: Implement the static and animated SVG**

Render a `viewBox="0 0 240 240"` with:

```jsx
const AnimatedNumber = ({ name, values, times, splines, duration }) => (
  <animate attributeName={name} values={values} keyTimes={times}
    dur={`${duration}s`} repeatCount="indefinite" calcMode="spline"
    keySplines={splines} />
)
```

For each bone, draw a round-capped `<line>` from the selected poster pose. In player mode, attach four `AnimatedNumber` children for `x1`, `y1`, `x2`, and `y2`. Draw a neutral torso path, pelvis, and faceless head above the limbs; render `.motion-wall` only when `def.wall` exists and always render `.motion-floor`. Use a stable DOM order so crossed limbs remain readable.

Use an SVG ref and one effect to coordinate `paused`, `document.visibilityState`, `IntersectionObserver`, and `matchMedia('(prefers-reduced-motion: reduce)')`. Pause with `svg.pauseAnimations()` and resume with `svg.unpauseAnimations()` only when all four conditions allow it. Remove observers/listeners on cleanup.

- [ ] **Step 4: Add scoped visual styles**

Add these selectors without changing global motion rules:

```css
.bodymotion{width:100%;height:320px;display:block;background:var(--surface);color:var(--label)}
.bodymotion .motion-floor,.bodymotion .motion-wall{stroke:var(--sep);stroke-width:2}
.bodymotion .motion-arm{stroke:var(--label-2);stroke-width:11;stroke-linecap:round}
.bodymotion .motion-leg{stroke:var(--label);stroke-width:15;stroke-linecap:round}
.bodymotion .motion-torso{fill:var(--acc);stroke:var(--label);stroke-width:2}
.bodymotion .motion-head{fill:var(--label-2);stroke:var(--label);stroke-width:2}
.bodymotion .motion-joint{fill:var(--surface);stroke:var(--label);stroke-width:2}
.motion-thumb{width:50px;height:50px;border-radius:9px;background:var(--surface-2)}
.exmedia.compact .bodymotion{height:120px}
.exmedia.mini .bodymotion{height:84px}
.motion-fallback{display:grid;place-items:center;min-height:120px;background:var(--surface);color:var(--label-3)}
@media (prefers-reduced-motion:reduce){.bodymotion animate{display:none}}
```

Use the exact CSS values shown. During Task 7, change them only when a recorded
contrast or silhouette defect demonstrates a specific correction is required;
preserve the existing openGym tokens and accent selection.

- [ ] **Step 5: Run renderer and motion tests**

Run: `cd frontend && npm test -- src/components/BodyweightMotion.test.jsx src/lib/bodyweight-motion.test.js`

Expected: PASS.

- [ ] **Step 6: Build to catch JSX/SVG attribute errors**

Run: `cd frontend && npm run build`

Expected: Vite exits 0 and emits `dist/`.

- [ ] **Step 7: Commit the renderer**

```bash
git add frontend/src/components/BodyweightMotion.jsx frontend/src/components/BodyweightMotion.test.jsx frontend/src/index.css
git commit -m "feat: render accessible bodyweight animations"
```

### Task 4: Integrate Vector Media Without Regressing GIFs

**Files:**
- Modify: `frontend/src/components/Media.jsx`
- Create: `frontend/src/components/Media.test.jsx`

**Interfaces:**
- Consumes: `BodyweightMotion` from Task 3.
- Produces: unchanged `Media({ ex, id, compact, minimizable })` and `Thumb({ ex })` public APIs.
- Selection order: `ex.motion` first, existing `ex.gif` second, existing empty-media fallback last.

- [ ] **Step 1: Write media routing tests**

Mock `useStore` with `{ S: { gifSize: 'full' }, update: () => {} }`, then assert:

```jsx
it('uses vector motion for travel exercises', () => {
  const html = renderToStaticMarkup(<Media ex={{ n: 'Kniebeuge', motion: 'squat' }} />)
  expect(html).toContain('bodymotion')
  expect(html).not.toContain('<img')
})

it('keeps dataset GIF media unchanged', () => {
  const html = renderToStaticMarkup(<Media ex={{ n: 'Push-up', gif: 'a.gif', img: 'a.jpg' }} />)
  expect(html).toContain('<img')
  expect(html).toContain('gif/a.gif')
})

it('uses a static vector thumbnail', () => {
  const html = renderToStaticMarkup(<Thumb ex={{ n: 'Kniebeuge', motion: 'squat' }} />)
  expect(html).toContain('motion-thumb')
  expect(html).not.toContain('<animate')
})
```

- [ ] **Step 2: Run the test and confirm red state**

Run: `cd frontend && npm test -- src/components/Media.test.jsx`

Expected: FAIL because `Media` does not route `motion` records.

- [ ] **Step 3: Add motion routing and semantic controls**

Keep `playing` as the user's manual preference. Render:

```jsx
const hasMotion = Boolean(ex.motion)
if (!hasMotion && !ex.gif) return null

// Inside .exmedia:
{hasMotion
  ? <BodyweightMotion motionId={ex.motion} label={ex.n} mode="player" paused={!playing} compact={compact} mini={mini} />
  : <img decoding="async" src={playing ? gifSrc(ex) : imgSrc(ex)} alt={ex.n} />}
```

Change the play/pause hint from a passive `<span>` to a `<button type="button">` with `aria-label={playing ? t('Pause animation') : t('Play animation')}`. Preserve click-anywhere toggling without double toggles by stopping propagation in both control buttons. Keep minimization persistence exactly as before.

For `Thumb`, check `ex.motion` before `ex.img` and render `<BodyweightMotion ... mode="thumbnail" />` inside a `.thumb.motion-thumb` wrapper.

- [ ] **Step 4: Run media and renderer tests**

Run: `cd frontend && npm test -- src/components/Media.test.jsx src/components/BodyweightMotion.test.jsx`

Expected: PASS.

- [ ] **Step 5: Commit the integration**

```bash
git add frontend/src/components/Media.jsx frontend/src/components/Media.test.jsx
git commit -m "feat: integrate vector exercise media"
```

### Task 5: Reusable Collection Filters and Localized Metadata

**Files:**
- Create: `frontend/src/lib/exercise-filter.js`
- Create: `frontend/src/lib/exercise-filter.test.js`
- Modify: `frontend/src/views/Library.jsx`
- Modify: `frontend/src/sheets.jsx:404-465`
- Modify: `frontend/src/locales/de.js`
- Modify: `frontend/src/locales/es.js`
- Modify: `frontend/src/locales/fr.js`
- Modify: `frontend/src/locales/hi.js`
- Modify: `frontend/src/locales/it.js`
- Modify: `frontend/src/locales/ko.js`
- Modify: `frontend/src/locales/pl.js`
- Modify: `frontend/src/locales/pt.js`
- Modify: `frontend/src/locales/ru.js`
- Modify: `frontend/src/locales/tr.js`
- Modify: `frontend/src/locales/zh.js`

**Interfaces:**
- Produces: `filterExercises(list, { q, bp, eq, collection, usage })` and `equipmentForFilters(list, filters)`.
- Both Library and ExercisePicker use the same matching semantics.
- Collection value is the stable technical string `travel-strength`; only the label is translated.

- [ ] **Step 1: Write failing composition tests**

```js
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
```

- [ ] **Step 2: Run the test and confirm red state**

Run: `cd frontend && npm test -- src/lib/exercise-filter.test.js`

Expected: FAIL because the helper does not exist.

- [ ] **Step 3: Implement pure filtering**

```js
import { equipmentOf } from './exercises.js'

const haystack = ex => [ex.n, ex.tg, ex.eq, ex.desc, ex.level].filter(Boolean).join(' ').toLowerCase()

export function filterExercises(list, { q = '', bp = '', eq = '', collection = '', usage = null } = {}) {
  const query = q.toLowerCase().trim()
  return list.filter(ex =>
    (!collection || ex.collection === collection) &&
    (bp === '★' ? Boolean(usage?.[ex.id]) : (!bp || ex.bp === bp)) &&
    (!eq || ex.eq === eq) &&
    (!query || haystack(ex).includes(query))
  )
}

export function equipmentForFilters(list, filters) {
  return equipmentOf(filterExercises(list, { ...filters, eq: '' }))
}
```

- [ ] **Step 4: Wire collection state into Library and ExercisePicker**

Add `const [collection, setCollection] = useState('')` to both surfaces. Add a special chip immediately after `All`:

```jsx
<button className={'chip nocap' + (collection === 'travel-strength' ? ' on' : '')}
  onClick={() => { setCollection(c => c === 'travel-strength' ? '' : 'travel-strength'); setEq(''); setShown(40) }}>
  {t('Travel strength')}
</button>
```

In ExercisePicker use `setShown(50)`. Replace duplicated search/body/equipment filtering with the helper. Preserve chosen sorting. Add ` · ${t(e.level)}` only when `e.level` exists, so existing dataset rows remain unchanged.

- [ ] **Step 5: Add exact locale labels**

Add these keys to every locale dictionary, preserving each file's existing style:

```text
de: Travel strength = Reise-Krafttraining; beginner = Anfänger; intermediate = Mittel; advanced = Fortgeschritten
es: Travel strength = Fuerza para viajar; beginner = Principiante; intermediate = Intermedio; advanced = Avanzado
fr: Travel strength = Renforcement en voyage; beginner = Débutant; intermediate = Intermédiaire; advanced = Avancé
hi: Travel strength = यात्रा शक्ति प्रशिक्षण; beginner = शुरुआती; intermediate = मध्यम; advanced = उन्नत
it: Travel strength = Forza in viaggio; beginner = Principiante; intermediate = Intermedio; advanced = Avanzato
ko: Travel strength = 여행 근력 운동; beginner = 초급; intermediate = 중급; advanced = 고급
pl: Travel strength = Siła w podróży; beginner = Początkujący; intermediate = Średniozaawansowany; advanced = Zaawansowany
pt: Travel strength = Força em viagem; beginner = Iniciante; intermediate = Intermédio; advanced = Avançado
ru: Travel strength = Силовые в поездке; beginner = Начальный; intermediate = Средний; advanced = Продвинутый
tr: Travel strength = Seyahat kuvveti; beginner = Başlangıç; intermediate = Orta; advanced = İleri
zh: Travel strength = 旅行力量训练; beginner = 初级; intermediate = 中级; advanced = 高级
```

English intentionally uses the source keys.

- [ ] **Step 6: Run filter and locale tests**

Run: `cd frontend && npm test -- src/lib/exercise-filter.test.js`

Run: `cd frontend && npm run build`

Expected: both commands exit 0; Vite imports every edited locale module.

- [ ] **Step 7: Commit filters and copy**

```bash
git add frontend/src/lib/exercise-filter.js frontend/src/lib/exercise-filter.test.js frontend/src/views/Library.jsx frontend/src/sheets.jsx frontend/src/locales
git commit -m "feat: filter travel strength exercises"
```

### Task 6: Complete All 48 Motion Timelines

**Files:**
- Modify: `frontend/src/lib/bodyweight-motion-data.js`
- Modify: `frontend/src/lib/bodyweight-motion.test.js`
- Modify: `frontend/src/lib/travel-exercises-data.test.js`

**Interfaces:**
- Consumes: the 48 unique `motion` keys from Task 1 and normalized timeline contract from Task 2.
- Produces: 48 distinct non-placeholder `BODYWEIGHT_MOTIONS` definitions.

- [ ] **Step 1: Add a failing anti-placeholder test**

```js
it('gives every travel exercise a distinct authored motion', () => {
  const keys = TRAVEL_EXERCISES.map(ex => ex.motion)
  expect(new Set(keys).size).toBe(48)
  for (const key of keys) {
    const def = BODYWEIGHT_MOTIONS[key]
    expect(def.placeholder, key).not.toBe(true)
    expect(new Set(def.frames.map(frame => JSON.stringify(frame.pose))).size, key).toBeGreaterThan(1)
  }
})
```

- [ ] **Step 2: Run the integrity test and confirm red state**

Run: `cd frontend && npm test -- src/lib/travel-exercises-data.test.js`

Expected: FAIL for the 45 definitions still using the neutral placeholder.

- [ ] **Step 3: Author lower-body timelines 001-018**

Implement closed two-to-four-pose sequences for squat depth, lunge direction, hip hinge, bridge, hamstring walkout, and quadruped hip movements. Reuse common standing, split-stance, supine, and quadruped poses but give each key a distinct trajectory. Include `wall: 'left'` only for 001. Validate knee tracking, grounded support foot, neutral spine, and bilateral return frames.

Run: `cd frontend && npm test -- src/lib/bodyweight-motion.test.js src/lib/travel-exercises-data.test.js`

Expected: only not-yet-authored upper-body/core placeholders remain failing.

- [ ] **Step 4: Author push and shoulder timelines 019-032**

Implement wall, knee, standard, wide, close, diamond, staggered, archer, pike, dolphin, scapular, wall handstand, wall walk, and wall angel sequences. Wall definitions set the wall side explicitly. Keep push-up trunks rigid, distinguish hand widths, and render isometric handstand with a closed tension pulse rather than body displacement.

Run the same two targeted test files. Expected: only 033-048 remain failing.

- [ ] **Step 5: Author back and core timelines 033-048**

Implement prone Y/T/W, reverse snow angel, superman pull-down, swimmer, plank, slow mountain climber, side-plank variants, dead bug, bird dog, hollow hold, reverse crunch, leg raise, and bear shoulder tap. Use slow, symmetric frames for alternating movements and an explicit poster frame that shows the exercise's distinguishing position.

Run: `cd frontend && npm test -- src/lib/bodyweight-motion.test.js src/lib/travel-exercises-data.test.js`

Expected: PASS with zero placeholders and all 48 definitions valid.

- [ ] **Step 6: Commit the complete motion pack**

```bash
git add frontend/src/lib/bodyweight-motion-data.js frontend/src/lib/bodyweight-motion.test.js frontend/src/lib/travel-exercises-data.test.js
git commit -m "feat: animate travel strength catalogue"
```

### Task 7: Full Verification, Visual Review, and Release Preparation

**Files:**
- Modify only if verification finds a concrete defect: files changed in Tasks 1-6.
- Do not modify: deployment stack/env until GitHub images exist and the required production backup has been approved and verified.

**Interfaces:**
- Produces: verified local commit SHA suitable for immutable `sha-<commit>` images.
- Produces after separate approvals: GitHub images and a production Portainer update.

- [ ] **Step 1: Run the complete frontend verification suite**

Run: `cd frontend && npm test`

Expected: all Vitest files PASS.

Run: `cd frontend && npm run build`

Expected: Vite exits 0; no missing imports, malformed SVG attributes, or locale syntax errors.

- [ ] **Step 2: Run static repository checks**

Run:

```bash
git diff --check
rg -n "latest|OPENAI_API_KEY|sora|image_gen" frontend/src/lib/travel-exercises-data.js frontend/src/lib/bodyweight-motion-data.js frontend/src/components/BodyweightMotion.jsx
```

Expected: `git diff --check` is silent; the search produces no matches.

- [ ] **Step 3: Run the Impeccable detector once**

Run:

```bash
node /Users/roddelkopf/.agents/skills/impeccable/scripts/detect.mjs --json \
  frontend/src/components/BodyweightMotion.jsx \
  frontend/src/components/Media.jsx \
  frontend/src/views/Library.jsx \
  frontend/src/index.css
```

Expected: no unresolved high-confidence accessibility, responsive, or motion findings.

- [ ] **Step 4: Perform one bounded visual QA pass**

Start Vite with `cd frontend && npm run dev -- --host 127.0.0.1` using a persistent terminal session. Open the demo profile and inspect `/library` plus one exercise detail at approximately 390×844 and 1280×900 in both light and dark themes. Check the six required samples: Kniebeuge, Liegestütz, Einbeiniger Hüftknick, Wandlauf, Superman-Latzug, and Käfer. Also enable reduced motion and confirm each large SVG remains static while play/pause state stays understandable.

Record only concrete defects. Fix all observed defects in one batch, rerun the targeted tests/build, then perform at most one confirmation pass.

- [ ] **Step 5: Verify motion lifecycle behavior**

In the same browser session confirm:

1. thumbnails never animate;
2. detail animation pauses and resumes via keyboard and pointer;
3. minimization persists across exercises;
4. switching tabs pauses motion;
5. scrolling the player fully out of view pauses it;
6. existing GIF exercises still toggle between GIF and still image.

- [ ] **Step 6: Commit any bounded QA corrections**

If Step 4 or 5 changed files:

```bash
git add frontend/src
git commit -m "fix: polish travel exercise animations"
```

Then rerun `cd frontend && npm test && npm run build` and record the final commit with `git rev-parse --short HEAD`.

- [ ] **Step 7: Stop for GitHub push approval**

Before any push, state exactly:

- target: `nocomment-bln/opengym`, branch `deployment/roddelkopf-ch`;
- action: push the reviewed local commits including the final SHA;
- effect: GitHub Actions tests and builds immutable API/Web images tagged `sha-<commit>`; production is not changed.

Wait for a fresh explicit `passt`. Then read the GitHub runbook and push using the documented helper/workflow. Wait for both test and image workflows and verify both GHCR manifests are anonymously readable.

- [ ] **Step 8: Stop for consistent production backup approval**

Before backup, state exactly:

- target: `/volume1/docker/opengym/data` on Roddelkopf CH;
- action: briefly stop `opengym-api`, archive the complete directory outside `data/`, verify readability, size, and SHA-256, then restart the API;
- effect: a consistent rollback point with a short API interruption and no frontend outage.

Wait for a fresh explicit `passt`. Read the Portainer and SSH runbooks, perform the backup through documented helpers, and verify the internal health endpoint after restart without exposing data contents.

- [ ] **Step 9: Prepare and approve the immutable stack update**

From the workspace root, set `OPENGYM_IMAGE_TAG=sha-<final-commit>` in the
ignored local `stack/opengym.env`, keeping the same tag for API and Web and
leaving `COACH_DISABLED=1` unchanged. Validate:

```bash
docker compose --env-file stack/opengym.env -f stack/opengym-stack.yml config --quiet
```

Before Portainer write, state exactly:

- environment: Roddelkopf CH, Endpoint 6;
- stack: `opengym`;
- files: `stack/opengym-stack.yml` and `stack/opengym.env`;
- old and new immutable tags;
- action: full stack update;
- effect: replace API/Web containers with the reviewed build while preserving `/volume1/docker/opengym/data` and media mounts.

Wait for a fresh explicit `passt`.

- [ ] **Step 10: Deploy and verify production**

After approval, read the Portainer runbook and run the documented stack update with `--yes`. Verify:

1. `opengym-api` and `opengym-web` are running and healthy;
2. internal `http://100.88.17.50:7293/api/health` reports `ok: true` without exposing user counts;
3. external `https://gym.roddelkopf.net/api/health` reports healthy;
4. `https://gym.roddelkopf.net/#/library` shows `Reise-Krafttraining` and a new exercise opens with its vector animation;
5. existing passkey login, one existing GIF exercise, and one plan-add action still work;
6. logs contain no passkey, file, permission, media, or provider errors.

Document the backup archive identifier, old/new tags, health results, and rollback tag without including private data.
