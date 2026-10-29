import { useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Icon } from './Icon'

const sections = [
  { label: 'About', id: 'about' },
  { label: 'Experience', id: 'resume' },
  { label: 'Projects', id: 'portfolio' },
  { label: 'Contact', id: 'contact' },
]

export function Header() {
  const [open, setOpen] = useState(false)
  const menuButton = useRef<HTMLButtonElement>(null)
  const location = useLocation()

  return (
    <header className="site-header" onKeyDown={(event) => {
      if (event.key === 'Escape' && open) {
        setOpen(false)
        menuButton.current?.focus()
      }
    }}>
      <div className="container header-inner">
        <Link className="wordmark" to="/#home" onClick={() => setOpen(false)} aria-label="Jo Starkie, home">
          jo<span>.</span>starkie
        </Link>
        <button ref={menuButton} className="menu-toggle" type="button" aria-expanded={open}
          aria-controls="primary-navigation" aria-label={open ? 'Close navigation' : 'Open navigation'}
          onClick={() => setOpen(!open)}>
          <Icon name={open ? 'close' : 'menu'} />
        </button>
        <nav id="primary-navigation" aria-label="Main navigation" className={open ? 'navigation is-open' : 'navigation'}>
          {sections.map(({ label, id }) => (
            <Link key={id} to={`/#${id}`} onClick={() => setOpen(false)}
              aria-current={location.pathname === '/' && location.hash === `#${id}` ? 'location' : undefined}>
              {label}
            </Link>
          ))}
          <Link className="nav-cv" to="/cv" onClick={() => setOpen(false)}
            aria-current={location.pathname === '/cv' ? 'page' : undefined}>
            View CV <Icon name="arrow" />
          </Link>
        </nav>
      </div>
    </header>
  )
}
