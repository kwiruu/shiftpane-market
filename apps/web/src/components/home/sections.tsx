import { CodeBlock } from '@/components/site/code-block'
import { DefinitionCard, DefinitionRow, ListRow } from '@/components/site/list-group'
import { Badge } from '@/components/ui/badge'
import { site } from '@/lib/site'

/** Marks something the plan describes but the app doesn't do yet. */
export function Planned() {
  return (
    <Badge variant="muted" className="ml-2 h-5 px-2 align-[0.15em] text-label-sm">
      Planned
    </Badge>
  )
}

/** Everything below the showcase: definition cards, like a spec sheet. */
export function Definitions() {
  return (
    <div className="column mt-28 flex flex-col gap-3">
      <DefinitionCard id="what-it-does" label="What it does" data-cursor="One app, three modes">
        <DefinitionRow term="Display mode">
          The phone becomes a real extra monitor. Your OS sees a new display sized to the phone, and
          you drag windows onto it.
        </DefinitionRow>
        <DefinitionRow term="Widget board">
          The phone shows widgets: PC stats, what&apos;s playing, your repositories, and anything
          the community builds.
        </DefinitionRow>
        <DefinitionRow term="Split view">
          Both at once. The split you pick sets the size of the second monitor.
        </DefinitionRow>
        <DefinitionRow term="No app store">
          The phone app is a web app the PC serves over your Wi-Fi. Scan a code, and it&apos;s
          there.
        </DefinitionRow>
        <ListRow href="/docs/display-mode">Display mode and split view</ListRow>
      </DefinitionCard>

      <DefinitionCard
        id="make-a-widget"
        label="Make a widget"
        data-cursor="Three ways in, one package out"
      >
        <DefinitionRow
          term={
            <>
              Widget Studio
              <Planned />
            </>
          }
        >
          Pick a source, pick a component, and watch it live on your phone. No code.
        </DefinitionRow>
        <DefinitionRow
          term={
            <>
              Describe it
              <Planned />
            </>
          }
        >
          Say what you want in a sentence; the generator makes it and opens it in Widget Studio to
          adjust.
        </DefinitionRow>
        <DefinitionRow
          term={
            <>
              SDK and CLI
              <Planned />
            </>
          }
        >
          <CodeBlock label="Terminal" code="npm create shiftpane-widget@latest" />
          <p className="mt-3">
            Templates for PC data, web APIs, apps on your PC and phone-only widgets, with live
            reload on your paired phone.
          </p>
        </DefinitionRow>
        <DefinitionRow term="One package">
          All three make the same small folder, so anything you make can be shared here.
        </DefinitionRow>
        <ListRow href="/docs/making-widgets">Making widgets</ListRow>
      </DefinitionCard>

      <DefinitionCard id="safety" label="Safe by design" data-cursor="Reviewed before it's listed">
        <DefinitionRow term="Nothing runs on the phone">
          A widget&apos;s view is JSON drawn with ShiftPane&apos;s own components. No third-party
          code ever runs on your phone.
        </DefinitionRow>
        <DefinitionRow term="A sandbox on the PC">
          Collectors run in a WebAssembly sandbox with no files, no processes, and a fetch that only
          reaches the hosts they declared.
        </DefinitionRow>
        <DefinitionRow term="Permissions in plain words">
          Installing says what a widget can do: &ldquo;Reads your GPU load. Can reach
          api.github.com.&rdquo; An update that asks for more asks again.
        </DefinitionRow>
        <DefinitionRow term="Reviewed, then signed">
          Automated checks, then a person, before anything is listed. The app refuses a package
          whose signature or hash doesn&apos;t match.
        </DefinitionRow>
        <ListRow href="/docs/permissions">Permissions and review</ListRow>
      </DefinitionCard>

      <DefinitionCard id="how-it-works" label="How it works" data-cursor="Nothing in the cloud">
        <DefinitionRow term="Desktop app">
          Pairs with phones, serves them the phone app, and runs widget collectors. The only process
          that talks to the phone.
        </DefinitionRow>
        <DefinitionRow term="Native helper">
          A small Rust program, and the only one that talks to the OS: it creates the virtual
          monitor and reads the PC&apos;s stats.
        </DefinitionRow>
        <DefinitionRow term="Phone app">
          A web app you can add to the home screen. It plays the monitor&apos;s video and draws the
          widget board.
        </DefinitionRow>
        <DefinitionRow term="What leaves your PC">
          Video of the virtual monitor, and finished widget data, to your phone only. Secrets and
          system access stay on the PC.
        </DefinitionRow>
        <ListRow href="/docs/how-it-works">How it works, in detail</ListRow>
      </DefinitionCard>

      <DefinitionCard id="platforms" label="Platforms" data-cursor="Three OSes, one app">
        <DefinitionRow term="Windows">
          Virtual Display Driver, installed once with winget. Installer: .exe.
        </DefinitionRow>
        <DefinitionRow term="macOS">
          Built in from macOS 11, no driver. Installer: .dmg.
        </DefinitionRow>
        <DefinitionRow term="Linux">
          GNOME, KDE, wlroots compositors and X11. AppImage and .deb.
        </DefinitionRow>
        <DefinitionRow term="Phones and tablets">
          iPhone, iPad and Android, in the browser they already have.
        </DefinitionRow>
        <ListRow href="/docs/install">Install ShiftPane</ListRow>
      </DefinitionCard>

      <DefinitionCard id="license" label="Open source" data-cursor="MIT, like the widget format">
        <DefinitionRow term="The app">
          ShiftPane, its SDK and the widget format are MIT licensed.
        </DefinitionRow>
        <DefinitionRow term="Every widget">
          Ships readable source under an OSI-approved license. No minified or obfuscated code.
        </DefinitionRow>
        <DefinitionRow term="No lock-in">
          The app loads widgets from a folder too, so this gallery is the default, not the only way.
        </DefinitionRow>
        <ListRow href={site.repo}>ShiftPane on GitHub</ListRow>
      </DefinitionCard>
    </div>
  )
}
