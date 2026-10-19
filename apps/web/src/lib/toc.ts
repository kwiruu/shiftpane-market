import { readFile } from 'node:fs/promises'
import path from 'node:path'

import { isValidElement, type ReactNode } from 'react'

export type Heading = { id: string; title: string; level: 2 | 3 }

/** "What Dev Pane asks for" → "what-dev-pane-asks-for". Used for heading ids and their links. */
export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

/** The plain text of rendered MDX children, so a heading's id matches the one computed from source. */
export function textOf(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(textOf).join('')
  if (isValidElement<{ children?: ReactNode }>(node)) return textOf(node.props.children)
  return ''
}

// Inline Markdown to plain text: `code`, **bold**, _em_, and [links](url).
function plain(markdown: string) {
  return markdown
    .replace(/`([^`]*)`/g, '$1')
    .replace(/\*\*([^*]*)\*\*/g, '$1')
    .replace(/[*_]([^*_]*)[*_]/g, '$1')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .trim()
}

/**
 * The ## and ### headings of a doc, read from its MDX source at build time (skipping code
 * fences). Headings written inside components, like <Step title>, aren't included.
 */
export async function getHeadings(slug: string): Promise<Heading[]> {
  const source = await readFile(path.join(process.cwd(), 'src/content/docs', `${slug}.mdx`), 'utf8')
  const headings: Heading[] = []
  let inFence = false

  for (const line of source.split(/\r?\n/)) {
    if (line.trimStart().startsWith('```')) {
      inFence = !inFence
      continue
    }
    if (inFence) continue
    const match = /^(##|###)\s+(.+)$/.exec(line)
    if (!match) continue
    const title = plain(match[2] ?? '')
    headings.push({ id: slugify(title), title, level: match[1] === '##' ? 2 : 3 })
  }

  return headings
}
