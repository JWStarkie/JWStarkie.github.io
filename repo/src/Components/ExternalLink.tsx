import { Icon } from './Icon'

export function ExternalLink({ href, label, className, icon }: {
  href: string
  label: string
  className?: string
  icon?: 'github' | 'linkedin'
}) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}
      aria-label={`${label} (opens in a new tab)`} title={icon ? label : undefined}>
      {icon ? <Icon name={icon} /> : <>{label}<Icon name="arrow" /></>}
    </a>
  )
}
