import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { apiRouter } from './routes.ts';
import { prisma } from './db.ts';

dotenv.config();

export const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Dynamic SEO Sitemap
app.get('/sitemap.xml', async (_req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      select: { slug: true, updatedAt: true },
    });
    const categories = await prisma.category.findMany({
      select: { slug: true, updatedAt: true },
    });

    const baseUrl = process.env.APP_URL || 'https://bismillahmotorsbd.com';
    const dateNow = new Date().toISOString().split('T')[0];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${dateNow}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/products</loc>
    <lastmod>${dateNow}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  ${categories
    .map(
      (c) => `  <url>
    <loc>${baseUrl}/products?category=${c.slug}</loc>
    <lastmod>${c.updatedAt.toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
    )
    .join('\n')}
  ${products
    .map(
      (p) => `  <url>
    <loc>${baseUrl}/product/${p.slug}</loc>
    <lastmod>${p.updatedAt.toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
    )
    .join('\n')}
</urlset>`;

    res.setHeader('Content-Type', 'application/xml');
    return res.send(xml);
  } catch (error) {
    return res.status(500).send('Error generating sitemap');
  }
});

// Dynamic SEO Robots.txt
app.get('/robots.txt', (_req: Request, res: Response) => {
  const baseUrl = process.env.APP_URL || 'https://bismillahmotorsbd.com';
  const robots = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/admin/

Sitemap: ${baseUrl}/sitemap.xml
`;
  res.setHeader('Content-Type', 'text/plain');
  return res.send(robots);
});

// Mount REST API router
app.use('/api', apiRouter);

export default app;
