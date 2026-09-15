import { createFileRoute } from '@tanstack/react-router'

import { loadSiteContent } from '../lib/api/content.functions'

const PAGES: Array<{ path: string; priority: string; changefreq: string }> = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/reviews', priority: '0.9', changefreq: 'weekly' },
  { path: '/estimates', priority: '0.9', changefreq: 'weekly' },
  { path: '/service', priority: '0.7', changefreq: 'monthly' },
  { path: '/videos', priority: '0.6', changefreq: 'weekly' },
  { path: '/about', priority: '0.6', changefreq: 'monthly' },
  { path: '/quote', priority: '0.8', changefreq: 'monthly' },
]

export const Route = createFileRoute('/sitemap.xml')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const origin = new URL(request.url).origin
        const today = new Date().toISOString().split('T')[0]

        // 공개된 출고 후기는 각각 고유 주소가 있으니 사이트맵에도 그대로 싣습니다.
        let reviewPages: Array<{ path: string; priority: string; changefreq: string }> = []
        try {
          const data = await loadSiteContent()
          if (!data.reviewsAreSample) {
            reviewPages = data.reviews.map((r) => ({
              path: `/review/${r.id}`,
              priority: '0.7',
              changefreq: 'monthly',
            }))
          }
        } catch {
          reviewPages = []
        }

        let estimatePages: Array<{ path: string; priority: string; changefreq: string }> = []
        try {
          const data = await loadSiteContent()
          if (!data.estimatesAreSample) {
            estimatePages = data.estimates.map((e) => ({
              path: `/estimate/${e.id}`,
              priority: '0.7',
              changefreq: 'monthly',
            }))
          }
        } catch {
          estimatePages = []
        }

        const all = [...PAGES, ...reviewPages, ...estimatePages]
        const xml = [
          '<?xml version="1.0" encoding="UTF-8"?>',
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
          ...all.flatMap((p) => [
            '  <url>',
            `    <loc>${origin}${p.path}</loc>`,
            `    <lastmod>${today}</lastmod>`,
            `    <changefreq>${p.changefreq}</changefreq>`,
            `    <priority>${p.priority}</priority>`,
            '  </url>',
          ]),
          '</urlset>',
        ].join('\n')
        return new Response(xml, {
          headers: {
            'Content-Type': 'application/xml; charset=utf-8',
            'Cache-Control': 'public, max-age=3600',
          },
        })
      },
    },
  },
})
