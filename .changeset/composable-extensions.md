---
"nurblings": minor
---

Extensions combine. `createNurblings` takes `parts` (new parts, painted after the part they name), `props` (data for parts, per config and per call) and `use` (presets, each an ordinary config); `compose()` does the same outside it. Slots chain, each later one wrapping what the earlier ones drew, and they can change added parts as well as built-in ones. Every slot and part receives the same context: `anchors` (eyes, brow, mouth, chest, crown, body bands), `colours` as drawn for the mode, `paint()` that follows `mode: 'auto'`, a seeded `random()` per part, the theme, the call's options and props, and `n()` and `esc()`. Unknown slot names and part positions throw at setup. The plain `nurbling()` output is unchanged.
