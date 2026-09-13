---
"nurblings": patch
---

`renderTraits()` now checks every value in the traits it draws and throws a `RangeError` for anything `traits()` could not have produced, so traits read back from a database or a form can never inject markup. `themeOf()` and the `theme` prop accept only the names of built-in themes.
