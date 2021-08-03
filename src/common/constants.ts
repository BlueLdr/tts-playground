export const VOICE_NAMES = [
  "Brian",
  "Amy",
  "Emma",
  "Joanna",
  "Kendra",
  "Kimberly",
  "Salli",
  "Joey",
  "Matthew",
  "Geraint",
];

export const SPEED_CHAR = "¡";
export const PAUSE_CHAR_SPEED_MODIFIED = "ᴾ";

export const DEFAULT_BITS_STRING = "uni300";

export const DEFAULT_HISTORY_STEPS_LIMIT = 256;

export const REPOSITORY_URL = "https://www.github.com/BlueLdr/tts-playground";

// calculated via linear regression of test data
export const PAUSE_CHAR_DURATION = {
  Brian: { normal: 0.1999461211, speed: 0.08355150677 },
  Amy: { normal: 0.1995261917, speed: 0.06229863459 },
  Emma: { normal: 0.200174812, speed: 0.05020200451 },
  Joanna: { normal: 0.2001859692, speed: 0.1044909511 },
  Kendra: { normal: 0.199556391, speed: 0.06293196165 },
  Kimberly: { normal: 0.200026191, speed: 0.1110108842 },
  Salli: { normal: 0.2003132805, speed: 0.04992818797 },
  Joey: { normal: 0.1998515038, speed: 0.09749575338 },
  Matthew: { normal: 0.2000170338, speed: 0.03287844361 },
  Geraint: { normal: 0.1995276872, speed: 0.1145263226 },
};
