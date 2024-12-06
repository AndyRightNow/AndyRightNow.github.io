import { defineConfig } from 'astro/config'
import sitemap from '@astrojs/sitemap'
import tailwind from '@astrojs/tailwind'

import mdx from '@astrojs/mdx'

const SERVER_PORT = 3000

const BASE_URL = (process.env.npm_lifecycle_script || '').includes('astro build')
  ? 'https://andyrightnow.github.io'
  : `http://localhost:${SERVER_PORT}`

export default defineConfig({
  server: { port: SERVER_PORT },
  site: BASE_URL,
  integrations: [
    sitemap(),
    tailwind({
      config: { applyBaseStyles: false },
    }),
    mdx(),
  ],
})
