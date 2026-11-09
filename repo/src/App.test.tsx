import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import App from './App'
import { parseResumeData } from './data/resume'

const rawData = readFileSync(resolve('public', 'resumeData.json'), 'utf8')
const data = parseResumeData(JSON.parse(rawData))

function renderPortfolio(content = rawData) {
  vi.stubGlobal('fetch', vi.fn().mockImplementation(() => Promise.resolve(new Response(content))))
  return render(<App />)
}

describe('portfolio', () => {
  it('loads the latest content, promotion and project links', async () => {
    renderPortfolio()
    expect(await screen.findByRole('heading', { level: 1, name: 'Meet Jo Starkie.' })).toBeVisible()
    expect(screen.getByText('November 2023 - Present')).toBeInTheDocument()
    expect(screen.getByText('January 2022 - November 2023')).toBeInTheDocument()
    const project = data.portfolio.projects[0]
    expect(screen.getByRole('link', { name: `${project.title} on GitHub (opens in a new tab)` }))
      .toHaveAttribute('href', project.url)
  })

  it('shows loading rather than rendering incomplete content', () => {
    vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})))
    render(<App />)
    expect(screen.getByRole('status')).toHaveTextContent('Loading')
    expect(screen.queryByRole('heading', { name: 'Meet Jo Starkie.' })).not.toBeInTheDocument()
  })

  it('uses accessible social icons while preserving project and CV links', async () => {
    renderPortfolio()
    const hero = await screen.findByRole('region', { name: 'Meet Jo Starkie.' })
    const contact = screen.getByRole('region', { name: "Let's connect." })
    for (const [label, contactLabel] of [['LinkedIn', 'Find me on LinkedIn'], ['GitHub', 'See my GitHub']]) {
      const heroLink = within(hero).getByRole('link', { name: `${label} (opens in a new tab)` })
      const contactLink = within(contact).getByRole('link', { name: `${contactLabel} (opens in a new tab)` })
      expect(heroLink).toHaveAttribute('href', contactLink.getAttribute('href'))
      expect(heroLink).toHaveAttribute('target', '_blank')
      expect(heroLink).toHaveAttribute('rel', 'noopener noreferrer')
      expect(heroLink.textContent).toBe('')
      expect(heroLink.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
    }
    expect(within(hero).getByRole('link', { name: 'Explore my work' })).toHaveAttribute('href', '#/#portfolio')
    expect(within(hero).getByRole('link', { name: 'Request my CV' })).toHaveAttribute('href', '#/cv')
  })

  it('displays all tools of the trade as pills without a paragraph', async () => {
    renderPortfolio()
    const skills = await screen.findByRole('region', { name: 'Tools of the trade' })
    const list = within(skills).getByRole('list', { name: 'Skills' })
    expect(within(list).getAllByRole('listitem').map((item) => item.textContent))
      .toEqual(data.resume.skills)
    expect(skills.querySelector('p')).not.toBeInTheDocument()
  })

  it('displays certifications separately from education', async () => {
    renderPortfolio()
    const education = await screen.findByRole('region', { name: 'Education' })
    expect(within(education).getByText('Brunel University London')).toBeInTheDocument()
    expect(education).toHaveTextContent('First Class Honours')
    expect(education).not.toHaveTextContent('Certifications earned')
    const certifications = screen.getByRole('region', { name: 'Certifications' })
    expect(within(certifications).getAllByRole('listitem').map((item) => item.textContent))
      .toEqual(data.resume.certifications)
    expect(education).not.toHaveTextContent('GitHub Foundations')
  })

  it('renders WebP sources when configured and keeps original image fallbacks', async () => {
    const content = structuredClone(data)
    content.main.imageWebp = 'portrait.webp'
    delete content.portfolio.projects[0].imageWebp
    renderPortfolio(JSON.stringify(content))
    const portrait = await screen.findByRole('img', { name: data.main.name })
    expect(portrait).toHaveAttribute('src', `/images/${data.main.image}`)
    expect(portrait.closest('picture')?.querySelector('source'))
      .toHaveAttribute('srcset', '/images/portrait.webp')
    const project = data.portfolio.projects[0]
    const projectLink = screen.getByRole('link', { name: `${project.title} on GitHub (opens in a new tab)` })
    expect(projectLink.querySelector('img')).toHaveAttribute('src', `/images/portfolio/${project.image}`)
    expect(projectLink.querySelector('source')).not.toBeInTheDocument()
  })

  it('surfaces HTTP failures and allows a successful retry', async () => {
    const fetch = vi.fn()
      .mockResolvedValueOnce(new Response('', { status: 503 }))
      .mockResolvedValueOnce(new Response(rawData))
    vi.stubGlobal('fetch', fetch)
    render(<App />)
    expect(await screen.findByRole('alert')).toHaveTextContent('HTTP 503')
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(await screen.findByRole('heading', { name: 'Meet Jo Starkie.' })).toBeInTheDocument()
    expect(fetch).toHaveBeenCalledTimes(2)
  })

  it('surfaces invalid content instead of silently falling back', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}')))
    render(<App />)
    expect(await screen.findByRole('alert')).toHaveTextContent('incomplete or invalid')
  })

  it('navigates to sections without breaking hash routing', async () => {
    renderPortfolio()
    await screen.findByRole('heading', { name: 'Meet Jo Starkie.' })
    const navigation = screen.getByRole('navigation', { name: 'Main navigation' })
    await userEvent.click(within(navigation).getByRole('link', { name: 'Projects' }))
    expect(window.location.hash).toBe('#/#portfolio')
  })

  it('supports mobile disclosure state and Escape focus restoration', async () => {
    renderPortfolio()
    const button = screen.getByRole('button', { name: 'Open navigation' })
    await userEvent.click(button)
    expect(button).toHaveAttribute('aria-expanded', 'true')
    fireEvent.keyDown(button, { key: 'Escape' })
    expect(button).toHaveAttribute('aria-expanded', 'false')
    expect(button).toHaveFocus()
  })

  it('updates the active navigation item on scroll and resize without changing the URL', async () => {
    renderPortfolio()
    await screen.findByRole('heading', { name: 'Meet Jo Starkie.' })
    vi.spyOn(document.documentElement, 'scrollHeight', 'get').mockReturnValue(4000)
    vi.stubGlobal('innerHeight', 800)
    vi.stubGlobal('scrollY', 0)
    let tops = [0, 1000, 2000, 3000]
    for (const [index, id] of ['about', 'resume', 'portfolio', 'contact'].entries()) {
      const section = document.getElementById(id)
      if (!section) throw new Error(`Missing section: ${id}`)
      vi.spyOn(section, 'getBoundingClientRect').mockImplementation(() => new DOMRect(0, tops[index], 100, 600))
    }
    const navigation = within(screen.getByRole('navigation', { name: 'Main navigation' }))
    fireEvent.scroll(window)
    await waitFor(() => expect(navigation.getByRole('link', { name: 'About' })).toHaveAttribute('aria-current', 'location'))
    tops = [-2000, -1000, 0, 1000]
    fireEvent.scroll(window)
    await waitFor(() => expect(navigation.getByRole('link', { name: 'Projects' })).toHaveAttribute('aria-current', 'location'))
    expect(navigation.getByRole('link', { name: 'About' })).not.toHaveAttribute('aria-current')
    tops = [0, 1000, 2000, 3000]
    fireEvent.resize(window)
    await waitFor(() => expect(navigation.getByRole('link', { name: 'About' })).toHaveAttribute('aria-current', 'location'))
    tops = [-2700, -1800, -900, 300]
    vi.stubGlobal('scrollY', 3200)
    fireEvent.scroll(window)
    await waitFor(() => expect(navigation.getByRole('link', { name: 'Contact' })).toHaveAttribute('aria-current', 'location'))
    expect(window.location.hash).toBe('')
  })

  it('allows individual experience descriptions to expand and collapse', async () => {
    renderPortfolio()
    const work = data.resume.work[0]
    const more = await screen.findByRole('button', { name: `Show more about ${work.title} at ${work.company}` })
    expect(more).toHaveAttribute('aria-expanded', 'false')
    expect(document.getElementById(more.getAttribute('aria-controls') ?? '')).toBeInTheDocument()
    await userEvent.click(more)
    const less = screen.getByRole('button', { name: `Show less about ${work.title} at ${work.company}` })
    expect(less).toHaveAttribute('aria-expanded', 'true')
    await userEvent.click(less)
    expect(more).toHaveAttribute('aria-expanded', 'false')
  })

  it('does not offer expansion when a role has only one bullet', async () => {
    const content = structuredClone(data)
    content.resume.work = [{ ...content.resume.work[0], description: 'Introduction. \u2022 Only one achievement.' }]
    renderPortfolio(JSON.stringify(content))
    await screen.findByText('Only one achievement.')
    expect(screen.queryByRole('button', { name: /^Show more about/ })).not.toBeInTheDocument()
  })

  it('lets visitors request a CV without exposing a PDF link', async () => {
    window.location.hash = '#/cv'
    vi.stubEnv('VITE_CV_REQUEST_EMAIL', 'cv-requests@example.com')
    const fetch = vi.fn()
    vi.stubGlobal('fetch', fetch)
    render(<App />)
    expect(await screen.findByRole('heading', { name: 'Request my CV.' })).toBeInTheDocument()
    const nameInput = screen.getByRole('textbox', { name: 'Name' })
    const emailInput = screen.getByRole('textbox', { name: 'Email' })
    const descriptionInput = screen.getByRole('textbox', { name: 'What would you like to use my CV for?' })
    for (const input of [nameInput, emailInput, descriptionInput]) {
      expect(input).toBeRequired()
      expect(document.querySelector(`label[for="${input.id}"]`)).toHaveTextContent(/\*$/)
    }
    expect(emailInput).toHaveAttribute('type', 'email')
    expect(screen.getByRole('link', { name: 'Request CV' })).toHaveAttribute('aria-current', 'page')
    expect(screen.queryByRole('link', { name: /download pdf|open the pdf/i })).not.toBeInTheDocument()

    const open = vi.spyOn(window, 'open').mockImplementation(() => null)
    await userEvent.type(nameInput, 'Alex & Example')
    await userEvent.type(emailInput, 'alex+jobs@example.com')
    await userEvent.type(descriptionInput, 'A job application & SDK work?')
    await userEvent.click(screen.getByRole('button', { name: 'Request a copy' }))
    expect(open).toHaveBeenCalledTimes(1)
    const [url, target] = open.mock.calls[0]
    const request = new URL(url ?? '')
    expect(target).toBe('_self')
    expect(request.protocol).toBe('mailto:')
    expect(request.pathname).toBe('cv-requests@example.com')
    expect(request.searchParams.get('subject')).toBe('CV request')
    expect(request.searchParams.get('body'))
      .toBe('Name: Alex & Example\nEmail: alex+jobs@example.com\n\nDescription:\nA job application & SDK work?')
    expect(await screen.findByRole('status')).toHaveTextContent('Send the message')
    expect(fetch).not.toHaveBeenCalled()
  })

  it.each([undefined, '', 'not-an-email'])('explains unavailable CV requests for email %j', async (email) => {
    window.location.hash = '#/cv'
    vi.stubEnv('VITE_CV_REQUEST_EMAIL', email)
    render(<App />)
    expect(await screen.findByRole('alert')).toHaveTextContent("hasn't been configured")
    expect(screen.queryByRole('button', { name: 'Request a copy' })).not.toBeInTheDocument()
  })

  it.each(['home', 'about', 'resume', 'portfolio', 'contact'])('focuses the bookmarked %s section', async (section) => {
    window.location.hash = `#/#${section}`
    renderPortfolio()
    await screen.findByRole('heading', { name: 'Meet Jo Starkie.' })
    await waitFor(() => expect(document.getElementById(section)?.querySelector('h1, h2')).toHaveFocus())
  })

  it('shows an explicit recovery link for unknown routes', () => {
    window.location.hash = '#/missing'
    render(<App />)
    expect(screen.getByRole('heading', { name: 'This page took a wrong turn.' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Back to the portfolio' })).toHaveAttribute('href', '#/')
  })
})
