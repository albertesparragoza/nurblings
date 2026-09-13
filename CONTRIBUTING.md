# Contributing

Thanks for wanting to help raise the Nurblings.

## Setup

You need Node 22.13 or newer (pnpm 11 requires it; the published packages
themselves run on any current Node). pnpm comes through corepack:

```bash
git clone git@github.com:albertesparragoza/nurblings.git
cd nurblings
corepack enable
pnpm install
pnpm build
git config core.hooksPath .githooks
```

The last line points git at the hooks in `.githooks/`. They refuse direct
commits on `main` and `develop`, commit messages that are not Conventional
Commits, secret-shaped files, credential-looking strings and personal absolute
paths.

## Everyday commands

| Command | What it does |
| --- | --- |
| `pnpm test` | Runs every test in every package |
| `pnpm lint` | Checks formatting and lint rules (`pnpm format` fixes formatting) |
| `pnpm typecheck` | Type-checks every package |
| `pnpm build` | Builds every package |
| `pnpm size` | Checks every package against its size budget |
| `pnpm sheet` | Renders the trait sheet to `wip/trait-sheet.html` |

## Layout

| Path | Holds |
| --- | --- |
| `packages/nurblings` | The core: seeds, traits, the SVG renderer. No runtime dependencies. |
| `packages/react`, `packages/vue`, `packages/astro` | Thin framework components over the core |
| `examples/` | Small apps that use the published packages, built in CI |
| `docs/` | Guides and the API reference |

## Branches (git flow)

| Branch | Holds | Receives |
| --- | --- | --- |
| `main` | released code only, every commit tagged | merges from `release/*` and `hotfix/*`, through pull requests |
| `develop` | the next release | merges from work branches, through pull requests |
| `feat/*`, `fix/*`, `docs/*`, `chore/*`, `refactor/*`, `perf/*`, `test/*`, `ci/*`, `build/*`, `style/*` | one change each | your commits |
| `release/x.y.z` | release preparation | cut from `develop` |
| `hotfix/x.y.z` | an urgent fix to a release | cut from `main` |

1. Branch from `develop`: `git switch -c feat/gaze-follow develop`
2. Open a pull request into `develop`.
3. Pull requests merge with a merge commit (`--no-ff`), never squash, so each
   branch stays visible in history.

## Commits

Single-line [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(eyes): add almond eye shape to generation 2
fix(seed): normalise full-width digits before hashing
```

Types: `feat fix refactor chore docs style perf test build ci revert`. Lower-case
scope and description, imperative mood. One logical change per commit: if a
commit message needs "and", it is probably two commits.

## Changesets

A pull request that changes a published package adds a changeset:

```bash
pnpm changeset
```

Pick the packages, the kind of change (patch, minor, major) and write one line
for the changelog. Release branches turn pending changesets into versions and
changelog entries.

## Tests

- Every change to behaviour comes with a test.
- The golden fixtures in `packages/nurblings/test/fixtures/` pin what every
  seed renders. Never edit them to make a test pass: if they change, existing
  avatars changed, and that is only allowed in a new generation.
- Rendering must be byte-identical on every engine. Geometry uses only basic
  arithmetic and rounds every number to two decimals; there are notes at the
  top of `packages/nurblings/src/svg.ts`.

## Adding traits

New silhouettes, eyes, antennae, colours or extras ship as a new
**generation** so that no existing avatar ever changes. Open a trait proposal
issue before building one: every trait is reviewed against the family's
design rules, and none may bring a seed closer to the flagship. Check your
trait on the sheet (`pnpm sheet`) at every size, on light and dark pages, in
monochrome and as a favicon.

## Adding a theme

Themes change colours only, so a new one needs no new generation. Built-in
themes live in `packages/nurblings/src/themes.ts`, and the tests in
`packages/nurblings/test/themes.test.ts` check every face in them stays
readable. Open an issue with the colours and a gallery screenshot before
building one; a palette that is not built in can always be shared as a
`palette([...])` snippet.

## Brand

Using the code is MIT. Using the names and the flagship character is covered by
[TRADEMARKS.md](TRADEMARKS.md).
