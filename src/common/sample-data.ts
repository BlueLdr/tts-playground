import { DEFAULT_SPEED_CHAR, DEFAULT_VOICE } from "~/common/constants";

export const sample_snippets: TTS.Snippet[] = [
  {
    id: "sample-snippet-1",
    text: "VB",
    options: {
      prefix: "a",
      suffix: "",
      default_count: 5,
      space_after: false,
      space_before: true,
    },
  },
  {
    id: "sample-snippet-2",
    text: "brur",
    options: {
      prefix: "ur",
      suffix: "?^",
      default_count: 2,
      space_after: true,
      space_before: true,
    },
  },
  {
    id: "sample-snippet-3",
    text: "PX",
    options: {
      prefix: "y",
      suffix: "",
      default_count: 5,
      space_after: false,
      space_before: true,
    },
  },
  {
    id: "sample-snippet-4",
    text: "HJ",
    options: {
      prefix: "a",
      suffix: "",
      default_count: 5,
      space_after: false,
      space_before: true,
    },
  },
  {
    id: "sample-snippet-5",
    text: "ﬆ",
    options: {
      prefix: "",
      suffix: "",
      default_count: 5,
      space_after: false,
      space_before: true,
    },
  },
];

export const sample_snippets_sections: TTS.SnippetsSection[] = [
  {
    name: "Sample Snippets",
    open: true,
    data: ["sample-snippet-1", "sample-snippet-2"],
  },
  {
    name: "Sprinkler Noises",
    open: false,
    data: ["sample-snippet-3", "sample-snippet-4", "sample-snippet-5"],
  },
];

export const sample_messages: TTS.Message[] = [
  {
    id: "sample-message-1",
    name: "Sample Message",
    text: "This is a sample message. No silly noises here boink",
    options: {
      bits: "",
      speed: false,
      max_length: 255,
      speed_char: DEFAULT_SPEED_CHAR,
      voice: DEFAULT_VOICE,
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
      speed_char: DEFAULT_SPEED_CHAR,
      voice: DEFAULT_VOICE,
    },
  },
];

export const sample_message_categories: TTS.MessageCategory[] = [
  {
    name: "Sample Messages",
    open: true,
    data: ["sample-message-1", "sample-message-2"],
  },
];
