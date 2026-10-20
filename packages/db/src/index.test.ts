import { eq } from 'drizzle-orm'
import { describe, expect, it } from 'vitest'

import { connect, migrateDb, users, versions, widgets } from './index.ts'

describe('the schema on PGlite', () => {
  it('migrates, and lets a rejected version number be used again', async () => {
    const url = 'pglite:memory'
    const { db, close } = await connect(url)
    await migrateDb(db, url)
    const [user] = await db.insert(users).values({ login: 'octocat', githubId: 583231 }).returning()
    if (!user) throw new Error('no user')
    await db
      .insert(widgets)
      .values({ id: 'gpu-ring', ownerId: user.id, name: 'GPU ring', summary: 's' })
    const version = {
      widgetId: 'gpu-ring',
      version: '1.0.0',
      manifest: {} as never,
      permissions: { sources: [], actions: [], local: [], network: [], secrets: [] },
      files: { view: {}, sample: {}, readme: '', license: '' },
      sha256: 'a',
      size: 1,
      package: new Uint8Array([1, 2, 3]),
      hasCollector: false,
      report: {},
      submittedBy: user.id,
    }
    const [first] = await db
      .insert(versions)
      .values({ ...version, status: 'rejected' })
      .returning()
    await db.insert(versions).values(version)
    await expect(db.insert(versions).values(version)).rejects.toThrow()
    expect(first?.package).toEqual(new Uint8Array([1, 2, 3]))
    const rows = await db.select().from(versions).where(eq(versions.widgetId, 'gpu-ring'))
    expect(rows.map((row) => row.status).sort()).toEqual(['in_review', 'rejected'])
    await close()
  })
})
