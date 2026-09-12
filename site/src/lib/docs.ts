// The docs in reading order, for the AI endpoints (llms.txt and friends).
import { getCollection } from 'astro:content'

const ORDER = ['getting-started', 'motion', 'customising', 'api']

export async function docsInOrder() {
  const docs = await getCollection('docs')
  const slug = (id: string) => id.replace(/^docs\//, '')
  return docs
    .map((entry) => ({ entry, slug: slug(entry.id) }))
    .sort((a, b) => ((ORDER.indexOf(a.slug) + 99) % 99) - ((ORDER.indexOf(b.slug) + 99) % 99))
}

export const text = (body: string, type = 'text/plain') =>
  new Response(body, { headers: { 'Content-Type': `${type}; charset=utf-8` } })
