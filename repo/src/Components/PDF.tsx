import { Link } from 'react-router-dom'
import cvUrl from '../Jo Starkie - CV 2026.pdf'
import { Icon } from './Icon'

export default function CVPage() {
  return (
    <main id="main-content" className="cv-page">
      <div className="container cv-toolbar">
        <div>
          <p className="eyebrow">The full story</p>
          <h1>My CV<span>.</span></h1>
        </div>
        <div className="cv-actions">
          <Link className="text-link" to="/#resume"><Icon name="back" />Back to experience</Link>
          <a className="button button-primary" href={cvUrl} download="Jo Starkie - CV 2026.pdf">
            Download PDF <Icon name="download" />
          </a>
        </div>
      </div>
      <p className="container cv-help">
        Preview not showing? <a href={cvUrl} target="_blank" rel="noopener noreferrer">Open the PDF in a new tab</a>.
      </p>
      <iframe className="pdf-preview" src={`${cvUrl}#toolbar=1`} title="Jo Starkie's CV" />
    </main>
  )
}
