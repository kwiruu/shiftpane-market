export type Doc = {
  slug: string
  title: string
  description: string
}

export type DocGroup = { title: string; docs: Doc[] }

// Order here is the order in the sidebar and in the previous/next links.
// Each slug has a matching file in src/content/docs.
export const docGroups: DocGroup[] = [
  {
    title: 'Get started',
    docs: [
      {
        slug: 'install',
        title: 'Install ShiftPane',
        description: 'What you need, then build and run it. Windows needs one driver, once.',
      },
      {
        slug: 'pair-a-phone',
        title: 'Pair a phone',
        description: 'Scan the code, accept the certificate once, and pick the right network.',
      },
    ],
  },
  {
    title: 'Using ShiftPane',
    docs: [
      {
        slug: 'display-mode',
        title: 'Display mode and split view',
        description: 'The phone as a monitor, as a widget board, or both at once.',
      },
      {
        slug: 'widget-board',
        title: 'The widget board',
        description: 'Tables of widgets, and laying them out from the desktop window.',
      },
      {
        slug: 'devices',
        title: 'Devices',
        description: 'Paired phones, reconnecting, and forgetting a phone.',
      },
      {
        slug: 'troubleshooting',
        title: 'Troubleshooting',
        description:
          'A phone that won’t connect, a monitor that won’t appear, and the usual fixes.',
      },
    ],
  },
  {
    title: 'Making widgets',
    docs: [
      {
        slug: 'making-widgets',
        title: 'Making widgets',
        description: 'Three ways in, one package out, and how a widget gets its data.',
      },
      {
        slug: 'quickstart',
        title: 'Quickstart',
        description: 'From npm create to a widget on your phone, with the SDK and the CLI.',
      },
      {
        slug: 'widget-studio',
        title: 'Widget Studio',
        description: 'Make a widget in the desktop app without writing code, or from a sentence.',
      },
      {
        slug: 'views',
        title: 'Views',
        description: 'view.json: the components, bindings, and sizes that draw a widget.',
      },
      {
        slug: 'system-sources',
        title: 'System sources',
        description: 'The PC data the app reads and shares: CPU, GPU, media, and the rest.',
      },
      {
        slug: 'actions',
        title: 'Actions',
        description: 'Buttons on the phone that press media and volume keys on the PC.',
      },
      {
        slug: 'collectors',
        title: 'Collectors',
        description: 'Code that runs on the PC on a timer, in a sandbox, and returns JSON.',
      },
      {
        slug: 'permissions',
        title: 'Permissions and review',
        description: 'What a widget may touch, what installing asks, and how review works.',
      },
      {
        slug: 'publishing',
        title: 'Publishing',
        description: 'Validate, pack, and upload a widget, then what happens to it.',
      },
    ],
  },
  {
    title: 'Reference',
    docs: [
      {
        slug: 'manifest',
        title: 'manifest.json',
        description: 'Every field of a widget’s manifest.',
      },
      {
        slug: 'package-format',
        title: 'Package format',
        description: 'The files in a widget package, and the limits on them.',
      },
      {
        slug: 'how-it-works',
        title: 'How it works',
        description:
          'The desktop app, the native helper, the phone app, and what crosses between them.',
      },
    ],
  },
  {
    title: 'Policies',
    docs: [
      {
        slug: 'content-policy',
        title: 'Content policy',
        description: 'What a listed widget may and may not do, and how takedowns work.',
      },
      {
        slug: 'privacy',
        title: 'Privacy',
        description:
          'What ShiftPane and this site collect: video and widget data stay between your devices.',
      },
    ],
  },
]

export const docs: Doc[] = docGroups.flatMap((group) => group.docs)

export function getDoc(slug: string): Doc | undefined {
  return docs.find((doc) => doc.slug === slug)
}

export function getNeighbors(slug: string): { previous?: Doc; next?: Doc } {
  const index = docs.findIndex((doc) => doc.slug === slug)
  return { previous: docs[index - 1], next: docs[index + 1] }
}
