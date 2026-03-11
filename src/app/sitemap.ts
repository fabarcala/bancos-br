import type { MetadataRoute } from 'next'

const BASE = 'https://bancos-app.vercel.app'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${BASE}/boletim-focus`, lastModified: new Date(), changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${BASE}/setorial`,      lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/bancos`,        lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/ranking`,       lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/graficos`,      lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/curva-juros`,   lastModified: new Date(), changeFrequency: 'daily',   priority: 0.7 },
  ]
}
