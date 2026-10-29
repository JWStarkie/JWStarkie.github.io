import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { publicAsset, socialLabel } from '../data/resume'
import { useResumeData } from '../hooks/useResumeData'
import { ExternalLink } from './ExternalLink'
import { Icon } from './Icon'
import { Portfolio } from './Portfolio'
import { Resume } from './Resume'

export function Home() {
  const { state, retry } = useResumeData()
  const { hash } = useLocation()

  useEffect(() => {
    if (state.status !== 'ready') return
    const target = document.getElementById(hash.slice(1) || 'home')
    target?.scrollIntoView()
    if (hash) {
      const heading = target?.querySelector<HTMLElement>('h1, h2')
      heading?.setAttribute('tabindex', '-1')
      heading?.focus({ preventScroll: true })
    }
  }, [hash, state])

  if (state.status === 'loading') {
    return <main id="main-content" className="status-page"><p role="status">Loading Jo's portfolio...</p></main>
  }
  if (state.status === 'error') {
    return (
      <main id="main-content" className="status-page">
        <p className="eyebrow">Something went wrong</p>
        <h1>The portfolio couldn't load.</h1>
        <p role="alert">{state.message}</p>
        <button className="button button-primary" type="button" onClick={retry}>Try again</button>
      </main>
    )
  }

  const { main, resume, portfolio } = state.data
  const currentRole = resume.work[0]

  return (
    <>
      <main id="main-content">
        <section id="home" className="hero" aria-labelledby="hero-title">
          <div className="hero-grid" aria-hidden="true" />
          <div className="container hero-layout">
            <div className="hero-copy">
              <p className="eyebrow"><span className="status-dot" />Software engineering & cloud architecture</p>
              <h1 id="hero-title">{main.title}<span>.</span></h1>
              <p className="hero-description">{main.description.replace(/[.!]$/, '')}.</p>
              <div className="hero-actions">
                <Link to="/#portfolio" className="button button-primary">Explore my work <Icon name="arrow" /></Link>
                <Link to="/cv" className="button button-outline">View my CV</Link>
              </div>
              <div className="hero-socials">
                <ExternalLink href={main.github} label="GitHub" />
                <ExternalLink href={main.linkedin} label="LinkedIn" />
              </div>
            </div>
            <aside className="chapter-card" aria-label="Current role and location">
              <div className="chapter-top"><Icon name="code" /><span>Current chapter</span><span className="card-dots" aria-hidden="true">...</span></div>
              <p className="chapter-company">{currentRole.company}</p>
              <p className="chapter-role">{currentRole.title}</p>
              <div className="chapter-line" />
              <dl>
                <div><dt>Focus</dt><dd>Building thoughtful software</dd></div>
                <div><dt>Based in</dt><dd>{main.address.city}, {main.address.state}</dd></div>
              </dl>
              <p className="chapter-note">Always learning. Always building.</p>
            </aside>
          </div>
          <Link to="/#about" className="hero-scroll">A little more about me <Icon name="down" /></Link>
        </section>

        <section id="about" className="section about-section" aria-labelledby="about-title">
          <div className="container about-layout">
            <div className="portrait-wrap">
              <picture>
                {main.imageWebp && <source type="image/webp" srcSet={publicAsset(`images/${main.imageWebp}`)} />}
                <img className="portrait" src={publicAsset(`images/${main.image}`)} alt={main.name}
                  width="512" height="512" loading="lazy" decoding="async" />
              </picture>
              <span className="portrait-caption">Engineer. Mentor. Curious human.</span>
            </div>
            <div className="about-copy">
              <p className="eyebrow">A bit about me</p>
              <h2 id="about-title">Technology is the craft.<br />People are the point<span>.</span></h2>
              <p>{main.bio}</p>
              <Link to="/cv" className="text-link">Read my CV <Icon name="arrow" /></Link>
            </div>
          </div>
        </section>

        <Resume data={resume} />
        <Portfolio projects={portfolio.projects} />

        <section id="contact" className="section contact-section" aria-labelledby="contact-title">
          <div className="container contact-layout">
            <div>
              <p className="eyebrow">Good things start with a conversation</p>
              <h2 id="contact-title">Let's connect<span>.</span></h2>
              <p>{main.contactmessage}</p>
            </div>
            <div className="contact-actions">
              <ExternalLink className="button button-primary" href={main.linkedin} label="Find me on LinkedIn" />
              <ExternalLink className="button button-outline" href={main.github} label="See my GitHub" />
            </div>
          </div>
        </section>
      </main>
      <footer className="site-footer">
        <div className="container footer-inner">
          <p>&copy; {new Date().getFullYear()} {main.name}. Built with care.</p>
          <nav aria-label="Social links">
            {main.social.map((social) => <ExternalLink key={social.name} href={social.url} label={socialLabel(social.name)} />)}
          </nav>
          <Link className="back-top" to="/#home">Back to top <Icon name="arrow" /></Link>
        </div>
      </footer>
    </>
  )
}
