// Slot recipes: one per drawn part, shown on the home page. Each keeps its
// source as text beside the function, so the code on the page is the code that
// drew the avatar next to it. Keep the two in step when editing.
import { createNurblings, type Slots } from 'nurblings'
import { setFill, shade } from 'nurblings/themes'

export interface Recipe {
  id: string
  label: string
  note: string
  slots: Slots
  code: string
}

export const RECIPES: Recipe[] = [
  {
    id: 'original',
    label: 'Original',
    note: 'No slots: the avatar as the seed draws it.',
    slots: {},
    code: `createNurblings()`,
  },
  {
    id: 'body',
    label: 'Body',
    note: 'Wrap the body and add a belly patch, a lighter shade of its own shell.',
    slots: {
      body: ({ traits, geometry: g }, base) =>
        `${base()}<ellipse cx="50" cy="${g.top + g.height * 0.8}" rx="${g.bw * 0.26}" ry="${g.height * 0.12}" fill="${shade(traits.palette.shell, 0.5)}"/>`,
    },
    code: `createNurblings({
  slots: {
    body: ({ traits, geometry: g }, base) =>
      \`\${base()}<ellipse cx="50" cy="\${g.top + g.height * 0.8}"
        rx="\${g.bw * 0.26}" ry="\${g.height * 0.12}"
        fill="\${shade(traits.palette.shell, 0.5)}"/>\`,
  },
})`,
  },
  {
    id: 'eyes',
    label: 'Eyes',
    note: 'Keep the eyes and put round glasses over them, from the eye traits.',
    slots: {
      eyes: ({ traits: { eyes: e }, geometry: g }, base) => {
        const y = g.top + e.depth * g.height
        const dx = (e.spacing * g.bw) / 2
        const r = e.size * g.bw * 0.85
        return `${base()}<g fill="none" stroke="#1b1b1b" stroke-width="1.3"><circle cx="${50 - dx}" cy="${y}" r="${r}"/><circle cx="${50 + dx}" cy="${y}" r="${r}"/><path d="M${50 - dx + r} ${y}H${50 + dx - r}"/></g>`
      },
    },
    code: `createNurblings({
  slots: {
    eyes: ({ traits: { eyes: e }, geometry: g }, base) => {
      const y = g.top + e.depth * g.height
      const dx = (e.spacing * g.bw) / 2
      const r = e.size * g.bw * 0.85
      return \`\${base()}<g fill="none" stroke="#1b1b1b" stroke-width="1.3">
        <circle cx="\${50 - dx}" cy="\${y}" r="\${r}"/>
        <circle cx="\${50 + dx}" cy="\${y}" r="\${r}"/>
        <path d="M\${50 - dx + r} \${y}H\${50 + dx - r}"/></g>\`
    },
  },
})`,
  },
  {
    id: 'mouth',
    label: 'Mouth',
    note: 'Replace the mouth with a wide smile. Skip it at 32 px and below, as the built-in one does.',
    slots: {
      mouth: ({ traits: t, geometry: g, small }) => {
        if (small) return ''
        const y = g.top + (t.eyes.depth + 0.17) * g.height
        const w = g.bw * 0.13
        return `<path d="M${50 - w} ${y}Q50 ${y + w} ${50 + w} ${y}" fill="none" stroke="${t.palette.eye}" stroke-width="1.6" stroke-linecap="round"/>`
      },
    },
    code: `createNurblings({
  slots: {
    mouth: ({ traits: t, geometry: g, small }) => {
      if (small) return ''
      const y = g.top + (t.eyes.depth + 0.17) * g.height
      const w = g.bw * 0.13
      return \`<path d="M\${50 - w} \${y}Q50 \${y + w} \${50 + w} \${y}"
        fill="none" stroke="\${t.palette.eye}"
        stroke-width="1.6" stroke-linecap="round"/>\`
    },
  },
})`,
  },
  {
    id: 'extra',
    label: 'Extra',
    note: 'Swap the scarf, pin or hat for your own badge: here, a heart pin.',
    slots: {
      extra: ({ geometry: g, small }) => {
        if (small) return ''
        const x = 50 + g.bw * 0.2
        const y = g.top + g.height * 0.8
        return `<path d="M${x} ${y + 2.6}l-3-3a1.8 1.8 0 0 1 3-2.4a1.8 1.8 0 0 1 3 2.4z" fill="#e63972"/>`
      },
    },
    code: `createNurblings({
  slots: {
    extra: ({ geometry: g, small }) => {
      if (small) return ''
      const x = 50 + g.bw * 0.2
      const y = g.top + g.height * 0.8
      return \`<path d="M\${x} \${y + 2.6}l-3-3a1.8 1.8 0 0 1 3-2.4
        a1.8 1.8 0 0 1 3 2.4z" fill="#e63972"/>\`
    },
  },
})`,
  },
  {
    id: 'backdrop',
    label: 'Backdrop',
    note: 'Keep the container and give it your brand colour.',
    slots: {
      backdrop: (_ctx, base) => setFill(base(), '#ffd166'),
    },
    code: `createNurblings({
  slots: {
    backdrop: (ctx, base) => setFill(base(), '#ffd166'),
  },
})`,
  },
]

const instances = new Map(RECIPES.map((r) => [r.id, createNurblings({ slots: r.slots })]))

/** One recipe's avatar, drawn on a round container. */
export const drawRecipe = (id: string, seed: string, size: number) =>
  instances.get(id)?.nurbling(seed, { size, background: 'circle', title: seed }) ?? ''
