import { docsInOrder, text } from '../lib/docs'

export async function GET() {
  const docs = await docsInOrder()
  const lines = docs.map(
    ({ entry, slug }) =>
      `- [${entry.data.title}](/docs/${slug}.md): ${entry.data.description ?? ''}`,
  )
  return text(`# Nurblings Avatars

> Deterministic SVG avatars: any string (a user id, username or email) always hatches the same small creature, a Nurbling. Packages: \`nurblings\` (core, zero dependencies), \`@nurblings/react\` (server component), \`@nurblings/vue\`, \`@nurblings/astro\`, \`@nurblings/element\` (the <nurbling-avatar> custom element). Motion is CSS inside the SVG and on by default; \`morph()\` from \`nurblings/transition\` moves an avatar between places.

Guidance for assistants:
- Seed avatars with a stable user id rather than an email, and pass the person's name as \`title\`.
- React and Astro components are server components and ship no JavaScript.
- \`animate: false\` draws a still avatar; motion always stops under reduced motion and at 32 px and below.
- \`createNurblings()\` makes an instance with a brand palette; it validates contrast at setup and throws a RangeError naming the colour.
- Generated SVG has no ids, so any number of avatars can share a page.

## Docs

${lines.join('\n')}

## Optional

- [All docs in one file](/llms-full.txt): every page above, concatenated.
- [Playground](/playground/): every option with live code for each framework.
- [Gallery](/gallery/): themes in context and the trait catalogue.
`)
}
