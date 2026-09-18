import { getCollection } from 'astro:content';
import siteJa from '../data/site.json';
import siteEn from '../data/site.en.json';

export async function GET() {
  const postsJa = (await getCollection('blog', ({ data }) => !data.draft))
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
  const postsEn = (await getCollection('blogEn', ({ data }) => !data.draft))
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

  const lines = [
    `# ${siteJa.title}`,
    '',
    `> ${siteJa.description}`,
    '',
    'A bilingual personal technical blog covering computer science, software, AI, infrastructure, development, and research.',
    '',
    '## Japanese Articles',
    '',
    ...postsJa.map((post) =>
      `- [${post.data.title}](https://blog.mantaroh.org/blog/${post.id}/)${post.data.description ? `: ${post.data.description}` : ''}`
    ),
    '',
    `## English Articles`,
    '',
    `> ${siteEn.description}`,
    '',
    ...postsEn.map((post) =>
      `- [${post.data.title}](https://blog.mantaroh.org/en/blog/${post.id}/)${post.data.description ? `: ${post.data.description}` : ''}`
    ),
    ''
  ];

  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8'
    }
  });
}
