// Nurbi's body profile, measured from the flagship drawing: the half-width as a
// share of the widest half-width, at 33 even heights from the base (0) to the
// apex (1). Every Nurbling's outline is a mild variation of this one, which is
// what keeps the family recognisably Nurbi's.

export const NURBI_PROFILE: readonly number[] = [
  0, 0.57, 0.737, 0.83, 0.891, 0.931, 0.959, 0.979, 0.991, 0.998, 1, 0.997, 0.994, 0.986, 0.978,
  0.968, 0.956, 0.942, 0.927, 0.907, 0.888, 0.866, 0.84, 0.812, 0.781, 0.735, 0.677, 0.614, 0.531,
  0.441, 0.339, 0.208, 0,
]

/** Height of Nurbi's widest point, as a fraction of height from the base. */
export const NURBI_BELLY = 0.313
