export type MouthShape = 0 | 1 | 2 | 3 | 4 | 5;

const HANGUL_BASE_CODE = 0xac00;
const HANGUL_END_CODE = 0xd7a3;
const HANGUL_FINAL_COUNT = 28;
const HANGUL_MEDIAL_COUNT = 21;
const CLOSED_MOUTH_CHARS = new Set([".", " ", ",", "!", "?", "\n", "\t", "…"]);
const DEFAULT_MOUTH_SHAPE_HOLD_MS = 120;
const PUNCTUATION_HOLD_MS: Record<string, number> = {
  ".": 280,
  ",": 180,
  " ": 90,
  "\n": 220,
  "\t": 120,
  "!": 260,
  "?": 260,
  "…": 340,
};

const medialIndexToMouthShape: Record<number, MouthShape> = {
  0: 1,
  1: 2,
  2: 1,
  3: 2,
  4: 2,
  5: 2,
  6: 2,
  7: 2,
  8: 4,
  9: 1,
  10: 1,
  11: 1,
  12: 4,
  13: 5,
  14: 5,
  15: 5,
  16: 5,
  17: 5,
  18: 5,
  19: 3,
  20: 3,
};

const jamoToMouthShape: Record<string, MouthShape> = {
  "ㅏ": 1,
  "ㅑ": 1,
  "ㅘ": 1,
  "ㅙ": 1,
  "ㅚ": 1,
  "ㅐ": 2,
  "ㅒ": 2,
  "ㅔ": 2,
  "ㅖ": 2,
  "ㅣ": 3,
  "ㅢ": 3,
  "ㅗ": 4,
  "ㅛ": 4,
  "ㅜ": 5,
  "ㅠ": 5,
  "ㅝ": 5,
  "ㅞ": 5,
  "ㅟ": 5,
  "ㅡ": 5,
};

export const getMouthShapeFromChar = (char: string): MouthShape => {
  if (!char || isClosedMouthChar(char)) {
    return 0;
  }

  const jamoShape = jamoToMouthShape[char];
  if (jamoShape !== undefined) {
    return jamoShape;
  }

  const charCode = char.charCodeAt(0);
  if (charCode < HANGUL_BASE_CODE || charCode > HANGUL_END_CODE) {
    return 0;
  }

  const syllableIndex = charCode - HANGUL_BASE_CODE;
  const medialIndex =
    Math.floor(syllableIndex / HANGUL_FINAL_COUNT) % HANGUL_MEDIAL_COUNT;

  return medialIndexToMouthShape[medialIndex] ?? 0;
};

export const isClosedMouthChar = (char: string): boolean => {
  return CLOSED_MOUTH_CHARS.has(char);
};

export const getPunctuationHoldMs = (char: string): number => {
  return PUNCTUATION_HOLD_MS[char] ?? DEFAULT_MOUTH_SHAPE_HOLD_MS;
};
