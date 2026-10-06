import { execFileSync } from 'node:child_process';

const SITE = 'https://blog.mantaroh.org';
const HOST = 'blog.mantaroh.org';
const KEY = '8f3d7c2a6b4e91d0c5a7f2b8e1d6c3a9';
const KEY_LOCATION = `${SITE}/${KEY}.txt`;

function git(args) {
  return execFileSync('git', args, { encoding: 'utf8' }).trim();
}

function sourceFiles() {
  const eventName = process.env.EVENT_NAME || 'workflow_dispatch';

  if (eventName === 'push') {
    const before = process.env.BEFORE_SHA;
    const after = process.env.AFTER_SHA || 'HEAD';

    if (before && !/^0+$/.test(before)) {
      return git([
        'diff',
        '--name-only',
        '--diff-filter=AM',
        before,
        after,
        '--',
        'src/content/blog',
      ])
        .split('\n')
        .filter((file) => file.endsWith('.md'));
    }
  }

  return git(['ls-files', 'src/content/blog'])
    .split('\n')
    .filter((file) => file.endsWith('.md'));
}

const ids = [...new Set(sourceFiles().map((file) => file.split('/').pop().replace(/\.md$/, '')))];
if (ids.length === 0) {
  console.log('No article URLs to submit to IndexNow.');
  process.exit(0);
}

const urlList = [
  `${SITE}/`,
  `${SITE}/en/`,
  `${SITE}/sitemap.xml`,
  `${SITE}/rss.xml`,
  `${SITE}/en/rss.xml`,
  ...ids.flatMap((id) => [
    `${SITE}/blog/${id}/`,
    `${SITE}/en/blog/${id}/`,
  ]),
];

const response = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
  },
  body: JSON.stringify({
    host: HOST,
    key: KEY,
    keyLocation: KEY_LOCATION,
    urlList,
  }),
});

if (![200, 202].includes(response.status)) {
  const body = await response.text();
  throw new Error(`IndexNow submission failed (${response.status}): ${body}`);
}

console.log(`IndexNow accepted ${urlList.length} URLs with status ${response.status}.`);
