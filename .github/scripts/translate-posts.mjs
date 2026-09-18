import { execFileSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const SOURCE_DIR = 'src/content/blog';
const TARGET_DIR = 'src/content/blog-en';
const MODEL = process.env.OPENAI_TRANSLATION_MODEL || 'gpt-5.6-luna';
const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  throw new Error('OPENAI_API_KEY is not configured.');
}

function git(args) {
  return execFileSync('git', args, { encoding: 'utf8' }).trim();
}

function published(markdown) {
  const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) return true;

  const draft = match[1].match(/^draft:\s*(true|false)\s*$/m);
  return !draft || draft[1] !== 'true';
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
        SOURCE_DIR,
      ])
        .split('\n')
        .filter((file) => file.endsWith('.md'));
    }
  }

  return git(['ls-files', SOURCE_DIR])
    .split('\n')
    .filter((file) => file.endsWith('.md'));
}

function extractOutputText(response) {
  return (response.output || [])
    .flatMap((item) => item.content || [])
    .filter((item) => item.type === 'output_text')
    .map((item) => item.text || '')
    .join('');
}

function cleanMarkdown(text) {
  const trimmed = text.trim();
  const fenced = trimmed.match(/^\`\`\`(?:markdown|md)?\s*\n([\s\S]*?)\n\`\`\`$/i);
  return (fenced ? fenced[1] : trimmed).trimEnd() + '\n';
}

async function translate(markdown, filename) {
  const instructions = [
    'Translate the provided Japanese technical blog Markdown into natural English.',
    'This is translation only: do not add facts, commentary, summaries, examples, or explanations.',
    'Preserve the author\'s tone, uncertainty, emphasis, and level of technical detail.',
    'Preserve Markdown structure exactly where practical.',
    'Preserve URLs, image paths, HTML, code blocks, inline code, commands, filenames, identifiers, product names, and proper nouns unless a standard English form exists.',
    'Preserve YAML frontmatter keys. Keep pubDate and draft values unchanged.',
    'Translate title and description values in frontmatter. Translate human-language tag values only when there is a natural English equivalent.',
    'Do not add the AI-translation disclosure; the site template adds it automatically.',
    'Return only the complete translated Markdown file, with no surrounding code fence.',
    `Source filename: ${filename}`,
  ].join('\n');

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      input: [
        {
          role: 'developer',
          content: [{ type: 'input_text', text: instructions }],
        },
        {
          role: 'user',
          content: [{ type: 'input_text', text: markdown }],
        },
      ],
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      `OpenAI API request failed (${response.status}): ${JSON.stringify(data)}`,
    );
  }

  const output = extractOutputText(data);
  if (!output) {
    throw new Error(`No translated text returned for ${filename}.`);
  }

  return cleanMarkdown(output);
}

await mkdir(TARGET_DIR, { recursive: true });

const files = sourceFiles();
if (files.length === 0) {
  console.log('No Japanese Markdown files need translation.');
  process.exit(0);
}

for (const sourcePath of files) {
  const source = await readFile(sourcePath, 'utf8');

  if (!published(source)) {
    console.log(`Skip draft: ${sourcePath}`);
    continue;
  }

  const targetPath = path.join(TARGET_DIR, path.basename(sourcePath));
  console.log(`Translate: ${sourcePath} -> ${targetPath} using ${MODEL}`);

  const translated = await translate(source, path.basename(sourcePath));
  await writeFile(targetPath, translated, 'utf8');
}

console.log('Translation finished.');
