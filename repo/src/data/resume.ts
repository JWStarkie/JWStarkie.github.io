export interface SocialLink {
  name: string
  url: string
}

export interface Main {
  title: string
  name: string
  description: string
  image: string
  imageWebp?: string
  bio: string
  contactmessage: string
  github: string
  linkedin: string
  address: { city: string; state: string }
  social: SocialLink[]
}

export interface Education {
  school: string
  degree: string
  graduated: string
  description: string
}

export interface Work {
  company: string
  title: string
  years: string
  description: string
}

export interface Project {
  title: string
  category: string
  image: string
  imageWebp?: string
  imageFit?: 'cover' | 'contain'
  url: string
}

export interface ResumeData {
  main: Main
  resume: {
    education: Education[]
    certifications: string[]
    work: Work[]
    skills: string[]
  }
  portfolio: { projects: Project[] }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function hasStrings(value: unknown, keys: string[]): value is Record<string, unknown> {
  return isRecord(value) && keys.every((key) => isNonEmptyString(value[key]))
}

function hasOptionalImage(value: Record<string, unknown>) {
  return value.imageWebp === undefined || typeof value.imageWebp === 'string'
}

function isWebUrl(value: unknown) {
  if (typeof value !== 'string') return false
  try {
    return ['https:', 'http:'].includes(new URL(value).protocol)
  } catch {
    return false
  }
}

function isResumeData(value: unknown): value is ResumeData {
  if (!isRecord(value)) return false
  const { main, resume, portfolio } = value
  return (
    hasStrings(main, ['title', 'name', 'description', 'image', 'bio', 'contactmessage']) &&
    hasOptionalImage(main) &&
    isWebUrl(main.github) &&
    isWebUrl(main.linkedin) &&
    hasStrings(main.address, ['city', 'state']) &&
    Array.isArray(main.social) &&
    main.social.every((item) => hasStrings(item, ['name']) && isWebUrl(item.url)) &&
    isRecord(resume) &&
    Array.isArray(resume.education) &&
    resume.education.every((item) => hasStrings(item, ['school', 'degree', 'graduated', 'description'])) &&
    Array.isArray(resume.certifications) &&
    resume.certifications.every(isNonEmptyString) &&
    Array.isArray(resume.work) &&
    resume.work.length > 0 &&
    resume.work.every((item) => hasStrings(item, ['company', 'title', 'years', 'description'])) &&
    Array.isArray(resume.skills) &&
    resume.skills.every(isNonEmptyString) &&
    isRecord(portfolio) &&
    Array.isArray(portfolio.projects) &&
    portfolio.projects.every((item) =>
      hasStrings(item, ['title', 'category', 'image']) &&
      hasOptionalImage(item) &&
      (item.imageFit === undefined || item.imageFit === 'cover' || item.imageFit === 'contain') &&
      isWebUrl(item.url),
    )
  )
}

export function parseResumeData(value: unknown): ResumeData {
  if (!isResumeData(value)) {
    throw new Error('The profile data is incomplete or invalid. Please check resumeData.json.')
  }
  return value
}

export function splitDescription(description: string) {
  const [intro, ...bullets] = description.split('\u2022')
  return {
    intro: intro.trim(),
    bullets: bullets.map((bullet) => bullet.trim()).filter(Boolean),
  }
}

export function publicAsset(path: string) {
  return `${import.meta.env.BASE_URL}${path}`
}

export function socialLabel(name: string) {
  const labels: Record<string, string> = {
    github: 'GitHub',
    linkedin: 'LinkedIn',
    twitter: 'Twitter / X',
    carrd: 'More links',
  }
  return labels[name] ?? name
}
