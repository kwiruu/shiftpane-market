'use client'

import { CopyButton } from '@/components/site/copy-button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { PackageFile } from '@/lib/registry/package'

/**
 * The package's readable files, one tab each (DESIGN.md, Source viewer): what a reviewer reads,
 * and what runs. Code wells like the docs', scrolling on their own past a screenful.
 */
export function SourceViewer({ files }: { files: PackageFile[] }) {
  const first = files[0]?.name
  if (!first) return null
  return (
    <Tabs defaultValue={first} className="gap-4">
      <TabsList aria-label="Files">
        {files.map((file) => (
          <TabsTrigger key={file.name} value={file.name} className="font-mono">
            {file.name}
          </TabsTrigger>
        ))}
      </TabsList>
      {files.map((file) => (
        <TabsContent key={file.name} value={file.name}>
          <div className="relative rounded-md bg-muted text-on-surface">
            <div className="flex items-center justify-between gap-3 px-4 pt-3">
              <span className="text-label-sm text-secondary">
                {file.content.split('\n').length - 1} lines
              </span>
              <CopyButton text={file.content} />
            </div>
            <pre
              data-lenis-prevent
              className="slim-scroll max-h-[520px] overflow-auto px-4 pt-2 pb-4 text-code whitespace-pre"
            >
              <code>{file.content}</code>
            </pre>
          </div>
        </TabsContent>
      ))}
    </Tabs>
  )
}
