import { getCollection } from 'astro:content';

export async function GET() {
  const postsJa = (await getCollection('blog', ({ data }) => !data.draft))
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
  const postsEn = (await getCollection('blogEn', ({ data }) => !data.draft))
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

  const urls = [
    {
      loc: 'https://blog.mantaroh.org/',
      lastmod: postsJa[0]?.data.pubDate.toISOString()
    },
    {
      loc: 'https://blog.mantaroh.org/en/',
      lastmod: postsEn[0]?.data.pubDate.toISOString()
    },
    ...postsJa.map((post) => ({
      loc: `https://blog.mantaroh.org/blog/${post.id}/`,
      lastmod: post.data.pubDate.toISOString()
    })),
    ...postsEn.map((post) => ({
      loc: `https://blog.mantaroh.org/en/blog/${post.id}/`,
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
