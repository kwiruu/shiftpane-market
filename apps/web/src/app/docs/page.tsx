import type { Metadata } from 'next'

import { DefinitionCard, ListRow, RowText } from '@/components/site/list-group'
import { docGroups } from '@/lib/docs'
import { slugify } from '@/lib/toc'

export const metadata: Metadata = {
  title: 'Documentation',
  description: 'Install ShiftPane, pair a phone, and make and publish widgets.',
  alternates: { canonical: '/docs' },
  openGraph: {
    type: 'website',
    title: 'Documentation',
    description: 'Install ShiftPane, pair a phone, and make and publish widgets.',
    url: '/docs',
  },
}

export default function DocsIndex() {
  return (
    <div className="max-w-180">
      <header>
        <h1 className="text-headline-lg">Documentation</h1>
        <p className="mt-3 max-w-[40ch] text-body-lg text-secondary">
          How to install ShiftPane, pair a phone, and make your own widgets. New here? Start with
          Install ShiftPane.
        </p>
      </header>
      <div className="mt-10 flex flex-col gap-3">
        {docGroups.map((group) => (
          <DefinitionCard key={group.title} id={slugify(group.title)} label={group.title}>
            {group.docs.map((doc) => (
              <ListRow key={doc.slug} href={`/docs/${doc.slug}`}>
                <RowText title={doc.title} detail={doc.description} />
              </ListRow>
            ))}
          </DefinitionCard>
        ))}
      </div>
    </div>
  )
}
