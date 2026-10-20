import type { Widget } from '@shiftpane/format'
import { site } from '@/lib/site'

/**
 * Schema.org data for search engines, as JSON-LD in the page's markup. It repeats what the page
 * already says in words; nothing here is a claim the page doesn't make.
 */
function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // The object is ours, built at build time, and `<` is escaped so it can't close the tag.
      // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD has to be inline, and it is escaped
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  )
}

const operatingSystem = 'Windows, macOS, Linux'

/** The home page: what ShiftPane is, and the site it lives on. */
export function SiteStructuredData() {
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: site.name,
          url: site.url,
          description: site.description,
          applicationCategory: 'UtilitiesApplication',
          operatingSystem,
          softwareVersion: 'Early development',
          isAccessibleForFree: true,
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
          license: site.license.url,
          author: { '@type': 'Person', name: site.author },
          codeRepository: site.repo,
        }}
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: site.name,
          url: site.url,
          description: site.description,
          inLanguage: 'en',
          potentialAction: {
            '@type': 'SearchAction',
            target: `${site.url}/widgets/search?q={query}`,
            'query-input': 'required name=query',
          },
        }}
      />
    </>
  )
}

/** A documentation page, and the trail back to the documentation index. */
export function DocStructuredData({
  title,
  description,
  slug,
}: {
  title: string
  description: string
  slug: string
}) {
  const url = `${site.url}/docs/${slug}`
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'TechArticle',
          headline: title,
          description,
          url,
          inLanguage: 'en',
          author: { '@type': 'Person', name: site.author },
          isPartOf: { '@type': 'WebSite', name: site.name, url: site.url },
          about: { '@type': 'SoftwareApplication', name: site.name, operatingSystem },
        }}
      />
      <Breadcrumbs
        trail={[
          ['Documentation', `${site.url}/docs`],
          [title, url],
        ]}
      />
    </>
  )
}

/** A widget's page: a free add-on for ShiftPane, and the trail back to the gallery. */
export function WidgetStructuredData({ widget }: { widget: Widget }) {
  const url = `${site.url}/widgets/${widget.id}`
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: widget.name,
          description: widget.summary,
          url,
          applicationCategory: 'UtilitiesApplication',
          applicationSubCategory: 'ShiftPane widget',
          operatingSystem,
          softwareVersion: widget.versions[0]?.version,
          isAccessibleForFree: true,
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
          license: `https://spdx.org/licenses/${widget.license}.html`,
          author: { '@type': 'Person', name: widget.author },
        }}
      />
      <Breadcrumbs
        trail={[
          ['Widgets', `${site.url}/widgets`],
          [widget.name, url],
        ]}
      />
    </>
  )
}

function Breadcrumbs({ trail }: { trail: [name: string, url: string][] }) {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [[site.name, site.url], ...trail].map(([name, item], index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name,
          item,
        })),
      }}
    />
  )
}
