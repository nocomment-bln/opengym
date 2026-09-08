import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

vi.mock('../store/useStore.js', () => ({
  useStore: selector => selector({ S: { gifSize: 'full' }, update: () => {} }),
}))

import Media, { Thumb } from './Media.jsx'

describe('Media', () => {
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
})
