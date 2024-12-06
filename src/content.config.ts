import { defineCollection, z } from 'astro:content'

import { glob } from 'astro/loaders'
import { blogSchema } from './frontmatter.schema'

// 3. Define your collection(s)
const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './content/blog' }),
  schema: blogSchema,
})

// 4. Export a single `collections` object to register your collection(s)
export const collections = { blog }
