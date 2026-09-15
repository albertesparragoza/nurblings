# Website

The Nurblings website: home, playground, gallery, the agent skill page and the
docs. Astro and Starlight, static output. It is not published to npm.

The docs pages render the Markdown in the root [`docs/`](../docs) folder, which
stays plain Markdown for GitHub. Each page's title is its `# heading`; search
descriptions live in `src/content.config.ts`. Nothing in `docs/` refers to the
site, so keep site-only details here.

```sh
pnpm install
pnpm build                # the packages the site renders
pnpm --filter site dev
```

CI builds the site only when `site/`, `docs/` or `packages/` change.
