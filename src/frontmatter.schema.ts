import { z } from 'zod'

const baseSchema = z.object({
  draft: z.boolean().default(false),
  featured: z.boolean().default(false),
  title: z.string(),
  date: z.date(),
})

/*
  Blog posts could be of two types —
  1. The posts you write in markdown files in content/blog/*.md
  2. External posts in other websites

  That's why the frontmatter schema for blog posts is one of the two possible types.
  If you don't want to link posts written in external websites, you could
  simplify this to just use the markdown schema.
*/
export const blogSchema = z.discriminatedUnion('external', [
  // markdown
  baseSchema.extend({
    external: z.literal(false),
    description: z.string().optional(),
    ogImagePath: z.string().optional(),
    canonicalUrl: z.string().optional(),
  }),
  // external link
  baseSchema.extend({
    external: z.literal(true),
    url: z.string(),
  }),
])

export const project = baseSchema.extend({
  url: z.string(),
})
