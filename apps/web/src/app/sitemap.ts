import type { MetadataRoute } from 'next'

import { docs } from '@/lib/docs'
import { getAuthors, getWidgets, updatedAt } from '@/lib/registry'
import { site } from '@/lib/site'

export default function sitemap(): MetadataRoute.Sitemap {
  // The build is the last time anything here could have changed.
  const lastModified = new Date()
  return [
    { url: site.url, lastModified, changeFrequency: 'weekly', priority: 1 },
    { url: `${site.url}/widgets`, lastModified, changeFrequency: 'daily', priority: 0.9 },
    ...getWidgets().map((widget) => ({
      url: `${site.url}/widgets/${widget.id}`,
      lastModified: new Date(`${updatedAt(widget)}T00:00:00Z`),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
    ...getAuthors().map((author) => ({
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
