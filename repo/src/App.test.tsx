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

  it('shows the CV with a real download and fallback without fetching profile data', async () => {
    window.location.hash = '#/cv'
    const fetch = vi.fn()
    vi.stubGlobal('fetch', fetch)
    render(<App />)
    expect(await screen.findByTitle("Jo Starkie's CV")).toHaveAttribute('src', expect.stringContaining('.pdf'))
    expect(screen.getByRole('link', { name: 'Download PDF' })).toHaveAttribute('download', 'Jo Starkie - CV 2026.pdf')
    expect(screen.getByRole('link', { name: 'Open the PDF in a new tab' })).toBeInTheDocument()
    expect(fetch).not.toHaveBeenCalled()
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
