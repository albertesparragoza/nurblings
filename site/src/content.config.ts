import { defineCollection } from 'astro:content'
import { docsSchema } from '@astrojs/starlight/schema'
import { glob } from 'astro/loaders'

// The root docs/ folder is the single source: it reads on GitHub and renders
// here. Top-level files only: never widen the pattern into subfolders.
export const collections = {
  docs: defineCollection({
    loader: glob({
      base: '../docs',
      pattern: '*.md',
      generateId: ({ entry }) => `docs/${entry.replace(/\.md$/, '')}`,
    }),
    schema: docsSchema(),
  }),
}
