import { ChevronRight } from 'lucide-react'

import { CodeBlock } from '@/components/site/code-block'
import { DefinitionCard, DefinitionRow } from '@/components/site/list-group'
import { checks } from '@/lib/registry/checks'
import { actions, sources } from '@/lib/registry/sources'
import { actionNames, sourceNames } from '@/lib/registry/types'
import { repoFile, site } from '@/lib/site'
import { cn } from '@/lib/utils'

// Blocks the MDX docs use (through mdx-components). They sit inside the white docs card, so
// they're muted wells rather than white cards. The reference tables read the same data the
// marketplace does, so the docs can't drift from it.

/** A link into the ShiftPane repository: a file with `path`, the issues page with `issues`, or the repository. */
export function RepoLink({
  path,
  issues,
  children,
}: {
  path?: string
  issues?: boolean
  children: React.ReactNode
}) {
  return (
    <a
      href={path ? repoFile(path) : issues ? `${site.repo}/issues` : site.repo}
      className="underline decoration-border decoration-1 underline-offset-4 transition-colors hover:decoration-current"
    >
      {children}
    </a>
  )
}

/** The clone command, built from the repository URL in lib/site.ts (the folder is its last part). */
export function CloneCommand() {
  const folder = site.repo.split('/').pop()
  return <CodeBlock label="Terminal" code={`git clone ${site.repo}.git\ncd ${folder}`} />
}

/** The requirements list. The doc's own heading introduces it, so the well has no label. */
export function Requirements() {
  return (
    <DefinitionCard inset>
      <DefinitionRow term="Node.js 22.12+">
        For the desktop app, the phone app and the build.
      </DefinitionRow>
      <DefinitionRow term="pnpm 10">
        Run <code className="font-mono text-code">corepack enable</code> once and Node provides it.
      </DefinitionRow>
      <DefinitionRow term="Rust, stable">
        For the native helper. The repository pins the toolchain in{' '}
        <code className="font-mono text-code">rust-toolchain.toml</code>.
      </DefinitionRow>
      <DefinitionRow term="A phone or tablet">
        On the same Wi-Fi as the PC, with a current browser.
      </DefinitionRow>
    </DefinitionCard>
  )
}

/** The virtual monitor on each OS (ShiftPane README, Platform support). */
export function PlatformTable() {
  return (
    <DefinitionCard inset label="The virtual monitor">
      <DefinitionRow term="Windows">
        Virtual Display Driver, which you install once. ShiftPane never bundles it.
      </DefinitionRow>
      <DefinitionRow term="macOS">Built in from macOS 11. Nothing to install.</DefinitionRow>
      <DefinitionRow term="Linux">
        Depends on the desktop: GNOME, KDE, wlroots compositors, or X11.
      </DefinitionRow>
    </DefinitionCard>
  )
}

const flow = [
  {
    kicker: 'Your phone',
    title: 'Phone app',
    text: 'A web app the PC serves. Plays the monitor and draws the widget board.',
  },
  {
    kicker: 'Desktop app',
    title: 'Electron',
    text: 'Pairs phones, runs widget collectors, and captures only the virtual monitor.',
  },
  {
    kicker: 'Native helper',
    title: 'shiftpane-helper',
    text: 'The only process that talks to the OS: the virtual monitor, stats and media keys.',
    mono: true,
  },
  {
    kicker: 'Your OS',
    title: 'Display and stats',
    text: 'A virtual display driver or API, performance counters, and media sessions.',
  },
]

/** How the pieces talk: four steps, left to right on wide screens. */
export function ArchitectureFlow() {
  return (
    <ol
      aria-label="How ShiftPane fits together"
      className="my-5 flex flex-col gap-2 lg:flex-row lg:items-stretch"
    >
      {flow.map((step, index) => (
        <li key={step.title} className="flex flex-col gap-2 lg:flex-1 lg:flex-row lg:items-center">
          <div className="flex h-full flex-col gap-1 rounded-lg bg-muted p-4">
            <p className="text-label-sm text-secondary uppercase">
              {index + 1}. {step.kicker}
            </p>
            <p
              className={cn(
                'text-body-md break-words',
                step.mono && 'font-mono text-code font-semibold',
              )}
            >
              {step.title}
            </p>
            <p className="text-body-sm text-secondary">{step.text}</p>
          </div>
          {index < flow.length - 1 && (
            <ChevronRight
              aria-hidden="true"
              strokeWidth={1.75}
              className="mx-auto size-4 flex-none rotate-90 text-secondary lg:rotate-0"
            />
          )}
        </li>
      ))}
    </ol>
  )
}

/** Every system source, from the same list the marketplace's permission prompts use. */
export function SourcesTable() {
  return (
    <DefinitionCard inset label="Sources">
      {sourceNames.map((name) => (
        <DefinitionRow
          key={name}
          term={
            <span className="flex flex-col">
              <code className="font-mono text-code">{name}</code>
              {sources[name].asks && (
                <span className="text-body-sm text-secondary">Asks first</span>
              )}
            </span>
          }
        >
          {sources[name].gives}
        </DefinitionRow>
      ))}
    </DefinitionCard>
  )
}

/** Every action a button can fire. */
export function ActionsTable() {
  return (
    <DefinitionCard inset label="Actions">
      {actionNames.map((name) => (
        <DefinitionRow key={name} term={<code className="font-mono text-code">{name}</code>}>
          {actions[name].phrase}.
        </DefinitionRow>
      ))}
    </DefinitionCard>
  )
}

/** The automated checks every upload goes through. */
export function ChecksTable() {
  return (
    <DefinitionCard inset label="Automated checks">
      {checks.map((check) => (
        <DefinitionRow
          key={check.id}
          term={check.outcome === 'fail' ? 'Blocks the upload' : 'Goes to the reviewer'}
        >
          {check.title}
          {check.alwaysHuman && '. Always reviewed by a person.'}
        </DefinitionRow>
      ))}
    </DefinitionCard>
  )
}

/** Numbered steps for the docs. Each child Step is one step. */
export function Steps({ children }: { children: React.ReactNode }) {
  return <ol className="my-6 space-y-7 [counter-reset:step]">{children}</ol>
}

export function Step({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <li className="relative pl-11 [counter-increment:step]">
      <span
        aria-hidden="true"
        className="absolute top-0 left-0 grid size-7 place-items-center rounded-full bg-primary text-label-md text-surface before:content-[counter(step)]"
      />
      <h3 className="pt-0.5 font-sans text-body-md font-semibold">{title}</h3>
      <div className="mt-2 space-y-3 text-body-md text-secondary [&_p]:my-0 [&_p]:text-secondary">
        {children}
      </div>
    </li>
  )
}

/** A quiet note inside a doc, marked with the accent dot. */
export function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-6 flex gap-3 rounded-md bg-muted p-4 text-body-md text-on-surface first:mt-0 [&_p]:my-0">
      <span aria-hidden="true" className="mt-2.5 size-1.5 flex-none rounded-full bg-accent" />
      <div className="min-w-0">{children}</div>
    </div>
  )
}

/** Says, at the top of a page, that what it describes is designed but not built yet. */
export function Planned({ children }: { children?: React.ReactNode }) {
  return (
    <Callout>
      <p>
        <strong className="font-semibold">Planned.</strong>{' '}
        {children ??
          'This describes how it will work. It isn’t in the app yet, and details may change before it is.'}
      </p>
    </Callout>
  )
}
