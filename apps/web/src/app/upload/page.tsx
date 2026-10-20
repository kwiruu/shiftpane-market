import { checks } from '@shiftpane/format'
import type { Metadata } from 'next'
import { UploadPanel } from '@/components/account/upload-panel'
import { DefinitionCard, DefinitionRow, ListRow, RowText } from '@/components/site/list-group'
import { hasApi } from '@/lib/registry/gallery'

const description =
  'Upload a widget to the ShiftPane gallery: automated checks, review by a person, then it is listed.'

export const metadata: Metadata = {
  title: 'Publish a widget',
  description,
  alternates: { canonical: '/upload' },
}

/**
 * The upload page (PLAN, W3). The page is static; the upload itself happens in UploadPanel, which
 * talks to the API from the browser once you're signed in.
 */
export default function UploadPage() {
  return (
    <div className="frame flex flex-col pt-28 sm:pt-32">
      <div className="max-w-180">
        <header>
          <h1 className="text-headline-lg">Publish a widget</h1>
          <p className="mt-3 max-w-[44ch] text-body-lg text-secondary">
            Upload a widget package. It&apos;s checked at once, reviewed by a person, then listed
            for everyone.
          </p>
        </header>

        <section aria-label="Upload" className="mt-10 rounded-lg bg-surface p-6 sm:p-8">
          <UploadPanel enabled={hasApi} />
        </section>

        <div className="mt-3 flex flex-col gap-3">
          <DefinitionCard label="Before you upload">
            <DefinitionRow term="Zip the files">
              The package&apos;s files themselves, not the folder they&apos;re in, with your GitHub
              login as the manifest&apos;s author. The upload&apos;s report says what to fix.
            </DefinitionRow>
            <DefinitionRow term="Pick a license">
              Any OSI-approved license, with its LICENSE file in the package.
            </DefinitionRow>
            <DefinitionRow term="Ask for little">
              Every permission needs a reason your README gives. Secrets only go to the service that
              issued them.
            </DefinitionRow>
            <ListRow href="/docs/content-policy">Content policy</ListRow>
          </DefinitionCard>

          <DefinitionCard label="What we check">
            {checks.map((check) => (
              <DefinitionRow
                key={check.id}
                term={check.outcome === 'fail' ? 'Blocks the upload' : 'Goes to review'}
              >
                {check.title}
                {check.alwaysHuman && '. Always reviewed by a person.'}
              </DefinitionRow>
            ))}
            <ListRow href="/docs/permissions#how-review-works">How review works</ListRow>
          </DefinitionCard>

          <DefinitionCard label="Already published?">
            <ListRow href="/dashboard">
              <RowText
                title="Your widgets"
                detail="Every version you've uploaded, and where it is."
              />
            </ListRow>
            <ListRow href="/docs/publishing">
              <RowText title="Publishing" detail="Updates, permissions that change, and the CLI." />
            </ListRow>
            <ListRow href="/docs/making-widgets">
              <RowText title="Making widgets" detail="The package format, file by file." />
            </ListRow>
          </DefinitionCard>
        </div>
      </div>
    </div>
  )
}
