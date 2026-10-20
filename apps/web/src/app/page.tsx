import type { Widget } from '@shiftpane/format'
import type { Metadata } from 'next'
import { Hero } from '@/components/home/hero'
import { Definitions } from '@/components/home/sections'
import { Rail, Showcase } from '@/components/home/showcase'
import { SplitView } from '@/components/home/split-view'
import { SiteStructuredData } from '@/components/site/structured-data'
import { getWidget } from '@/lib/registry'

export const metadata: Metadata = {
  alternates: { canonical: '/' },
}

const splitWidgets = ['gpu-ring', 'pc-busy', 'hardware-temps', 'github-stars']
  .map((id) => getWidget(id))
  .filter((widget): widget is Widget => widget !== undefined)

export default function Home() {
  return (
    <>
      <SiteStructuredData />
      {/* The hero and the devices share one scroll stage */}
      <Hero />
      <div className="relative">
        <Rail />
        <Showcase />
        {/* Then both at once: part monitor, part widgets. */}
        <section aria-labelledby="split-title" className="column mt-28">
          <h2 id="split-title" className="text-headline-md">
            Monitor, widgets, or both.
          </h2>
          <p className="mt-3 max-w-[44ch] text-body-lg text-secondary">
            Split view gives part of the phone to the monitor and the rest to your widgets. Pick a
            split, and the PC adds a monitor to fit it.
          </p>
          <div className="mt-10">
            <SplitView widgets={splitWidgets} />
          </div>
        </section>
        <Definitions />
      </div>
    </>
  )
}
