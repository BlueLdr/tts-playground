import { DEFAULT_BITS_STRING, DEFAULT_HISTORY_STEPS_LIMIT } from "~/common";
import { OptimizeLevel, OptimizeTrigger } from "~/model/types";

const load_storage_or = (key, def) => {
  const stored = localStorage.getItem(key);
  if (stored) {
    return JSON.parse(stored) || def;
  }
  return def;
};

export const get_stored_snippets = (): TTS.SnippetsSection[] =>
  load_storage_or("tts-snippets", sample_snippets).map(section => ({
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
  load_storage_or("tts-messages", sample_messages);
export const set_stored_messages = (value: TTS.Message[]) =>
  localStorage.setItem("tts-messages", JSON.stringify(value));

export const get_stored_state = (): TTS.AppState =>
  load_storage_or("tts-state", sample_state);
export const set_stored_state = (value: TTS.AppState) =>
  localStorage.setItem("tts-state", JSON.stringify(value));

export const reset_all_storage = () => {
  if (confirm("Are you REALLY sure you wanna do this?")) {
    localStorage.setItem("tts-state", "");
    localStorage.setItem("tts-messages", "");
    localStorage.setItem("tts-snippets", "");
    window.location.reload();
  }
};

const sample_state: TTS.AppState = {
  settings: {
    bits_string: DEFAULT_BITS_STRING,
    insert_at_cursor: true,
    trim_whitespace: true,
    optimize_words: OptimizeTrigger.manual,
    optimize_level: OptimizeLevel.normal,
    voice: "Brian",
    history_steps: DEFAULT_HISTORY_STEPS_LIMIT,
  },
  message: -1,
  volume: 0.5,
  editor: {
    max_length: 255,
    speed: false,
    bits: "",
    text: "Sample text",
    pause_duration: 1,
  },
};

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
