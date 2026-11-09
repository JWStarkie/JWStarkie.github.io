import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Icon } from './Icon'

const navigationSections = [
  { label: 'About', id: 'about' },
  { label: 'Experience', id: 'resume' },
  { label: 'Projects', id: 'portfolio' },
  { label: 'Contact', id: 'contact' },
]

export function Header() {
  const [open, setOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('')
  const menuButton = useRef<HTMLButtonElement>(null)
  const location = useLocation()

  useEffect(() => {
    if (location.pathname !== '/') return
    let frame: number | undefined

    function updateActiveSection() {
      frame = undefined
      const offset = (menuButton.current?.closest('header')?.getBoundingClientRect().height ?? 0) + 16
      let active = ''
      let lastSection: HTMLElement | null = null
      for (const { id } of navigationSections) {
        const section = document.getElementById(id)
        if (!section) continue
        lastSection = section
        if (section.getBoundingClientRect().top <= offset) active = id
      }
      if (lastSection && window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) {
        active = lastSection.id
      }
      setActiveSection(active)
    }

    function scheduleUpdate() {
      if (frame === undefined) frame = requestAnimationFrame(updateActiveSection)
    }

    scheduleUpdate()
    window.addEventListener('scroll', scheduleUpdate, { passive: true })
    window.addEventListener('resize', scheduleUpdate)
    return () => {
      window.removeEventListener('scroll', scheduleUpdate)
      window.removeEventListener('resize', scheduleUpdate)
      if (frame !== undefined) cancelAnimationFrame(frame)
    }
  }, [location.pathname])

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
          {navigationSections.map(({ label, id }) => (
            <Link key={id} to={`/#${id}`} onClick={() => setOpen(false)}
              aria-current={location.pathname === '/' && activeSection === id ? 'location' : undefined}>
              {label}
            </Link>
          ))}
          <Link className="nav-cv" to="/cv" onClick={() => setOpen(false)}
            aria-current={location.pathname === '/cv' ? 'page' : undefined}>
            Request CV <Icon name="arrow" />
          </Link>
        </nav>
      </div>
    </header>
  )
}
