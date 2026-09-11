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

## Supported versions

Before 1.0, only the latest release receives fixes.
