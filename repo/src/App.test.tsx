import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import App from './App'

const rawData = readFileSync(resolve('public', 'resumeData.json'), 'utf8')

function mockContent() {
  return vi.stubGlobal('fetch', vi.fn().mockImplementation(() => Promise.resolve(new Response(rawData))))
}

describe('portfolio', () => {
  it('loads the latest content, promotion and project links', async () => {
    mockContent()
    render(<App />)
    expect(await screen.findByRole('heading', { level: 1, name: 'Meet Jo Starkie.' })).toBeVisible()
    expect(screen.getByText('November 2023 - Present')).toBeInTheDocument()
    expect(screen.getByText('January 2022 - November 2023')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Azure Purview Accelerator' })).toBeInTheDocument()
    expect(screen.getAllByRole('listitem').length).toBeGreaterThan(10)
  })

  it('shows loading rather than rendering incomplete content', () => {
    vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})))
    render(<App />)
    expect(screen.getByRole('status')).toHaveTextContent('Loading')
    expect(screen.queryByRole('heading', { name: 'Meet Jo Starkie.' })).not.toBeInTheDocument()
  })

  it('uses accessible social icons while preserving project and CV links', async () => {
    mockContent()
    render(<App />)
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

  it('displays certifications separately from education', async () => {
    mockContent()
    render(<App />)
    const education = await screen.findByRole('region', { name: 'Education' })
    expect(within(education).getByText('Brunel University London')).toBeInTheDocument()
    expect(education).toHaveTextContent('First Class Honours')
    expect(education).not.toHaveTextContent('Certifications earned')
    const certifications = screen.getByRole('region', { name: 'Certifications' })
    expect(within(certifications).getAllByRole('listitem').map((item) => item.textContent)).toEqual([
      'Power BI Data Analyst Associate (DA-100)',
      'Azure Data Fundamentals (DP-900)',
      'Azure AI Fundamentals (AI-900)',
      'GitHub Foundations',
    ])
    expect(education).not.toHaveTextContent('GitHub Foundations')
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
    mockContent()
    render(<App />)
    await screen.findByRole('heading', { name: 'Meet Jo Starkie.' })
    const navigation = screen.getByRole('navigation', { name: 'Main navigation' })
    await userEvent.click(within(navigation).getByRole('link', { name: 'Projects' }))
    expect(window.location.hash).toBe('#/#portfolio')
  })

  it('supports mobile disclosure state and Escape focus restoration', async () => {
    mockContent()
    render(<App />)
    const button = screen.getByRole('button', { name: 'Open navigation' })
    await userEvent.click(button)
    expect(button).toHaveAttribute('aria-expanded', 'true')
    fireEvent.keyDown(button, { key: 'Escape' })
    expect(button).toHaveAttribute('aria-expanded', 'false')
    expect(button).toHaveFocus()
  })

  it('lets visitors request a CV without exposing a PDF link', async () => {
    window.location.hash = '#/cv'
    vi.stubEnv('VITE_CV_REQUEST_EMAIL', 'cv-requests@example.com')
    const fetch = vi.fn()
    vi.stubGlobal('fetch', fetch)
    render(<App />)
    expect(await screen.findByRole('heading', { name: 'Request my CV.' })).toBeInTheDocument()
    expect(screen.getByLabelText('Name')).toBeRequired()
    expect(screen.getByLabelText('Email')).toHaveAttribute('type', 'email')
    expect(screen.getByLabelText('Email')).toBeRequired()
    expect(screen.getByLabelText('What would you like to use my CV for?')).toBeRequired()
    expect(screen.queryByRole('link', { name: /download pdf|open the pdf/i })).not.toBeInTheDocument()

    const open = vi.spyOn(window, 'open').mockImplementation(() => null)
    await userEvent.type(screen.getByLabelText('Name'), 'Alex Example')
    await userEvent.type(screen.getByLabelText('Email'), 'alex@example.com')
    await userEvent.type(screen.getByLabelText('What would you like to use my CV for?'), 'A job application')
    await userEvent.click(screen.getByRole('button', { name: 'Request a copy' }))
    expect(open).toHaveBeenCalledWith(
      expect.stringContaining('mailto:cv-requests@example.com?subject=CV%20request&body=Name%3A%20Alex%20Example'),
      '_self',
    )
    expect(open.mock.calls[0][0]).toContain('A%20job%20application')
    expect(await screen.findByRole('status')).toHaveTextContent('Send the message')
    expect(fetch).not.toHaveBeenCalled()
  })

  it('explains when the CV request email has not been configured', async () => {
    window.location.hash = '#/cv'
    vi.stubEnv('VITE_CV_REQUEST_EMAIL', '')
    render(<App />)
    expect(await screen.findByRole('alert')).toHaveTextContent("hasn't been configured")
    expect(screen.queryByRole('button', { name: 'Request a copy' })).not.toBeInTheDocument()
  })

  it('preserves legacy section bookmarks', async () => {
    window.location.hash = '#about'
    mockContent()
    render(<App />)
    await screen.findByRole('heading', { name: 'Meet Jo Starkie.' })
    await waitFor(() => expect(window.location.hash).toBe('#/#about'))
  })

  it('shows an explicit recovery link for unknown routes', () => {
    window.location.hash = '#/missing'
    render(<App />)
    expect(screen.getByRole('heading', { name: 'This page took a wrong turn.' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Back to the portfolio' })).toHaveAttribute('href', '#/')
  })
})
