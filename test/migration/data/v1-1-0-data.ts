export const OLD_MESSAGES = [
  {
    name: "Sample Message",
    text: "This is a sample message. No silly noises here boink",
    options: {
      bits: "",
      speed: false,
      max_length: 255,
    },
  },
  {
    name: "Silly Message",
    text: "This is a silly message. Do not send this message to the streamer. OOHOO HOO ᴾᴾᴾ HE DOESN'T KNOW LMAO ᴾᴾᴾᴾᴾᴾ HE LACKS CRITICAL INFORMATION OMEGA LAUGHING ᴾᴾᴾᴾᴾᴾᴾ",
    options: {
      bits: "",
      speed: true,
      max_length: 255,
    },
  },
  {
    name: "Test Message",
    text: "This is a test message.",
    options: {
      bits: "",
      speed: true,
      max_length: 255,
    },
  },
] as const;

export const NEW_MESSAGES: TTS.Message[] = [
  {
    id: "sample-message-1",
    name: "Sample Message",
    text: "This is a sample message. No silly noises here boink",
    options: {
      bits: "",
      speed: false,
      max_length: 255,
      speed_char: "¡",
      voice: "Brian",
    },
  },
  {
    id: "sample-message-2",
    name: "Silly Message",
    text: "This is a silly message. Do not send this message to the streamer. OOHOO HOO ᴾᴾᴾ HE DOESN'T KNOW LMAO ᴾᴾᴾᴾᴾᴾ HE LACKS CRITICAL INFORMATION OMEGA LAUGHING ᴾᴾᴾᴾᴾᴾᴾ",
    options: {
      bits: "",
      speed: true,
      max_length: 255,
      speed_char: "¡",
      voice: "Brian",
    },
  },
  {
    id: "",
    name: "Test Message",
    text: "This is a test message.",
    options: {
      bits: "",
      speed: true,
      max_length: 255,
      speed_char: "¡",
      voice: "Brian",
    },
  },
];
