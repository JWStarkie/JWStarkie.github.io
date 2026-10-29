import type { Project } from '../data/resume'
import { publicAsset } from '../data/resume'
import { Icon } from './Icon'

export function Portfolio({ projects }: { projects: Project[] }) {
  return (
    <section id="portfolio" className="section projects-section" aria-labelledby="projects-title">
      <div className="container">
        <div className="section-heading">
          <p className="eyebrow">Ideas into something useful</p>
          <h2 id="projects-title">Things I've built<span>.</span></h2>
          <p>A few projects, experiments and collaborations from along the way.</p>
        </div>
        <div className="project-grid">
          {projects.map((project, index) => (
            <a key={project.url} href={project.url} className="project-card" target="_blank" rel="noopener noreferrer"
              aria-label={`${project.title} on GitHub (opens in a new tab)`}>
              <div className="project-image">
                <picture>
                  {project.imageWebp && <source type="image/webp" srcSet={publicAsset(`images/portfolio/${project.imageWebp}`)} />}
                  <img src={publicAsset(`images/portfolio/${project.image}`)} alt="" width="640" height="360"
                    loading="lazy" decoding="async" />
                </picture>
                <span className="project-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
              </div>
              <div className="project-content">
                <h3>{project.title}<Icon name="arrow" /></h3>
                <p>{project.category}</p>
                <span className="project-link">Explore project <span aria-hidden="true">&rarr;</span></span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
