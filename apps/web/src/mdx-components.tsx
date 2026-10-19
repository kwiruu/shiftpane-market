import type { MDXComponents } from 'mdx/types'

import {
  ActionsTable,
  ArchitectureFlow,
  Callout,
  ChecksTable,
  CloneCommand,
  Planned,
  PlatformTable,
  RepoLink,
  Requirements,
  SourcesTable,
  Step,
  Steps,
} from '@/components/content/blocks'
import { proseComponents } from '@/components/content/prose'
import { Kbd } from '@/components/site/kbd'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

// Markdown in the docs maps to the DESIGN.md type styles. Required by @next/mdx.
const components: MDXComponents = {
  ...proseComponents,

  // Components the docs can use directly.
  Accordion: (props: React.ComponentProps<typeof Accordion>) => (
    <div className="my-5 rounded-lg px-5 shadow-[inset_0_0_0_1px_var(--color-border)]">
      <Accordion {...props} />
    </div>
  ),
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  ActionsTable,
  ArchitectureFlow,
  Callout,
  ChecksTable,
  CloneCommand,
  Kbd,
  Planned,
  PlatformTable,
  RepoLink,
  Requirements,
  SourcesTable,
  Step,
  Steps,
}

export function useMDXComponents(): MDXComponents {
  return components
}
