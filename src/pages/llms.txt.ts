import { getCollection } from 'astro:content';
import site from '../data/site.json';

export async function GET() {
  const posts = (await getCollection('blog', ({ data }) => !data.draft))
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

  const lines = [
    `# ${site.title}`,
    '',
    `> ${site.description}`,
    '',
    'このサイトは、コンピューターサイエンス、ソフトウェア、AI、インフラ、開発・研究の実体験や考察を扱う個人技術ブログです。',
    '',
    '## Articles',
    '',
    ...posts.map((post) =>
      `- [${post.data.title}](https://blog.mantaroh.org/blog/${post.id}/)${post.data.description ? `: ${post.data.description}` : ''}`
    ),
    ''
  ];

  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8'
    }
  });
}
