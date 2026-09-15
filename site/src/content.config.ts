import { defineCollection } from 'astro:content'
import { readFileSync } from 'node:fs'
import { docsSchema } from '@astrojs/starlight/schema'
import { glob, type Loader } from 'astro/loaders'

// Search descriptions for the docs pages. They live here, not in the docs, so
// the root docs/ stays plain Markdown with nothing of the site in it.
const DESCRIPTIONS: Record<string, string> = {
  'docs/api': 'Every function, option and type the nurblings package exports.',
  'docs/customising':
    'Bring your brand palette, add or drop body designs, and replace any drawn part with createNurblings.',
  'docs/getting-started':
    'Install Nurblings and render your first avatar in Next.js, Nuxt, Astro or plain JavaScript.',
  'docs/motion':
    'Every Nurbling is alive by default. Tune or turn off its motion, and move avatars smoothly between places with morph().',
}

// The root docs/ folder is the single source: it reads on GitHub and renders
// here. Top-level files only: never widen the pattern into subfolders. Each
// page's title is its `# heading`; astro.config.mjs drops that heading from
// the body, because Starlight prints the title itself.
function libraryDocs(): Loader {
  const files = glob({
    base: '../docs',
    pattern: '*.md',
    generateId: ({ entry }) => `docs/${entry.replace(/\.md$/, '')}`,
  })
  return {
    name: 'library-docs',
    load: (context) =>
      files.load({
        ...context,
        parseData: (entry) => {
          const title = entry.filePath
            ? readFileSync(entry.filePath, 'utf8').match(/^# (.+)$/m)?.[1]
            : undefined
          return context.parseData({
            ...entry,
            data: { title, description: DESCRIPTIONS[entry.id], ...entry.data },
          })
        },
      }),
  }
}

export const collections = {
  docs: defineCollection({ loader: libraryDocs(), schema: docsSchema() }),
}
