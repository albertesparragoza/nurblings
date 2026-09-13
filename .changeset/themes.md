---
"nurblings": minor
"@nurblings/react": minor
"@nurblings/vue": minor
"@nurblings/astro": minor
"@nurblings/element": minor
---

Themes and page modes. Ten built-in themes in `nurblings/themes` (`lagoon`, `punch`, `candy`, `picnic`, `sorbet`, `terracotta`, `marble`, `riso`, `lime`, `bauhaus`), passed by name to every component (`theme="lagoon"`) or to `createNurblings({ theme })`. `palette()` turns 2 to 5 colours into a theme, and repairs contrast instead of refusing it. `mode: 'light' | 'dark' | 'auto'` changes the container colour for the page and keeps antennae readable; `auto` follows the OS setting or a `data-theme="dark"` or `.dark` ancestor with CSS only. Colour helpers (`contrast`, `ensureContrast`, `readableOn`, `shade`, `pickBy`, `recolour`, `setFill`) replace most slot code. The default family is unchanged.
