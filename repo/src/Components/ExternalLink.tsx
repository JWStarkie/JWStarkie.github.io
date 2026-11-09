import type { ReactNode } from 'react'
import { Icon } from './Icon'

export function ExternalLink({ href, label, className, icon, children }: {
  href: string
  label: string
  className?: string
  icon?: 'github' | 'linkedin'
  children?: ReactNode
}) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}
      aria-label={`${label} (opens in a new tab)`} title={icon ? label : undefined}>
      {children ?? (icon ? <Icon name={icon} /> : <>{label}<Icon name="arrow" /></>)}
    </a>
  )
}
