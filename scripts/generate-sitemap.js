import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Update the canonical production domain here
const DOMAIN = 'https://checklistsilksong.com';
const SITEMAP_PATH = path.join(__dirname, '..', 'sitemap.xml');

function isoNow() { return new Date().toISOString(); }

function buildUrls() {
  // Extend here when new pages are added
  return [
    { loc: `${DOMAIN}/`, lastmod: isoNow(), changefreq: 'weekly', priority: '1.0' },
    { loc: `${DOMAIN}/index.html`, lastmod: isoNow(), changefreq: 'weekly', priority: '0.9' }
  ];
}

function generateSitemap() {
  const urls = buildUrls();
  const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>\n` +
`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
urls.map(u => `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${u.lastmod}</lastmod>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`).join('\n') +
`\n</urlset>\n`;

  try {
    fs.writeFileSync(SITEMAP_PATH, sitemapContent, 'utf8');
    console.log('✅ sitemap.xml generated at', SITEMAP_PATH);
  } catch (err) {
    console.error('❌ Error generating sitemap.xml', err);
    process.exitCode = 1;
  }
}

generateSitemap();