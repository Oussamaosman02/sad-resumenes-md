import vercel from '@astrojs/vercel/serverless';
import { defineConfig } from 'astro/config';
//import { defineConfig } from 'astro/config';
import { remarkReadingTime } from './remark-reading-time.mjs';

// https://astro.build/config
//
// https://astro.build/config
export default defineConfig({
  markdown: {
    remarkPlugins: [remarkReadingTime],
    extendDefaultPlugins: true,
  },
  output: 'server',
  adapter: vercel(),
});
