const fs = require('fs');
const path = require('path');

const DOMAIN = 'https://your-domain.com';
const SITEMAP_PATH = path.join(__dirname, '..', 'sitemap.xml');

const generateSitemap = () => {
  // For a single-page app, the sitemap is simple.
  // If you add more pages (e.g., /about, /contact), you can add them here.
  const urls = [
    { loc: `${DOMAIN}/`, lastmod: new Date().toISOString(), changefreq: 'weekly', priority: '1.0' },
    { loc: `${DOMAIN}/index.html`, lastmod: new Date().toISOString(), changefreq: 'weekly', priority: '1.0' },
  ];

  const sitemapContent = `
    <?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${urls.map(url => `
        <url>
          <loc>${url.loc}</loc>
          <lastmod>${url.lastmod}</lastmod>
          <changefreq>${url.changefreq}</changefreq>
          <priority>${url.priority}</priority>
        </url>
      `).join('')}
    </urlset>
  `.trim();

  try {
    fs.writeFileSync(SITEMAP_PATH, sitemapContent);
    console.log('✅ sitemap.xml generated successfully.');
  } catch (error) {
    console.error('❌ Error generating sitemap.xml:', error);
  }
};

generateSitemap();