import type { MetadataRoute } from 'next'

import { docs } from '@/lib/docs'
import { updatedAt } from '@/lib/registry'
import { getAuthors, getWidgets } from '@/lib/registry/gallery'
import { site } from '@/lib/site'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Pages other than widgets change only when the site is rebuilt.
  const lastModified = new Date()
  const [widgets, authors] = await Promise.all([getWidgets(), getAuthors()])
  return [
    { url: site.url, lastModified, changeFrequency: 'weekly', priority: 1 },
    { url: `${site.url}/widgets`, lastModified, changeFrequency: 'daily', priority: 0.9 },
    ...widgets.map((widget) => ({
      url: `${site.url}/widgets/${widget.id}`,
      lastModified: new Date(`${updatedAt(widget)}T00:00:00Z`),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
    ...authors.map((author) => ({
      url: `${site.url}/authors/${author.login}`,
      lastModified,
      changeFrequency: 'weekly' as const,
      priority: 0.4,
    })),
    { url: `${site.url}/docs`, lastModified, changeFrequency: 'weekly', priority: 0.8 },
    ...docs.map((doc) => ({
      url: `${site.url}/docs/${doc.slug}`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
    { url: `${site.url}/upload`, lastModified, changeFrequency: 'monthly', priority: 0.5 },
  ]
}
