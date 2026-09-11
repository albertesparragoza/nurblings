# Contributing

Thanks for wanting to help raise the Nurblings.

## Setup

```bash
git clone git@github.com:albertesparragoza/nurblings.git
cd nurblings
git config core.hooksPath .githooks
```

That points git at the hooks in `.githooks/`. They refuse direct commits
on `main` and `develop`, commit messages that are not Conventional Commits,
secret-shaped files, credential-looking strings and personal absolute paths.

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

## Adding traits

New silhouettes, eyes, antennae or extras ship as a new **generation** so that
no existing avatar ever changes. Open an issue before
building one: every trait is reviewed against the family's design rules, and
none may bring a seed closer to the flagship.

## Brand

Using the code is MIT. Using the names and the flagship character is covered by
[TRADEMARKS.md](TRADEMARKS.md).
