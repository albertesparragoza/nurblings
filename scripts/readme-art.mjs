// Writes the README family banner from the built core: `pnpm build && node scripts/readme-art.mjs`.
// One Nurbling per body design, each on its own squircle so it reads on light and dark pages.
import { writeFileSync } from 'node:fs'
import { nurbling, SILHOUETTES } from '../packages/nurblings/dist/index.js'

const SIZE = 96
const GAP = 16
const PER_ROW = 5
const seeds = [
  'ada',
  'grace',
  'linus',
  'margaret',
  'alan',
  'barbara',
  'dennis',
  'frances',
  'ken',
  'radia',
]

const cells = Object.keys(SILHOUETTES).map((silhouette, i) => {
  const x = (i % PER_ROW) * (SIZE + GAP)
  const y = Math.floor(i / PER_ROW) * (SIZE + GAP)
  const svg = nurbling(seeds[i], {
    silhouette,
    size: SIZE,
    background: 'squircle',
    title: seeds[i],
  })
  return svg.replace('<svg ', `<svg x="${x}" y="${y}" `)
})

const rows = Math.ceil(cells.length / PER_ROW)
const w = PER_ROW * (SIZE + GAP) - GAP
const h = rows * (SIZE + GAP) - GAP
writeFileSync(
  new URL('../.github/assets/family.svg', import.meta.url),
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="Ten Nurblings, one per body design">${cells.join('')}</svg>\n`,
)
