'use client'

import { GitHubIcon } from '@/components/site/brand-icons'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { devSignIn, signInHref } from '@/lib/api'
import { cn } from '@/lib/utils'

/** Sign in with GitHub, coming back to `next`. Under `next dev`, also as anyone, without GitHub. */
export function SignInOptions({ next, className }: { next: string; className?: string }) {
  return (
    <div className={cn('flex flex-col items-start gap-4', className)}>
      <Button asChild>
        <a href={signInHref(next)}>
          <GitHubIcon />
          Sign in with GitHub
        </a>
      </Button>
      {devSignIn && <LocalSignIn next={next} />}
    </div>
  )
}

/** Posts straight to the API, which sets the session and sends the browser on to `next`. */
function LocalSignIn({ next }: { next: string }) {
  return (
    <form
      method="post"
      action="/api/v1/auth/dev"
      className="flex w-full flex-col gap-3 rounded-md bg-muted p-4"
    >
      <div>
        <p className="text-label-sm text-secondary uppercase">Local test account</p>
        <p className="mt-1 text-body-sm text-secondary">
          Only under <code className="font-mono text-code">next dev</code> with a local API: sign in
          as any login to try uploading and reviewing as different people.
        </p>
      </div>
      <input type="hidden" name="next" value={next} />
      <div className="flex flex-wrap gap-2">
        <Input
          name="login"
          required
          pattern="[a-zA-Z0-9][a-zA-Z0-9\-]{0,38}"
          placeholder="Any login, such as alice"
          aria-label="Login"
          autoComplete="off"
          className="min-w-44 flex-1"
        />
        <select
          name="role"
          aria-label="Role"
          defaultValue=""
          className="h-10 rounded-full bg-surface px-3 text-body-md text-on-surface shadow-[inset_0_0_0_1px_var(--color-border)] outline-none focus-visible:outline-2 focus-visible:outline-primary"
        >
          <option value="">Keep its role</option>
          <option value="author">Author</option>
          <option value="reviewer">Reviewer</option>
          <option value="admin">Admin</option>
        </select>
        <Button type="submit" variant="outline">
          Sign in
        </Button>
      </div>
    </form>
  )
}
