import { docsInOrder, text } from '../lib/docs'

export async function GET() {
  const docs = await docsInOrder()
  const pages = docs.map(({ entry }) => `# ${entry.data.title}\n\n${(entry.body ?? '').trim()}\n`)
  return text(`# Nurblings Avatars: full documentation\n\n${pages.join('\n---\n\n')}`)
}
