import { PROJECT_NAME } from '@/infra/lib/constants';

type SeoHeadInput = {
  title: string;
  description: string;
  path: string;
  type?: 'website' | 'article';
  image?: string;
};

const configuredSiteUrl =
  import.meta.env?.VITE_SITE_URL ??
  (typeof process === 'undefined' ? undefined : process.env.VITE_SITE_URL);

const siteUrl = (configuredSiteUrl ?? 'http://localhost:3000').replace(
  /\/+$/,
  '',
);

const defaultImage = '/logo512.png';

function toAbsoluteUrl(path: string) {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${siteUrl}${normalizedPath}`;
}

export function buildSeoHead({
  title,
  description,
  path,
  type,
  image,
}: SeoHeadInput) {
  const canonicalUrl = toAbsoluteUrl(path);
  const imageUrl = toAbsoluteUrl(image ?? defaultImage);

  return {
    meta: [
      { title },
      { name: 'description', content: description },
      // Open Graph
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:type', content: type ?? 'website' },
      { property: 'og:url', content: canonicalUrl },
      { property: 'og:site_name', content: PROJECT_NAME },
      { property: 'og:image', content: imageUrl },
      { property: 'og:image:alt', content: title },
      // Twitter Card
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: imageUrl },
    ],
    links: [{ rel: 'canonical', href: canonicalUrl }],
  };
}
