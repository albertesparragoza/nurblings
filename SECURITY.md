# Security policy

## Reporting a vulnerability

Report vulnerabilities privately through GitHub: open the repository's
**Security** tab and choose **Report a vulnerability**. Please do not open a
public issue for anything exploitable.

Include what you found, how to reproduce it, and what an attacker could do
with it. You will get an acknowledgement within seven days.

## Scope

Nurblings turns arbitrary strings into SVG. The areas that matter most:

- anything that lets a seed string inject markup or script into the SVG output
- denial of service through pathological seeds (very long, deeply nested
  Unicode, and so on)
- the hosted HTTP endpoint, once it exists
- supply-chain issues in the published packages

## What the library guarantees

- A seed only picks traits: it never appears in the SVG.
- Titles and transition keys are escaped before they reach the SVG.
- Colours must be 6-digit hex, trait names must come from fixed lists and
  numbers must be finite. Anything else throws a `RangeError`.
- `renderTraits()` checks every value in the traits it is handed, so traits
  read back from a database or a form can only fail, never inject markup.
- Theme names resolve to built-in themes only.
- Slots read a frozen copy of the traits and geometry, so a slot cannot change
  what the built-in parts draw, and a slot must return a string.
- Custom body designs are checked when an instance is created: finite
  numbers, a known plate zone and a plate grid of at most 12 by 12, so a
  design cannot stall rendering.

Two things stay with the caller:

- **Slots** insert your markup as it is. Build it from your own code and the
  traits, never from user input.
- **Content Security Policy:** animated avatars carry an inline `<style>`, and
  an avatar may carry a `style` attribute for its container clip, motion
  timing or dark mode. A strict policy needs `style-src 'unsafe-inline'` for
  avatars to look right. Nothing in the output ever needs `script-src`.

## How we check

Every push and pull request runs, besides lint, types and tests:

- a hostile-input test suite (`packages/nurblings/test/security.test.ts`)
- Semgrep with the rules in `.semgrep/`
- `pnpm audit` (high and above) and OSV-Scanner on the lockfile
- gitleaks for committed secrets

Once the repository is public, CodeQL and the OpenSSF Scorecard run as well.
A newly published dependency version waits a day before installs pick it up,
and only esbuild may run an install script.

## Supported versions

Before 1.0, only the latest release receives fixes.
