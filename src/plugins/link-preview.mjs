const PREVIEW_TIMEOUT_MS = 5000;
const MAX_HTML_BYTES = 600000;

function decodeEntities(value = '') {
  return value
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>');
}

function stripTags(value = '') {
  return decodeEntities(value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim());
}

function readMeta(html, key, attr = 'property') {
  const tags = html.match(/<meta\b[^>]*>/gi) || [];

  for (const tag of tags) {
    const attrs = {};
    const re = /([:\w-]+)\s*=\s*["']([^"']*)["']/g;
    let match;
    while ((match = re.exec(tag)) !== null) {
      attrs[match[1].toLowerCase()] = decodeEntities(match[2]);
    }

    if ((attrs[attr] || '').toLowerCase() === key.toLowerCase() && attrs.content) {
      return attrs.content.trim();
    }
  }

  return '';
}

function readTitle(html) {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match ? stripTags(match[1]) : '';
}

function truncate(value, length) {
  if (!value || value.length <= length) return value;
  return value.slice(0, length - 1).trimEnd() + '…';
}

async function fetchPreview(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PREVIEW_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; mantaroh-blog-link-preview/1.0; +https://blog.mantaroh.org)',
        Accept: 'text/html,application/xhtml+xml',
      },
    });

    if (!response.ok) return null;

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html') && !contentType.includes('application/xhtml+xml')) {
      return null;
    }

    const reader = response.body && response.body.getReader();
    if (!reader) return null;

    const decoder = new TextDecoder();
    let html = '';
    let bytes = 0;

    while (true) {
      const part = await reader.read();
      if (part.done) break;

      bytes += part.value.byteLength;
      if (bytes > MAX_HTML_BYTES) {
        await reader.cancel();
        break;
      }

      html += decoder.decode(part.value, { stream: true });
    }
    html += decoder.decode();

    const finalUrl = response.url || url;
    const title =
      readMeta(html, 'og:title') ||
      readMeta(html, 'twitter:title', 'name') ||
      readTitle(html);

    const description =
      readMeta(html, 'og:description') ||
      readMeta(html, 'description', 'name') ||
      readMeta(html, 'twitter:description', 'name');

    const imageValue =
      readMeta(html, 'og:image') ||
      readMeta(html, 'twitter:image', 'name');

    let image = '';
    if (imageValue) {
      try {
        image = new URL(imageValue, finalUrl).href;
      } catch {
        image = '';
      }
    }

    const hostname = new URL(finalUrl).hostname.replace(/^www\./, '');

    return {
      title: truncate(title || hostname, 140),
      description: truncate(description, 220),
      image,
      hostname,
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function isExternalHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export function remarkLinkifyBareUrls() {
  return (tree) => {
    const walk = (node) => {
      if (!node || !Array.isArray(node.children)) return;

      for (const child of node.children) {
        if (
          child.type === 'paragraph' &&
          child.children &&
          child.children.length === 1 &&
          child.children[0] &&
          child.children[0].type === 'text'
        ) {
          const value = child.children[0].value.trim();
          if (/^https?:\/\/\S+$/.test(value)) {
            child.children = [{
              type: 'link',
              url: value,
              title: null,
              children: [{ type: 'text', value }],
            }];
          }
        }

        walk(child);
      }
    };

    walk(tree);
  };
}

export function rehypeLinkPreviews() {
  return async (tree) => {
    const jobs = [];

    const walk = (node) => {
      if (!node || !Array.isArray(node.children)) return;

      for (let index = 0; index < node.children.length; index += 1) {
        const child = node.children[index];

        if (
          child.type === 'element' &&
          child.tagName === 'p' &&
          child.children &&
          child.children.length === 1 &&
          child.children[0] &&
          child.children[0].type === 'element' &&
          child.children[0].tagName === 'a'
        ) {
          const anchor = child.children[0];
          const href = anchor.properties && anchor.properties.href;

          if (typeof href === 'string' && isExternalHttpUrl(href)) {
            jobs.push(fetchPreview(href).then((preview) => {
              if (!preview) return;

              const contentChildren = [{
                type: 'element',
                tagName: 'strong',
                properties: { className: ['link-preview-title'] },
                children: [{ type: 'text', value: preview.title }],
              }];

              if (preview.description) {
                contentChildren.push({
                  type: 'element',
                  tagName: 'span',
                  properties: { className: ['link-preview-description'] },
                  children: [{ type: 'text', value: preview.description }],
                });
              }

              contentChildren.push({
                type: 'element',
                tagName: 'span',
                properties: { className: ['link-preview-domain'] },
                children: [{ type: 'text', value: preview.hostname }],
              });

              const cardChildren = [{
                type: 'element',
                tagName: 'span',
                properties: { className: ['link-preview-content'] },
                children: contentChildren,
              }];

              if (preview.image) {
                cardChildren.push({
                  type: 'element',
                  tagName: 'img',
                  properties: {
                    className: ['link-preview-image'],
                    src: preview.image,
                    alt: '',
                    loading: 'lazy',
                    decoding: 'async',
                  },
                  children: [],
                });
              }

              node.children[index] = {
                type: 'element',
                tagName: 'a',
                properties: {
                  className: ['link-preview'],
                  href,
                  rel: ['noopener', 'noreferrer'],
                },
                children: cardChildren,
              };
            }));
          }
        }

        walk(child);
      }
    };

    walk(tree);
    await Promise.all(jobs);
  };
}
