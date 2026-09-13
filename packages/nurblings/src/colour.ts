// Colour maths shared by the renderer, the tables and `nurblings/themes`.
// Integer channels only, except the luminance curve (see `contrast`).

/** A hex colour moved toward black (k < 0) or white (k > 0), integer channels only. */
export function shade(hex: string, k: number): string {
  const v = Number.parseInt(hex.slice(1), 16)
  const target = k < 0 ? 0 : 255
  const f = Math.min(1, Math.abs(k))
  const ch = (c: number) =>
    Math.round(c + (target - c) * f)
      .toString(16)
      .padStart(2, '0')
  return `#${ch(v >> 16)}${ch((v >> 8) & 255)}${ch(v & 255)}`
}

const lum = (hex: string) => {
  const v = Number.parseInt(hex.slice(1), 16)
  const lin = (c: number) => {
    const s = c / 255
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * lin(v >> 16) + 0.7152 * lin((v >> 8) & 255) + 0.0722 * lin(v & 255)
}

/** WCAG contrast ratio between two hex colours. */
export function contrast(a: string, b: string): number {
  // ponytail: Math.pow, but only at setup or once per themed avatar; engines could
  // only disagree on an exact threshold tie. A fixed sRGB table removes even that.
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x) as [number, number]
  return (hi + 0.05) / (lo + 0.05)
}

/** True when a colour is closer to white than to black. */
export const isLight = (hex: string) => contrast(hex, '#000000') >= contrast(hex, '#ffffff')

/**
 * `fg`, moved away from `bg` in small steps until the two reach `min`:1. Moves
 * toward black on a light ground and toward white on a dark one, so it always
 * ends readable.
 */
export function ensureContrast(fg: string, bg: string, min: number): string {
  const dir = isLight(bg) ? -1 : 1
  let out = fg.toLowerCase()
  for (let i = 1; i <= 20 && contrast(out, bg) < min; i++) out = shade(fg, dir * i * 0.05)
  return out
}
