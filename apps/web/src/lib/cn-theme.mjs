// The DESIGN.md token names in globals.css, taught to the class merger. Without this,
// `text-body-sm` looks like a text color, so a later `text-secondary` would silently drop the size.
//
// `cn build` (run by withCn in next.config.ts) compiles these into src/lib/cn-tables.ts, fitted
// to the classes the project uses, so the browser never loads the merge compiler.
const cnTheme = {
  extend: {
    classGroups: {
      'font-size': [
        {
          text: [
            'headline-display',
            'headline-lg',
            'headline-md',
            'headline-sm',
            'body-lg',
            'body-md',
            'body-sm',
            'label-lg',
            'label-md',
            'label-sm',
            'micro',
            'code',
          ],
        },
      ],
      shadow: [{ shadow: ['menu', 'device'] }],
    },
  },
}

export default cnTheme
