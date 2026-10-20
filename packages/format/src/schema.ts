import { z } from 'zod'

import {
  actionNames,
  type ConfigField,
  categories,
  type Manifest,
  sourceNames,
  type ViewNode,
  type WidgetView,
  widgetSizes,
} from './types.ts'

/**
 * zod schemas for the files in a widget package (PLAN, "Widget package format (v1)"). The checks
 * parse uploads with these; the hand-written types in `types.ts` are what the rest of the code
 * reads, and the annotations below keep the two in step. They move to `@shiftpane/widget-sdk` once
 * the app's SDK carries the v1 format.
 */

const Kebab = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'use lowercase-kebab-case')
const SecretName = z.string().regex(/^[A-Z][A-Z0-9_]*$/, 'use UPPER_SNAKE_CASE')
const Semver = z.string().regex(/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/, 'use semver, e.g. 1.0.0')

/** A bare hostname (`api.github.com`) or one leading wildcard label (`*.example.com`). */
const Host = z
  .string()
  .max(253)
  .regex(
    /^(\*\.)?([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/,
    'use a hostname such as api.github.com, without scheme, port or path',
  )

/** An app on this PC or LAN: an exact host and port, such as `127.0.0.1:8085`. */
const LocalHost = z
  .string()
  .max(260)
  .regex(
    /^(?:\[[0-9a-fA-F:]+\]|[a-z0-9](?:[a-z0-9.-]{0,251}[a-z0-9])?):\d{1,5}$/,
    'use host:port, such as 127.0.0.1:8085',
  )
  .refine((value) => {
    const port = Number(value.slice(value.lastIndexOf(':') + 1))
    return port >= 1 && port <= 65_535
  }, 'the port has to be between 1 and 65535')

const ConfigFieldBase = {
  key: z.string().regex(/^[a-zA-Z][a-zA-Z0-9]*$/, 'use camelCase'),
  label: z.string().min(1).max(64),
  help: z.string().max(256).optional(),
  required: z.boolean().optional(),
}

export const configFieldSchema: z.ZodType<ConfigField> = z.discriminatedUnion('type', [
  z
    .object({ ...ConfigFieldBase, type: z.literal('string'), default: z.string().optional() })
    .strict(),
  z
    .object({
      ...ConfigFieldBase,
      type: z.literal('number'),
      default: z.number().optional(),
      min: z.number().optional(),
      max: z.number().optional(),
    })
    .strict(),
  z
    .object({ ...ConfigFieldBase, type: z.literal('boolean'), default: z.boolean().optional() })
    .strict(),
  z
    .object({
      ...ConfigFieldBase,
      type: z.literal('select'),
      options: z
        .array(z.object({ value: z.string().max(64), label: z.string().max(64) }).strict())
        .min(1)
        .max(32),
      default: z.string().optional(),
    })
    .strict(),
])

export const permissionsSchema = z
  .object({
    sources: z.array(z.enum(sourceNames)).max(sourceNames.length).default([]),
    actions: z.array(z.enum(actionNames)).max(actionNames.length).default([]),
    local: z.array(LocalHost).max(8).default([]),
    network: z.array(Host).max(16).default([]),
    secrets: z.array(SecretName).max(8).default([]),
  })
  .strict()

export const manifestSchema: z.ZodType<Manifest, unknown> = z
  .object({
    $schema: z.string().optional(),
    id: Kebab.max(64),
    name: z.string().min(1).max(48),
    description: z.string().min(1).max(280),
    version: Semver,
    /** The author's GitHub login. */
    author: z.string().min(1).max(64),
    /** An SPDX id; the checks hold it against the OSI-approved list. */
    license: z.string().min(1).max(64),
    repository: z
      .url({ protocol: /^https$/ })
      .max(512)
      .optional(),
    categories: z.array(z.enum(categories)).min(1).max(3),
    minAppVersion: Semver,
    sizes: z.array(z.enum(widgetSizes)).min(1).max(widgetSizes.length),
    /** Seconds between collector runs. */
    refreshSeconds: z.number().int().min(1).max(86_400).optional(),
    permissions: permissionsSchema.default({
      sources: [],
      actions: [],
      local: [],
      network: [],
      secrets: [],
    }),
    config: z.array(configFieldSchema).max(16).default([]),
  })
  .strict()
  .superRefine((manifest, ctx) => {
    const unique = (path: string, values: readonly string[]) => {
      for (const [index, value] of values.entries()) {
        if (values.indexOf(value) !== index) {
          ctx.addIssue({
            code: 'custom',
            path: path.split('.'),
            message: `"${value}" is listed twice`,
          })
        }
      }
    }
    unique('sizes', manifest.sizes)
    unique('categories', manifest.categories)
    unique(
      'config',
      manifest.config.map((field) => field.key),
    )
    for (const [kind, values] of Object.entries(manifest.permissions)) {
      unique(`permissions.${kind}`, values)
    }
  })

/** `@name/json/pointer` for a system source, `/json/pointer` for the collector's output. */
const Bind = z
  .string()
  .min(1)
  .max(256)
  .regex(
    /^(?:@[a-z-]+(?:\/.*)?|\/.*)$/,
    'bind a source as @name/path, or the collector output as /path',
  )
const Text = z.string().max(120)
const Accent = z.enum(['flame', 'lime', 'mint', 'sky', 'ink'])
const IconName = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'use an icon name such as star')
  .max(48)

export const viewNodeSchema: z.ZodType<ViewNode> = z.lazy(() =>
  z.discriminatedUnion('type', [
    z
      .object({
        type: z.literal('stack'),
        children: z.array(viewNodeSchema).max(24),
        gap: z.number().min(0).max(12).optional(),
        align: z.enum(['start', 'center', 'end', 'between']).optional(),
      })
      .strict(),
    z
      .object({
        type: z.literal('row'),
        children: z.array(viewNodeSchema).max(24),
        gap: z.number().min(0).max(12).optional(),
        align: z.enum(['start', 'center', 'end', 'between']).optional(),
        inset: z.boolean().optional(),
      })
      .strict(),
    z
      .object({
        type: z.literal('grid'),
        columns: z.number().int().min(1).max(6),
        children: z.array(viewNodeSchema).max(24),
        gap: z.number().min(0).max(12).optional(),
      })
      .strict(),
    z.object({ type: z.literal('label'), text: Text }).strict(),
    z
      .object({
        type: z.literal('text'),
        text: Text.optional(),
        bind: Bind.optional(),
        size: z.enum(['xs', 'sm', 'md', 'lg']).optional(),
        muted: z.boolean().optional(),
      })
      .strict(),
    z
      .object({
        type: z.literal('value'),
        bind: Bind,
        format: z
          .enum(['percent', 'number', 'compact', 'bytes', 'rate', 'celsius', 'duration'])
          .optional(),
        unit: z.string().max(12).optional(),
        size: z.enum(['sm', 'md', 'lg', 'xl']).optional(),
      })
      .strict(),
    z
      .object({
        type: z.literal('ring'),
        bind: Bind,
        label: Text.optional(),
        color: Accent.optional(),
        size: z.enum(['sm', 'fill']).optional(),
        unit: z.boolean().optional(),
      })
      .strict(),
    z
      .object({
        type: z.literal('meter'),
        bind: Bind,
        segments: z.number().int().min(1).max(40).optional(),
      })
      .strict(),
    z.object({ type: z.literal('progress'), bind: Bind, color: Accent.optional() }).strict(),
    z
      .object({
        type: z.literal('history-bars'),
        bind: Bind,
        max: z.number().positive().optional(),
        count: z.number().int().min(2).max(120).optional(),
      })
      .strict(),
    z.object({ type: z.literal('sparkline'), bind: Bind, color: Accent.optional() }).strict(),
    z
      .object({
        type: z.literal('list'),
        bind: Bind,
        max: z.number().int().min(1).max(20).optional(),
      })
      .strict(),
    z.object({ type: z.literal('icon'), name: IconName, color: Accent.optional() }).strict(),
    z
      .object({
        type: z.literal('button'),
        action: z.enum(actionNames),
        icon: IconName,
        label: Text,
      })
      .strict(),
    z.object({ type: z.literal('divider') }).strict(),
    z
      .object({
        type: z.literal('cover'),
        bind: Bind.optional(),
        icon: IconName,
        size: z.enum(['sm', 'md']).optional(),
      })
      .strict(),
    z.object({ type: z.literal('equalizer') }).strict(),
    z
      .object({
        type: z.literal('glow'),
        color: Accent.optional(),
        corner: z.enum(['top-right', 'bottom-right']).optional(),
      })
      .strict(),
  ]),
)

export const widgetViewSchema: z.ZodType<WidgetView, unknown> = z
  .object({
    small: viewNodeSchema.optional(),
    medium: viewNodeSchema.optional(),
    large: viewNodeSchema.optional(),
  })
  .strict()
  .refine((view) => Object.keys(view).length > 0, 'view.json needs a tree for at least one size')

/** `sample.json`: an example of the collector's output. Any JSON object. */
export const sampleSchema = z.record(z.string(), z.unknown())
