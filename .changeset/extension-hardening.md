---
"nurblings": patch
---

Slots now read a frozen copy of the traits and geometry and must return a string, so a slot can no longer change what the built-in parts draw after it. Custom body designs are checked when an instance is created: finite numbers, a known plate zone and at most 12 plate rows and columns. `renderTraits()` applies the same plate grid limit.
