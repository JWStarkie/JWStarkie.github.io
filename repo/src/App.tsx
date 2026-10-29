import { lazy, Suspense, useEffect } from 'react'
import { HashRouter, Link, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { Header } from './Components/Header'
import { Home } from './Components/Home'

const CVPage = lazy(() => import('./Components/PDF'))

function RouteFocus() {
  const { pathname } = useLocation()
  useEffect(() => {
    document.title = pathname === '/cv' ? 'CV | Jo Starkie' : 'Jo Starkie | Software Engineer'
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function App() {
  return (
    <HashRouter>
      <a className="skip-link" href="#main-content" onClick={(event) => {
        event.preventDefault()
        const main = document.getElementById('main-content')
        main?.setAttribute('tabindex', '-1')
        main?.focus()
      }}>Skip to content</a>
      <Header />
      <RouteFocus />
      <Suspense fallback={<main id="main-content" className="status-page"><p role="status">Loading the CV...</p></main>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cv" element={<CVPage />} />
          {['home', 'about', 'resume', 'portfolio', 'contact'].map((section) => (
            <Route key={section} path={`/${section}`} element={<Navigate to={`/#${section}`} replace />} />
          ))}
          <Route path="*" element={
            <main id="main-content" className="status-page">
              <p className="eyebrow">404</p>
              <h1>This page took a wrong turn.</h1>
              <Link className="button button-primary" to="/">Back to the portfolio</Link>
            </main>
          } />
        </Routes>
      </Suspense>
    </HashRouter>
  )
}
