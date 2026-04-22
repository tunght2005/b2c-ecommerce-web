import { Helmet as HelmetBase } from 'react-helmet-async'
import type { ComponentType } from 'react'

const Helmet = HelmetBase as unknown as ComponentType<any>

type SeoProps = {
  title: string
  description: string
  keywords?: string
  canonicalPath?: string
  image?: string
}

const SITE_NAME = '7Store'
const DEFAULT_IMAGE = '/logo.svg'

export default function Seo({ title, description, keywords, canonicalPath, image }: SeoProps) {
  const canonicalUrl = canonicalPath ? `${window.location.origin}${canonicalPath}` : undefined
  const shareImage = image || `${window.location.origin}${DEFAULT_IMAGE}`

  return (
    <Helmet>
      <title>{`${title} | ${SITE_NAME}`}</title>
      <meta name='description' content={description} />
      {keywords ? <meta name='keywords' content={keywords} /> : null}
      {canonicalUrl ? <link rel='canonical' href={canonicalUrl} /> : null}
      <meta property='og:site_name' content={SITE_NAME} />
      <meta property='og:title' content={`${title} | ${SITE_NAME}`} />
      <meta property='og:description' content={description} />
      <meta property='og:image' content={shareImage} />
      <meta property='og:type' content='website' />
      <meta name='twitter:card' content='summary_large_image' />
      <meta name='twitter:title' content={`${title} | ${SITE_NAME}`} />
      <meta name='twitter:description' content={description} />
      <meta name='twitter:image' content={shareImage} />
    </Helmet>
  )
}
