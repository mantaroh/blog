import { getCollection } from 'astro:content';

export async function GET() {
  const posts = (await getCollection('blog', ({ data }) => !data.draft))
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

  const urls = [
    {
      loc: 'https://blog.mantaroh.org/',
      lastmod: posts[0]?.data.pubDate.toISOString()
    },
    ...posts.map((post) => ({
      loc: `https://blog.mantaroh.org/blog/${post.id}/`,
      lastmod: post.data.pubDate.toISOString()
    }))
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(({ loc, lastmod }) => `  <url>
    <loc>${loc}</loc>${lastmod ? `
    <lastmod>${lastmod}</lastmod>` : ''}
  </url>`).join('\n')}
</urlset>
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8'
    }
  });
}
