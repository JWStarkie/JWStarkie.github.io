import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { parseResumeData, splitDescription } from './resume'

const source: unknown = JSON.parse(readFileSync(resolve('public', 'resumeData.json'), 'utf8'))

describe('portfolio content', () => {
  it('validates the real, editable public JSON and promotion history', () => {
    const data = parseResumeData(source)
    expect(data.resume.work[0]).toMatchObject({ title: 'Software Engineer II', years: 'November 2023 - Present' })
    expect(data.resume.work[1]).toMatchObject({ title: 'Software Engineer', years: 'January 2022 - November 2023' })
    expect(data.main.address.city).toBe('Bedford')
  })

  it.each([null, {}, { main: {} }, { main: [], resume: {}, portfolio: {} }])('rejects invalid data: %j', (value) => {
    expect(() => parseResumeData(value)).toThrow('incomplete or invalid')
  })

  it('rejects unsupported external-link protocols', () => {
    const data = structuredClone(parseResumeData(source))
    data.main.github = 'javascript:alert(1)'
    expect(() => parseResumeData(data)).toThrow('incomplete or invalid')
  })

  it('rejects an empty work history instead of crashing the hero', () => {
    const data = structuredClone(parseResumeData(source))
    data.resume.work = []
    expect(() => parseResumeData(data)).toThrow('incomplete or invalid')
  })

  it('keeps every referenced original and optimised image available', () => {
    const data = parseResumeData(source)
    const images = [
      data.main.image,
      data.main.imageWebp,
      ...data.portfolio.projects.flatMap((project) => [
        `portfolio/${project.image}`,
        project.imageWebp ? `portfolio/${project.imageWebp}` : undefined,
      ]),
    ].filter((image): image is string => image !== undefined)
    for (const image of images) {
      expect(existsSync(resolve('public', 'images', ...image.split('/'))), image).toBe(true)
    }
  })
})

describe('description formatting', () => {
  it('separates the workstream from real list items', () => {
    expect(splitDescription('SDK engineering. \u2022 Delivered APIs. \u2022 Added tests.')).toEqual({
      intro: 'SDK engineering.',
      bullets: ['Delivered APIs.', 'Added tests.'],
    })
  })

  describe('site icons', () => {
    it('ships a genuine multi-resolution ICO rather than a renamed PNG', () => {
      const icon = readFileSync(resolve('public', 'favicon.ico'))
      expect([...icon.subarray(0, 4)]).toEqual([0, 0, 1, 0])
      const count = icon.readUInt16LE(4)
      expect(count).toBe(4)
      const sizes = Array.from({ length: count }, (_, index) => icon[6 + index * 16])
      expect(sizes.sort((a, b) => a - b)).toEqual([16, 32, 48, 64])
    })

    it.each([
      ['apple-touch-icon.png', 180],
      ['icon-192.png', 192],
      ['icon-512.png', 512],
    ] as const)('ships %s at the correct dimensions', (name, size) => {
      const icon = readFileSync(resolve('public', 'icons', name))
      expect([...icon.subarray(0, 8)]).toEqual([137, 80, 78, 71, 13, 10, 26, 10])
      expect(icon.readUInt32BE(16)).toBe(size)
      expect(icon.readUInt32BE(20)).toBe(size)
    })
  })

  it('handles legacy descriptions beginning with a bullet and no spaces', () => {
    expect(splitDescription('\u2022 First item.\u2022 Second item.')).toEqual({
      intro: '',
      bullets: ['First item.', 'Second item.'],
    })
  })

  it('keeps a plain paragraph intact', () => {
    expect(splitDescription('A plain paragraph.')).toEqual({ intro: 'A plain paragraph.', bullets: [] })
  })
})
