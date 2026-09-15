// SEO and sharing: the one place the site's metadata copy lives. Components read
// it; edit the words here, not in pages.
//
// Two kinds of copy, written for two readers:
// - `title` and `description` are read on a search results page, against other
//   results, by someone who typed a query.
// - `share` is read beside the card when a link is pasted into a chat or a
//   feed, by someone who did not ask for it. It says the page's other sharp
//   line instead of repeating the search title, and `alt` says what the card
//   shows.

export const site = {
  name: 'Nurblings',
  /** added to every page title but the home page's */
  titleSuffix: 'Nurblings Avatars',
  repo: 'https://github.com/albertesparragoza/nurblings',
  npm: 'https://www.npmjs.com/package/nurblings',
  author: {
    name: 'Albert Esparragoza',
    url: 'https://albertesparragoza.com',
    github: 'https://github.com/albertesparragoza',
  },
  /** the card for any page without one of its own */
  ogImage: '/og/default.jpg',
  /** every card is drawn at this size by site/scripts/make-og-cards.mjs */
  ogImageSize: [1200, 630] as const,
  /** the browser chrome, matching --paper in light and dark */
  themeColor: { light: '#fff8ee', dark: '#1e1830' },
}

interface ShareCopy {
  title: string
  description: string
  alt: string
}

interface PageSeo {
  /** omitted on the home page, which uses the site's own title */
  title?: string
  description: string
  share: ShareCopy
  ogImage: string
}

export type PageKey = 'home' | 'playground' | 'gallery' | 'ai' | 'nurbi'

export const pages: Record<PageKey, PageSeo> = {
  home: {
    description:
      'Small animated avatars for React, Vue, Astro and plain HTML. Every account gets a creature of its own that breathes, blinks and looks the same everywhere.',
    share: {
      title: 'A small creature for every account',
      description:
        'The same string always hatches the same Nurbling: SVG avatars that breathe and blink with CSS alone, for React, Vue, Astro and plain HTML.',
      alt: 'A row of Nurblings, small pastel creatures with antennae, each one different, under the name Nurblings.',
    },
    ogImage: '/og/home.jpg',
  },
  playground: {
    title: 'Playground',
    description:
      'Type any name and watch its Nurbling hatch. Try every theme, size, mood and container, then copy the code for React, Vue, Astro, HTML or plain JavaScript.',
    share: {
      title: 'Type a name, meet its creature',
      description:
        'Every option of the Nurblings avatars, live in the browser, with the code to copy for your framework.',
      alt: 'Nurblings in different sizes and containers beside the word Playground.',
    },
    ogImage: '/og/playground.jpg',
  },
  gallery: {
    title: 'Gallery',
    description:
      'Every Nurbling design, theme and trait side by side: ten body designs, ten themes, light and dark pages, and the parts you can swap.',
    share: {
      title: 'Ten designs, ten themes, one family',
      description:
        'The whole Nurblings family at a glance: every body design, every theme, and how they look on light and dark pages.',
      alt: 'A grid of Nurblings in ten themes beside the word Gallery.',
    },
    ogImage: '/og/gallery.jpg',
  },
  ai: {
    title: 'AI skill',
    description:
      'One skill teaches Claude Code, Cursor, Codex and other coding agents how to add Nurblings: the right package, stable-id seeds, accessible names, themes and motion.',
    share: {
      title: 'Give your coding agent the Nurblings skill',
      description:
        'One install, and "give every commenter an avatar" comes back with the right package, stable ids and accessible names.',
      alt: 'Three Nurblings beside the words AI skill.',
    },
    ogImage: '/og/ai.jpg',
  },
  nurbi: {
    title: 'The one who wondered',
    description:
      'The legend of Nurbi, who woke on a blank page, and of the kin every spoken name has given him since.',
    share: {
      title: 'The legend of Nurbi',
      description:
        'He woke on a blank page and wondered what he was. Every name spoken since has given him kin.',
      alt: 'Nurbi, an ivory creature with two pink antennae, on a dark ground.',
    },
    ogImage: '/og/nurbi.jpg',
  },
}

/** the docs pages share one card; their titles and descriptions come from each doc */
export const docsCard = {
  image: '/og/docs.jpg',
  alt: 'Nurblings beside the word Docs and a short code sample.',
}
