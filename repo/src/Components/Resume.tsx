import { useId, useState } from 'react'
import type { ResumeData, Work } from '../data/resume'
import { splitDescription } from '../data/resume'
import { Icon } from './Icon'

function ExperienceItem({ work, initiallyOpen }: { work: Work; initiallyOpen: boolean }) {
  const [expanded, setExpanded] = useState(false)
  const bulletsId = useId()
  const { intro, bullets } = splitDescription(work.description)

  return (
    <article className="experience-item">
      <details open={initiallyOpen}>
        <summary>
          <h3>{work.title}<span>{work.company}</span></h3>
          <span className="work-date">{work.years}</span>
          <Icon name="down" />
        </summary>
        <div className="experience-content">
          {intro && <p className="work-intro">{intro}</p>}
          {bullets.length > 0 && (
            <ul id={bulletsId} className={expanded ? 'is-expanded' : undefined}>
              {bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
            </ul>
          )}
          {bullets.length > 1 && (
            <button type="button" className="text-link experience-toggle" aria-expanded={expanded}
              aria-controls={bulletsId}
              aria-label={`${expanded ? 'Show less' : 'Show more'} about ${work.title} at ${work.company}`}
              onClick={() => setExpanded(!expanded)}>
              {expanded ? 'Show less' : 'Show more'}<Icon name="down" />
            </button>
          )}
        </div>
      </details>
    </article>
  )
}

export function Resume({ data }: { data: ResumeData['resume'] }) {
  return (
    <section id="resume" className="section experience-section" aria-labelledby="experience-title">
      <div className="container">
        <div className="section-heading">
          <p className="eyebrow">The journey so far</p>
          <h2 id="experience-title">Experience, with impact<span>.</span></h2>
          <p>From cloud architecture and engineering to the details that make a product work.</p>
        </div>
        <div className="resume-layout">
          <aside className="resume-sidebar" aria-label="Skills, education and certifications">
            <section className="skills-panel" aria-labelledby="skills-title">
              <h3 id="skills-title">Tools of the trade</h3>
              <ul className="skill-tags" aria-label="Skills">
                {data.skills.map((skill) => <li key={skill}>{skill}</li>)}
              </ul>
            </section>
            <section className="education-panel" aria-labelledby="education-title">
              <p className="eyebrow">Always learning</p>
              <h3 id="education-title">Education</h3>
              {data.education.map((education) => (
                <div key={`${education.school}-${education.degree}`}>
                  <p className="education-degree">{education.degree}</p>
                  <p className="education-school">{education.school} <span>{education.graduated} alum</span></p>
                  <p>{education.description}</p>
                </div>
              ))}
            </section>
            {data.certifications.length > 0 && (
              <section className="certifications-panel" aria-labelledby="certifications-title">
                <h3 id="certifications-title">Certifications</h3>
                <ul className="certification-list">
                  {data.certifications.map((certification) => <li key={certification}>{certification}</li>)}
                </ul>
              </section>
            )}
          </aside>
          <div className="experience-list">
            {data.work.map((work, index) => (
              <ExperienceItem key={`${work.company}-${work.title}-${work.years}`} work={work} initiallyOpen={index === 0} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
