import type { Project } from '../data/resume'
import { ExternalLink } from './ExternalLink'
import { Icon } from './Icon'
import { ResponsiveImage } from './ResponsiveImage'

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
          {projects.map((project) => (
            <ExternalLink key={project.url} href={project.url} className="project-card"
              label={`${project.title} on GitHub`}>
              <div className={project.imageFit === 'contain' ? 'project-image project-image--contain' : 'project-image'}>
                <ResponsiveImage src={`images/portfolio/${project.image}`}
                  webpSrc={project.imageWebp ? `images/portfolio/${project.imageWebp}` : undefined}
                  alt="" width={640} height={360} />
              </div>
              <div className="project-content">
                <h3>{project.title}<Icon name="arrow" /></h3>
                <p>{project.category}</p>
                <span className="project-link">Explore project <span aria-hidden="true">&rarr;</span></span>
              </div>
            </ExternalLink>
          ))}
        </div>
      </div>
    </section>
  )
}
