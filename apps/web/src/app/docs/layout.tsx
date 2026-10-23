import { DocsSidebar } from '@/components/site/docs-sidebar'

// Sidebar, then the page. Doc pages add "On this page" as a third column on wide screens.
export default function DocsLayout({ children }: LayoutProps<'/docs'>) {
  return (
    <div className="frame grid flex-1 grid-cols-1 gap-10 pt-28 sm:pt-32 md:grid-cols-[200px_minmax(0,1fr)] lg:gap-14">
      <aside className="hidden md:block">
        <div
          data-lenis-prevent
          className="sticky top-[calc(var(--spacing-header)+24px)] max-h-[calc(100dvh-var(--spacing-header)-48px)] slim-scroll overflow-y-auto pb-8"
        >
          <DocsSidebar />
        </div>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  )
}
