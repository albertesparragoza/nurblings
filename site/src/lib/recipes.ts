// Extension recipes, shown on the home page. Each is a preset (a plain
// config), drawn from the anchors and colours every part receives, so it fits
// every body and follows any theme. Each keeps its source as text beside it,
// so the code on the page is the code that drew the avatar next to it. Keep
// the two in step when editing.
import { createNurblings, type NurblingsConfig } from 'nurblings'
import { setFill, shade } from 'nurblings/themes'

export interface Recipe {
  id: string
  label: string
  /** what the code card is titled */
  head: string
  note: string
  config: NurblingsConfig
  code: string
}

export const RECIPES: Recipe[] = [
  {
    id: 'original',
    label: 'Original',
    head: 'nurblings',
    note: 'No extensions: the avatar as the seed draws it.',
    config: {},
    code: `createNurblings()`,
  },
  {
    id: 'body',
    label: 'Body',
    head: 'slots.body',
    note: 'Wrap the body and add a belly patch, a lighter shade of its own shell colour.',
    config: {
      slots: {
        body: ({ anchors: a, colours, n }, base) => {
          const { left, right, y } = a.band(0.2)
          return `${base()}<ellipse cx="${n(a.centre)}" cy="${n(y)}" rx="${n((right - left) * 0.28)}" ry="${n((a.base - y) * 0.6)}" fill="${shade(colours.shell, 0.5)}"/>`
        },
      },
    },
    code: `const belly = {
  slots: {
    body: ({ anchors: a, colours, n }, base) => {
      const { left, right, y } = a.band(0.2)
      return \`\${base()}<ellipse cx="\${n(a.centre)}" cy="\${n(y)}"
        rx="\${n((right - left) * 0.28)}" ry="\${n((a.base - y) * 0.6)}"
        fill="\${shade(colours.shell, 0.5)}"/>\`
    },
  },
}`,
  },
  {
    id: 'eyes',
    label: 'Eyes',
    head: 'slots.eyes',
    note: 'Keep the eyes and put round glasses over them, on the eye anchors.',
    config: {
      slots: {
        eyes: (
          {
            anchors: {
              eyes: [l, r],
            },
            n,
          },
          base,
        ) => {
          const size = l.rx * 1.7
          return `${base()}<g fill="none" stroke="#1b1b1b" stroke-width="1.3"><circle cx="${n(l.x)}" cy="${n(l.y)}" r="${n(size)}"/><circle cx="${n(r.x)}" cy="${n(r.y)}" r="${n(size)}"/><path d="M${n(l.x + size)} ${n(l.y)}H${n(r.x - size)}"/></g>`
        },
      },
    },
    code: `const glasses = {
  slots: {
    eyes: ({ anchors: { eyes: [l, r] }, n }, base) => {
      const size = l.rx * 1.7
      return \`\${base()}<g fill="none" stroke="#1b1b1b" stroke-width="1.3">
        <circle cx="\${n(l.x)}" cy="\${n(l.y)}" r="\${n(size)}"/>
        <circle cx="\${n(r.x)}" cy="\${n(r.y)}" r="\${n(size)}"/>
        <path d="M\${n(l.x + size)} \${n(l.y)}H\${n(r.x - size)}"/></g>\`
    },
  },
}`,
  },
  {
    id: 'mouth',
    label: 'Mouth',
    head: 'slots.mouth',
    note: 'Replace the mouth with a wide smile in the eye colour, as wide as the eyes are apart.',
    config: {
      slots: {
        mouth: ({ anchors: a, small, paint, n }) => {
          if (small) return ''
          const w = (a.eyes[1].x - a.eyes[0].x) * 0.35
          return `<path d="M${n(a.centre - w)} ${n(a.mouth)}Q${n(a.centre)} ${n(a.mouth + w)} ${n(a.centre + w)} ${n(a.mouth)}" fill="none"${paint('eye', 'stroke')} stroke-width="1.6" stroke-linecap="round"/>`
        },
      },
    },
    code: `const smile = {
  slots: {
    mouth: ({ anchors: a, small, paint, n }) => {
      if (small) return ''
      const w = (a.eyes[1].x - a.eyes[0].x) * 0.35
      return \`<path d="M\${n(a.centre - w)} \${n(a.mouth)}
        Q\${n(a.centre)} \${n(a.mouth + w)} \${n(a.centre + w)} \${n(a.mouth)}"
        fill="none"\${paint('eye', 'stroke')}
        stroke-width="1.6" stroke-linecap="round"/>\`
    },
  },
}`,
  },
  {
    id: 'extra',
    label: 'Extra',
    head: 'slots.extra',
    note: 'Swap the scarf, collar or hat for a heart pin on the chest.',
    config: {
      slots: {
        extra: ({ anchors: a, small, n }) => {
          if (small) return ''
          const x = a.chest.x + (a.band(0.2).right - a.chest.x) * 0.4
          const y = a.band(0.2).y
          return `<path d="M${n(x)} ${n(y + 2.6)}l-3-3a1.8 1.8 0 0 1 3-2.4a1.8 1.8 0 0 1 3 2.4z" fill="#e63972"/>`
        },
      },
    },
    code: `const pin = {
  slots: {
    extra: ({ anchors: a, small, n }) => {
      if (small) return ''
      const x = a.chest.x + (a.band(0.2).right - a.chest.x) * 0.4
      const y = a.band(0.2).y
      return \`<path d="M\${n(x)} \${n(y + 2.6)}l-3-3a1.8 1.8 0 0 1 3-2.4
        a1.8 1.8 0 0 1 3 2.4z" fill="#e63972"/>\`
    },
  },
}`,
  },
  {
    id: 'status',
    label: 'New part',
    head: 'parts.status',
    note: 'Add a part of your own: a status dot, read from props on each call, ringed in the container colour so it switches with the page.',
    config: {
      props: { status: 'online' },
      parts: {
        status: {
          after: 'mouth',
          small: true,
          draw: ({ anchors: a, props, paint, n }) => {
            const { right, y } = a.band(0.14)
            const fill = props.status === 'online' ? '#2e9e5b' : '#9a9a9a'
            return `<circle cx="${n(right - 2)}" cy="${n(y)}" r="7" fill="${fill}"${paint('ground', 'stroke')} stroke-width="2.5"/>`
          },
        },
      },
    },
    code: `const status = {
  parts: {
    status: {
      after: 'mouth',
      small: true,
      draw: ({ anchors: a, props, paint, n }) => {
        const { right, y } = a.band(0.14)
        const fill = props.status === 'online' ? '#2e9e5b' : '#9a9a9a'
        return \`<circle cx="\${n(right - 2)}" cy="\${n(y)}" r="7"
          fill="\${fill}"\${paint('ground', 'stroke')} stroke-width="2.5"/>\`
      },
    },
  },
}

avatars.nurbling(user.id, { props: { status: 'online' } })`,
  },
  {
    id: 'backdrop',
    label: 'Backdrop',
    head: 'slots.backdrop',
    note: 'Keep the container and give it your brand colour.',
    config: {
      slots: {
        backdrop: (_ctx, base) => setFill(base(), '#ffd166'),
      },
    },
    code: `const brand = {
  slots: { backdrop: (ctx, base) => setFill(base(), '#ffd166') },
}`,
  },
  {
    id: 'all',
    label: 'All together',
    head: 'use',
    note: 'Every recipe here is a preset. Stack them with use: each slot wraps what the ones before it drew.',
    config: {},
    code: `createNurblings({
  use: [belly, glasses, smile, pin, status, brand],
})`,
  },
]

// the last card combines every other recipe
const all = RECIPES.find((r) => r.id === 'all') as Recipe
all.config = { use: RECIPES.filter((r) => r !== all).map((r) => r.config) }

const instances = new Map(RECIPES.map((r) => [r.id, createNurblings(r.config)]))

/** One recipe's avatar, drawn on a round container. */
export const drawRecipe = (id: string, seed: string, size: number) =>
  instances.get(id)?.nurbling(seed, { size, background: 'circle', title: seed }) ?? ''
