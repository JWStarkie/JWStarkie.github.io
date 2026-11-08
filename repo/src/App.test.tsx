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

  it('lets visitors request a CV without exposing a PDF link', async () => {
    window.location.hash = '#/cv'
    mockContent()
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
      expect.stringContaining('mailto:youremailhere@gmail.com?subject=CV%20request&body=Name%3A%20Alex%20Example'),
      '_self',
    )
    expect(open.mock.calls[0][0]).toContain('A%20job%20application')
    expect(await screen.findByRole('status')).toHaveTextContent('Send the message')
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
