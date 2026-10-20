import type { Author, Widget } from '@shiftpane/format'
import { cache } from 'react'

import { authors as sampleAuthors, widgets as sampleWidgets } from './seed'

/**
 * The gallery: every listed widget and their authors. With `SHIFTPANE_API_ORIGIN` set it comes from
 * the registry API, refreshed in the background at most once a minute (pages using it export
 * `revalidate = 60`); if the API is down then, the last good copy keeps being served. Without it, the
 * site shows the seed, which is how `next dev` runs on its own.
 */

export const REVALIDATE_SECONDS = 60

export interface Gallery {
  widgets: Widget[]
  authors: Author[]
}

const apiOrigin = process.env.SHIFTPANE_API_ORIGIN?.replace(/\/$/, '')

async function fromApi<T>(path: string): Promise<T> {
  const response = await fetch(`${apiOrigin}/api/v1${path}`, {
    next: { revalidate: REVALIDATE_SECONDS },
  })
  if (!response.ok) throw new Error(`The registry API answered ${response.status} for ${path}`)
  return (await response.json()) as T
}

export const getGallery = cache(async (): Promise<Gallery> => {
  const { widgets, authors } = apiOrigin
    ? {
        widgets: (await fromApi<{ widgets: Widget[] }>('/widgets')).widgets,
        authors: (await fromApi<{ authors: Author[] }>('/authors')).authors,
      }
    : { widgets: sampleWidgets, authors: sampleAuthors }
  // Tiles show the author's name, and they render where there's no author list to look it up in.
  const names = new Map(authors.map((author) => [author.login, author.name]))
  return {
    widgets: widgets.map((widget) => ({ ...widget, authorName: names.get(widget.author) })),
    authors,
  }
})

export async function getWidgets(): Promise<Widget[]> {
  return (await getGallery()).widgets
}

export async function getWidget(id: string): Promise<Widget | undefined> {
  return (await getWidgets()).find((widget) => widget.id === id)
}

export async function getAuthors(): Promise<Author[]> {
  return (await getGallery()).authors
}

export async function getAuthor(login: string): Promise<Author | undefined> {
  return (await getAuthors()).find((author) => author.login === login)
}

export async function widgetsBy(login: string): Promise<Widget[]> {
  return (await getWidgets()).filter((widget) => widget.author === login)
}
