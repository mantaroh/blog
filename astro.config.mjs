import { defineConfig } from 'astro/config';
import { remarkLinkifyBareUrls, rehypeLinkPreviews } from './src/plugins/link-preview.mjs';

export default defineConfig({
  site: 'https://blog.mantaroh.org',
  output: 'static',
  markdown: {
    remarkPlugins: [remarkLinkifyBareUrls],
    rehypePlugins: [rehypeLinkPreviews]
  }
});
