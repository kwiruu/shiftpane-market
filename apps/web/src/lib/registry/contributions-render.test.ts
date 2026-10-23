import { ViewWidget } from '@shiftpane/board'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { expect, it } from 'vitest'
import { githubContributions } from './github-contributions'

it('uses bigger boxes without text on small and medium, and restores the detailed large calendar', () => {
  for (const size of ['small', 'medium', 'large'] as const) {
    const html = renderToStaticMarkup(
      createElement(ViewWidget, {
        view: githubContributions.view,
        size,
        context: { sample: githubContributions.sample, sources: {}, config: {} },
      }),
    )
    expect(html).toContain('2026-10-23:')
    expect(html).not.toContain('2026-10-24:')
    if (size === 'large') {
      expect(html).toContain('@octocat')
      expect(html).toContain('<text')
      expect(html).toContain('2,025')
    } else {
      expect(html).not.toContain('octocat')
      expect(html).not.toContain('<text')
      expect(html).not.toContain('<p')
      expect(html).not.toContain('<title')
      expect(html.match(/<rect /g)).toHaveLength(size === 'small' ? 55 : 83)
    }
  }
})
