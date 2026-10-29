import { Icon } from './Icon'

export function ExternalLink({ href, label, className }: { href: string; label: string; className?: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}
      aria-label={`${label} (opens in a new tab)`}>
      {label}<Icon name="arrow" />
    </a>
  )
}
