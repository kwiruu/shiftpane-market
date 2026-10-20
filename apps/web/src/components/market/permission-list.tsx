import type { Permissions } from '@shiftpane/format'
import { canSendOffPc, describePermissions, type PermissionKind } from '@shiftpane/format'
import {
  Cpu,
  Globe,
  KeyRound,
  type LucideIcon,
  MonitorSmartphone,
  MousePointerClick,
  ShieldCheck,
} from 'lucide-react'
import { DefinitionCard } from '@/components/site/list-group'

const kindIcons: Record<PermissionKind, LucideIcon> = {
  source: Cpu,
  action: MousePointerClick,
  local: MonitorSmartphone,
  network: Globe,
  secret: KeyRound,
}

/**
 * A widget's permissions in plain words, as the app's install prompt says them, with the ones that
 * ask first marked. A widget that could send what it reads off the PC says so underneath.
 */
export function PermissionList({
  permissions,
  label = 'What it can do',
}: {
  permissions: Permissions
  label?: string
}) {
  const lines = describePermissions(permissions)
  return (
    <DefinitionCard label={label} data-cursor="Exactly what installing will say">
      {lines.length === 0 && (
        <div className="flex items-center gap-3 py-3 text-body-sm">
          <ShieldCheck
            aria-hidden="true"
            strokeWidth={1.75}
            className="size-4 flex-none text-secondary"
          />
          Needs nothing from your PC
        </div>
      )}
      {lines.map((line) => {
        const Icon = kindIcons[line.kind]
        return (
          <div
            key={`${line.kind}:${line.value}`}
            className="flex items-start gap-3 py-3 text-body-sm"
          >
            <Icon
              aria-hidden="true"
              strokeWidth={1.75}
              className="mt-0.5 size-4 flex-none text-secondary"
            />
            <span className="min-w-0 flex-1">{line.text}</span>
            {line.asks && (
              <span className="flex-none text-label-md text-secondary">Asks first</span>
            )}
          </div>
        )
      })}
      {canSendOffPc(permissions) && (
        <p className="py-3 text-body-sm text-secondary">
          It reads something that says what you&apos;re doing and can reach a host, so installing
          asks with a stronger prompt, and a person reviews every version.
        </p>
      )}
    </DefinitionCard>
  )
}
