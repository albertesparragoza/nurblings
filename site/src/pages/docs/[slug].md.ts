// Markdown source for every docs page (/docs/<page>.md), for AI assistants.
import type { APIRoute, GetStaticPaths } from 'astro'
import { absoluteLinks, docsInOrder, text } from '../../lib/docs'

export const getStaticPaths = (async () => {
  const docs = await docsInOrder()
  return docs.map(({ entry, slug }) => ({
    params: { slug },
    props: { title: entry.data.title, body: entry.body ?? '' },
  }))
}) satisfies GetStaticPaths

export const GET: APIRoute = ({ props }) =>
  text(`# ${props.title}\n\n${absoluteLinks(String(props.body).trim())}\n`, 'text/markdown')
