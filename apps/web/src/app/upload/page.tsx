import { FileArchive } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'

import { Step, Steps } from '@/components/content/blocks'
import { GitHubIcon } from '@/components/site/brand-icons'
import { CodeBlock } from '@/components/site/code-block'
import { DefinitionCard, DefinitionRow, ListRow, RowText } from '@/components/site/list-group'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { checks } from '@/lib/registry/checks'

const description =
  'Upload a widget to the ShiftPane gallery: automated checks, review by a person, then it is listed.'

export const metadata: Metadata = {
  title: 'Publish a widget',
  description,
  alternates: { canonical: '/upload' },
}

/**
 * The upload page (PLAN, W3). Uploads need GitHub sign-in and the API, so until they exist the page
 * shows the flow with its controls turned off, and says so.
 */
export default function UploadPage() {
  return (
    <div className="frame flex flex-col pt-28 sm:pt-32">
      <div className="max-w-180">
        <header>
          <Badge live variant="outline" className="mb-5">
            Sign-in isn&apos;t open yet
          </Badge>
          <h1 className="text-headline-lg">Publish a widget</h1>
          <p className="mt-3 max-w-[44ch] text-body-lg text-secondary">
            Upload a widget package. It&apos;s checked at once, reviewed by a person, then listed
            for everyone.
          </p>
        </header>

        <section aria-label="Upload" className="mt-10 rounded-lg bg-surface p-6 sm:p-8">
          <Steps>
            <Step title="Sign in with GitHub">
              <p>Your GitHub account is your author name, and where reviewers can reach you.</p>
              <Button disabled className="mt-1 gap-2">
                <GitHubIcon />
                Sign in with GitHub
              </Button>
            </Step>
            <Step title="Upload the package">
              <p>
                The zip{' '}
                <code className="font-mono text-code text-on-surface">shiftpane-widget pack</code>{' '}
                makes, at most 1 MB. Or share it straight from the desktop app.
              </p>
              <div
                aria-disabled="true"
                className="mt-1 flex flex-col items-center gap-2 rounded-md bg-muted px-6 py-10 text-center opacity-60"
              >
                <FileArchive
                  aria-hidden="true"
                  strokeWidth={1.5}
                  className="size-8 text-secondary"
                />
                <p className="text-body-md text-on-surface">Drop your widget&apos;s .zip here</p>
                <p className="text-body-sm">Opens once you&apos;re signed in.</p>
              </div>
            </Step>
            <Step title="Read the report">
              <p>
                The checks run as soon as the upload lands. Fix anything that fails and upload
                again; anything flagged goes to the reviewer with your notes.
              </p>
            </Step>
          </Steps>
        </section>

        <div className="mt-3 flex flex-col gap-3">
          <DefinitionCard label="Before you upload">
            <DefinitionRow term="Run the checks">
              <CodeBlock label="Terminal" code="npx shiftpane-widget validate" />
              <p className="mt-3">The same checks the gallery runs, on your own machine.</p>
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
          </DefinitionCard>
        </div>

        <p className="mt-6 text-body-sm text-secondary">
          Until uploads open,{' '}
          <Link
            href="/docs/making-widgets"
            className="text-on-surface underline decoration-border underline-offset-4 hover:decoration-current"
          >
            Making widgets
          </Link>{' '}
          describes the format they&apos;ll take.
        </p>
      </div>
    </div>
  )
}
