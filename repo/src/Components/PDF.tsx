import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useResumeData } from '../hooks/useResumeData'
import { Icon } from './Icon'

export default function CVPage() {
  const { state, retry } = useResumeData()
  const [submitted, setSubmitted] = useState(false)

  function submitRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (state.status !== 'ready') return

    const formData = new FormData(event.currentTarget)
    const subject = encodeURIComponent('CV request')
    const body = encodeURIComponent(
      `Name: ${formData.get('name')}\nEmail: ${formData.get('email')}\n\nDescription:\n${formData.get('description')}`,
    )
    window.open(`mailto:${state.data.main.email}?subject=${subject}&body=${body}`, '_self')
    setSubmitted(true)
  }

  if (state.status === 'loading') {
    return <main id="main-content" className="status-page"><p role="status">Loading the request form...</p></main>
  }

  if (state.status === 'error') {
    return (
      <main id="main-content" className="status-page">
        <p className="eyebrow">Something went wrong</p>
        <h1>The request form couldn't load.</h1>
        <p role="alert">{state.message}</p>
        <button className="button button-primary" type="button" onClick={retry}>Try again</button>
      </main>
    )
  }

  return (
    <main id="main-content" className="cv-page section">
      <div className="container cv-toolbar">
        <div>
          <p className="eyebrow">Available on request</p>
          <h1>Request my CV<span>.</span></h1>
        </div>
        <div className="cv-actions">
          <Link className="text-link" to="/#resume"><Icon name="back" />Back to experience</Link>
        </div>
      </div>
      <div className="container cv-request">
        <p>Share a few details and your email app will open with a request ready to send. Your details are not submitted or stored by this website.</p>
        <form className="cv-request-form" onSubmit={submitRequest}>
          <label htmlFor="cv-request-name">Name</label>
          <input id="cv-request-name" name="name" autoComplete="name" required />
          <label htmlFor="cv-request-email">Email</label>
          <input id="cv-request-email" name="email" type="email" autoComplete="email" required />
          <label htmlFor="cv-request-description">What would you like to use my CV for?</label>
          <textarea id="cv-request-description" name="description" rows={5} required />
          <button className="button button-primary" type="submit">Request a copy <Icon name="arrow" /></button>
          {submitted && <p role="status">Your email app should be open with the request. Send the message to complete your request.</p>}
        </form>
      </div>
    </main>
  )
}
