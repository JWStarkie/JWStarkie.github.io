import { publicAsset } from '../data/resume'

export function ResponsiveImage({ src, webpSrc, alt, width, height, className }: {
  src: string
  webpSrc?: string
  alt: string
  width: number
  height: number
  className?: string
}) {
  return (
    <picture>
      {webpSrc && <source type="image/webp" srcSet={publicAsset(webpSrc)} />}
      <img src={publicAsset(src)} alt={alt} width={width} height={height} className={className}
        loading="lazy" decoding="async" />
    </picture>
  )
}
