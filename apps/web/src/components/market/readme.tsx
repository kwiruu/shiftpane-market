import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

import { proseComponents } from '@/components/content/prose'

/**
 * A widget's README, in the docs' type styles. Markdown only: raw HTML in a README is shown as
 * text, never rendered, since it comes from the widget's author.
 */
export function Readme({ source }: { source: string }) {
  return (
    <Markdown remarkPlugins={[remarkGfm]} components={proseComponents} skipHtml>
      {source}
    </Markdown>
  )
}
