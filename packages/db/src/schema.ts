import type { CheckReport, Manifest, Permissions, WidgetView } from '@shiftpane/format'
import { sql } from 'drizzle-orm'
import {
  bigint,
  boolean,
  customType,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core'

/** The registry's tables (PLAN, "Data model"). pg-boss, when it comes, keeps its own schema. */

const bytea = customType<{ data: Uint8Array; driverData: Uint8Array }>({
  dataType: () => 'bytea',
})

const createdAt = () => timestamp('created_at', { withTimezone: true }).notNull().defaultNow()

export const userRole = pgEnum('user_role', ['author', 'reviewer', 'admin'])

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  /** Empty for the ShiftPane account that owns the first-party widgets. */
  githubId: bigint('github_id', { mode: 'number' }).unique(),
  login: text('login').notNull().unique(),
  name: text('name'),
  bio: text('bio'),
  avatarUrl: text('avatar_url'),
  role: userRole('role').notNull().default('author'),
  /** First-party: made by the ShiftPane project. May use reserved widget ids. */
  official: boolean('official').notNull().default(false),
  githubCreatedAt: timestamp('github_created_at', { withTimezone: true }),
  createdAt: createdAt(),
  bannedAt: timestamp('banned_at', { withTimezone: true }),
})

export const sessions = pgTable(
  'sessions',
  {
    /** sha256 of the token; the token itself is only ever in the cookie or the device's keychain. */
    id: text('id').primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    /** `browser` for the site's cookie, `device` for the desktop app and CLI. */
    kind: text('kind', { enum: ['browser', 'device'] }).notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    createdAt: createdAt(),
  },
  (table) => [index('sessions_user_idx').on(table.userId)],
)

export const widgetStatus = pgEnum('widget_status', ['live', 'yanked'])

export const widgets = pgTable('widgets', {
  /** The manifest id. */
  id: text('id').primaryKey(),
  ownerId: uuid('owner_id')
    .notNull()
    .references(() => users.id),
  /** From the newest approved manifest. */
  name: text('name').notNull(),
  summary: text('summary').notNull(),
  categories: text('categories').array().notNull().default(sql`'{}'::text[]`),
  status: widgetStatus('status').notNull().default('live'),
  yankReason: text('yank_reason'),
  /** How the gallery shows it: set by an admin, defaults otherwise. */
  featured: boolean('featured').notNull().default(false),
  icon: text('icon'),
  tone: text('tone', { enum: ['dark', 'light'] }),
  createdAt: createdAt(),
})

export const versionStatus = pgEnum('version_status', [
  'checking',
  'in_review',
  'approved',
  'rejected',
  'yanked',
])

/** The readable files of a package, kept so the site and the review queue never unzip. */
export interface VersionFiles {
  view: WidgetView
  sample: Record<string, unknown>
  collector?: string
  readme: string
  license: string
}

export const versions = pgTable(
  'versions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    widgetId: text('widget_id')
      .notNull()
      .references(() => widgets.id),
    version: text('version').notNull(),
    status: versionStatus('status').notNull().default('in_review'),
    manifest: jsonb('manifest').$type<Manifest>().notNull(),
    permissions: jsonb('permissions').$type<Permissions>().notNull(),
    files: jsonb('files').$type<VersionFiles>().notNull(),
    sha256: text('sha256').notNull(),
    size: integer('size').notNull(),
    /** The zip until it is published to storage; cleared after that. */
    package: bytea('package'),
    hasCollector: boolean('has_collector').notNull(),
    /** What changed, from the author. */
    notes: text('notes').notNull().default(''),
    report: jsonb('report').$type<CheckReport>().notNull(),
    submittedBy: uuid('submitted_by')
      .notNull()
      .references(() => users.id),
    submittedAt: timestamp('submitted_at', { withTimezone: true }).notNull().defaultNow(),
    publishedAt: timestamp('published_at', { withTimezone: true }),
    yankedAt: timestamp('yanked_at', { withTimezone: true }),
    yankReason: text('yank_reason'),
  },
  (table) => [
    // A rejected version number can be uploaded again; anything else is taken.
    uniqueIndex('versions_widget_version_idx')
      .on(table.widgetId, table.version)
      .where(sql`${table.status} <> 'rejected'`),
    index('versions_status_idx').on(table.status),
    index('versions_submitted_by_idx').on(table.submittedBy, table.submittedAt),
  ],
)

export const reviews = pgTable('reviews', {
  id: uuid('id').primaryKey().defaultRandom(),
  versionId: uuid('version_id')
    .notNull()
    .references(() => versions.id),
  reviewerId: uuid('reviewer_id')
    .notNull()
    .references(() => users.id),
  decision: text('decision', { enum: ['approve', 'reject'] }).notNull(),
  note: text('note').notNull().default(''),
  createdAt: createdAt(),
})

export const reports = pgTable(
  'reports',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    widgetId: text('widget_id')
      .notNull()
      .references(() => widgets.id),
    version: text('version'),
    reporterId: uuid('reporter_id').references(() => users.id),
    reason: text('reason', {
      enum: ['broken', 'misleading', 'privacy', 'malware', 'policy'],
    }).notNull(),
    body: text('body').notNull(),
    status: text('status', { enum: ['open', 'resolved'] })
      .notNull()
      .default('open'),
    createdAt: createdAt(),
  },
  (table) => [index('reports_status_idx').on(table.status, table.createdAt)],
)
