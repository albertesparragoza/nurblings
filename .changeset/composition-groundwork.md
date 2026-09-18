---
'nurblings': minor
'@nurblings/element': patch
---

Groundwork for the composition framework, plus two render fixes.

- `cssColour` is exported: a colour heading for a `style` attribute is checked
  for shape rather than escaped, because `esc` escapes XML and a CSS
  declaration is not XML. Closes a CodeQL `js/html-constructed-from-input`
  finding on the renderer's `style` attribute.
- `Slot`, `Part.draw`, `Variant.draw`, `Drawn` and `Extension` now document
  that their output is written into the SVG unescaped, and what that makes the
  author responsible for. The behaviour is unchanged; the contract was only
  written down in the guide, not at the API.
- `@nurblings/element` no longer rewrites its DOM when a re-render produces
  identical markup, so a framework setting attributes to the values they
  already had stops restarting the CSS animations.
