import Link from 'next/link'

import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <section className="column flex flex-1 flex-col justify-center pt-40 pb-20">
      <p className="text-label-sm text-secondary uppercase">404</p>
      <h1 className="mt-3 text-headline-display">This page isn&apos;t here.</h1>
      <p className="mt-4 text-body-lg text-secondary">
        It may be a widget that was removed, or a page that moved into the docs.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/widgets">Widgets</Link>
        </Button>
        <Button asChild variant="secondary">
          <Link href="/docs">Documentation</Link>
        </Button>
      </div>
    </section>
  )
}
