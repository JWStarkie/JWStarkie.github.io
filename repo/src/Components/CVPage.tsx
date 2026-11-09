import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from './Icon'

export default function CVPage() {
  const requestEmail = import.meta.env.VITE_CV_REQUEST_EMAIL
  const validRequestEmail = typeof requestEmail === 'string' &&
    /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(requestEmail)
  const [submitted, setSubmitted] = useState(false)

  function submitRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const subject = encodeURIComponent('CV request')
    const body = encodeURIComponent(
      `Name: ${formData.get('name')}\nEmail: ${formData.get('email')}\n\nDescription:\n${formData.get('description')}`,
    )
    window.open(`mailto:${requestEmail}?subject=${subject}&body=${body}`, '_self')
    setSubmitted(true)
  }

  if (!validRequestEmail) {
    return (
      <main id="main-content" className="status-page">
        <p className="eyebrow">Available on request</p>
        <h1>CV requests are temporarily unavailable.</h1>
        <p role="alert">The request form hasn't been configured yet. Please try again later.</p>
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
        <Link className="text-link" to="/#resume"><Icon name="back" />Back to portfolio</Link>
      </div>
      <div className="container cv-request">
        <p>Share a few details and your email app will open with a request ready to send. Your details are not submitted or stored by this website.</p>
        <form className="cv-request-form" onSubmit={submitRequest}>
          <label htmlFor="cv-request-name">Name <span className="required-marker" aria-hidden="true">*</span></label>
          <input id="cv-request-name" name="name" autoComplete="name" required />
          <label htmlFor="cv-request-email">Email <span className="required-marker" aria-hidden="true">*</span></label>
          <input id="cv-request-email" name="email" type="email" autoComplete="email" required />
          <label htmlFor="cv-request-description">What would you like to use my CV for? <span className="required-marker" aria-hidden="true">*</span></label>
          <textarea id="cv-request-description" name="description" rows={5} required />
          <button className="button button-primary" type="submit">Request a copy <Icon name="arrow" /></button>
          {submitted && <p role="status">Your email app should be open with the request. Send the message to complete your request.</p>}
        </form>
      </div>
    </main>
  )
}
