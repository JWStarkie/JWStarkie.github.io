import type { ResumeData } from '../data/resume'
import { splitDescription } from '../data/resume'
import { Icon } from './Icon'

export function Resume({ data }: { data: ResumeData['resume'] }) {
  return (
    <section id="resume" className="section experience-section" aria-labelledby="experience-title">
      <div className="container">
        <div className="section-heading">
          <p className="eyebrow">The journey so far</p>
          <h2 id="experience-title">Experience, with impact<span>.</span></h2>
          <p>From cloud architecture to the details that make a product work.</p>
        </div>
        <div className="resume-layout">
          <aside className="resume-sidebar" aria-label="Skills and education">
            <div className="skills-panel">
              <h3>Tools of the trade</h3>
              <p>{data.skillmessage}</p>
              <ul className="skill-tags" aria-label="Selected skills">
                {data.skills.map((skill) => <li key={skill.name}>{skill.name}</li>)}
              </ul>
            </div>
            <div className="education-panel">
              <p className="eyebrow">Always learning</p>
              <h3>Education & certifications</h3>
              {data.education.map((education) => (
                <div key={`${education.school}-${education.degree}`}>
                  <p className="education-degree">{education.degree}</p>
                  <p className="education-school">{education.school} <span>/ {education.graduated}</span></p>
                  <p>{education.description}</p>
                </div>
              ))}
            </div>
          </aside>
          <div className="experience-list">
            {data.work.map((work, index) => {
              const { intro, bullets } = splitDescription(work.description)
              return (
                <article className="experience-item" key={`${work.company}-${work.title}-${work.years}`}>
                  <details open={index === 0}>
                    <summary>
                      <h3>{work.title}<span>{work.company}</span></h3>
                      <span className="work-date">{work.years}</span>
                      <Icon name="down" />
                    </summary>
                    <div className="experience-content">
                      {intro && <p className="work-intro">{intro}</p>}
                      {bullets.length > 0 && <ul>{bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>}
                    </div>
                  </details>
                </article>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
