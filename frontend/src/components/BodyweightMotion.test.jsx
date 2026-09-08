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
