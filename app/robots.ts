import type { MetadataRoute } from 'next';
import { siteOrigin } from '@/lib/content';
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/studio', '/api/'] },
    sitemap: siteOrigin + '/sitemap.xml',
    host: siteOrigin,
  };
}
