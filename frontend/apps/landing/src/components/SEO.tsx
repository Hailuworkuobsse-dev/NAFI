import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

export interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  image?: string;
  noIndex?: boolean;
}

export function SEO({ title, description, canonical, image, noIndex }: SEOProps) {
  const { t, i18n } = useTranslation('landing');

  const fullTitle = title
    ? `${title} · NAFI`
    : "NAFI — The Digital Backbone of Ethiopia's Agricultural Transformation";
  const fullDescription = description ?? t('hero.subtitle');
  const imageUrl = image ?? 'https://nafi.et/og-image.png';
  const canonicalUrl = canonical ?? 'https://nafi.et';

  return (
    <Helmet htmlAttributes={{ lang: i18n.resolvedLanguage ?? 'en' }}>
      <title>{fullTitle}</title>
      <meta name="description" content={fullDescription} />
      {noIndex && <meta name="robots" content="noindex,nofollow" />}
      <link rel="canonical" href={canonicalUrl} />

      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDescription} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:locale" content={i18n.resolvedLanguage ?? 'en'} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={fullDescription} />
      <meta name="twitter:image" content={imageUrl} />

      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'NAFI',
          url: 'https://nafi.et',
          logo: 'https://nafi.et/logo.png',
          sameAs: [],
        })}
      </script>
    </Helmet>
  );
}
