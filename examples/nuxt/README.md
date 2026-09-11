# example-nuxt

A Nuxt example showing the `Nurbling` component from `@nurblings/vue`: a
grid of avatars, a size comparison row, a background shape row and one
hoverable animated avatar. The page server-renders the avatar SVGs into the
HTML.

Run from the repo root:

```sh
pnpm --filter example-nuxt dev
pnpm --filter example-nuxt build
pnpm --filter example-nuxt generate
```

`generate` writes a fully static site to `.output/public`.
