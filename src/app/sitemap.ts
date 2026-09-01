import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://reelforge.ai';

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    // The main public page is just the landing page for now. 
    // Dashboards and authenticated routes are usually not in sitemap for public SEO,
    // unless they are public profiles.
  ];
}
