import type { MDXComponents } from 'mdx/types'
import Link from 'next/link'
import { isValidElement } from 'react'

import { CodeBlock } from '@/components/site/code-block'
import { slugify, textOf } from '@/lib/toc'

import { Callout } from './blocks'

const languageLabels: Record<string, string> = {
  bash: 'Terminal',
  sh: 'Terminal',
  shell: 'Terminal',
  powershell: 'PowerShell',
  json: 'JSON',
  jsonc: 'JSON',
  js: 'JavaScript',
  javascript: 'JavaScript',
  ts: 'TypeScript',
  text: '',
}

const linkClass =
  'underline decoration-border decoration-1 underline-offset-4 transition-colors hover:decoration-current'

/**
 * Markdown elements in the DESIGN.md type styles: the docs' MDX and widgets' READMEs both render
 * through these, so a README reads like a doc page.
 */
export const proseComponents = {
  // Ids match the ones lib/toc.ts reads from the source, so "On this page" can link to them.
  h2: ({ children, ...props }) => (
    <h2
      id={slugify(textOf(children))}
      className="mt-10 mb-3 text-headline-sm first:mt-0"
      {...props}
    >
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3
      id={slugify(textOf(children))}
      className="mt-7 mb-2 font-sans text-body-md font-semibold first:mt-0"
      {...props}
    >
      {children}
    </h3>
  ),
  p: (props) => <p className="my-4 text-body-md text-on-surface first:mt-0 last:mb-0" {...props} />,
  ul: (props) => (
    <ul className="my-4 list-disc space-y-2 pl-5 text-body-md marker:text-secondary" {...props} />
  ),
  ol: (props) => (
    <ol
      className="my-4 list-decimal space-y-2 pl-5 text-body-md marker:text-secondary"
      {...props}
    />
  ),
  strong: (props) => <strong className="font-semibold" {...props} />,
  a: ({ href = '', ...props }) =>
    href.startsWith('/') ? (
      <Link href={href} className={linkClass} {...props} />
    ) : (
      <a href={href} className={linkClass} {...props} />
    ),
  code: (props) => <code className="rounded-sm bg-muted px-1 font-mono text-[0.9em]" {...props} />,
  pre: ({ children }) => {
    const code = isValidElement<{ children?: unknown; className?: string }>(children)
      ? children.props
      : undefined
    const language = code?.className?.replace('language-', '') ?? ''
    return (
      <CodeBlock
        code={typeof code?.children === 'string' ? code.children : ''}
        label={languageLabels[language] ?? language}
        className="my-5"
      />
    )
  },
  table: (props) => (
    <div data-lenis-prevent className="my-5 overflow-x-auto rounded-lg bg-muted">
      <table className="w-full border-collapse text-left text-body-sm" {...props} />
    </div>
  ),
  th: (props) => (
    <th className="px-4 pt-4 pb-2 align-bottom text-label-sm text-secondary uppercase" {...props} />
  ),
  td: (props) => <td className="border-t border-border px-4 py-3 align-top" {...props} />,
  hr: () => <hr className="my-8 border-tertiary" />,
  blockquote: ({ children }) => <Callout>{children}</Callout>,
} satisfies MDXComponents
