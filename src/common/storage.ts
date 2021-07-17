export const get_stored_snippets = (): TTS.SnippetsSection[] =>
  (
    JSON.parse(
      localStorage.getItem("tts-snippets") ||
        localStorage.getItem("tts-scratch")
    ) || sample_snippets
  ).map(section => ({
    ...section,
    data: section.data.map(row => {
      const { defaultCount, ...options } = row.options ?? {};
      const mapped = { ...row, options };
      if (!isNaN(parseInt(defaultCount))) {
        mapped.options.defaultCount = parseInt(defaultCount);
      }
      return mapped;
    }),
  }));
export const set_stored_snippets = (value: TTS.SnippetsSection[]) =>
  localStorage.setItem("tts-snippets", JSON.stringify(value));

export const get_stored_messages = (): TTS.Message[] =>
  JSON.parse(localStorage.getItem("tts-messages")) || sample_messages;
export const set_stored_messages = (value: TTS.Message[]) =>
  localStorage.setItem("tts-messages", JSON.stringify(value));

export const get_stored_state = (): TTS.AppState =>
  JSON.parse(localStorage.getItem("tts-state"));
export const set_stored_state = (value: TTS.AppState) =>
  localStorage.setItem("tts-state", JSON.stringify(value));

const sample_snippets: TTS.SnippetsSection[] = [
  {
    name: "Sample Snippets",
    open: true,
    data: [
      {
        text: "VB",
        options: {
          prefix: "a",
          suffix: "",
          default_count: 5,
          space_after: true,
          space_before: true,
        },
      },
      {
        text: "brur",
        options: {
          prefix: "ur",
          suffix: "?^",
          default_count: 2,
          space_after: true,
          space_before: true,
        },
      },
    ],
  },
  {
    name: "Sprinkler Noises",
    open: false,
    data: [
      {
        text: "PX",
        options: {
          prefix: "y",
          suffix: "",
          default_count: 5,
          space_after: true,
          space_before: true,
        },
      },
      {
        text: "HJ",
        options: {
          prefix: "a",
          suffix: "",
          default_count: 5,
          space_after: true,
          space_before: true,
        },
      },
      {
        text: "ﬆ",
        options: {
          prefix: "",
          suffix: "",
          default_count: 5,
          space_after: true,
          space_before: true,
        },
      },
    ],
  },
];

const sample_messages: TTS.Message[] = [
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
];
