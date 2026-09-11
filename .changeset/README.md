# Changesets

Every pull request that changes a published package adds a changeset:

```bash
pnpm changeset
```

Pick the packages, the bump (patch, minor, major) and write one line for the
changelog. Release branches turn the pending changesets into version bumps and
`CHANGELOG.md` entries.
