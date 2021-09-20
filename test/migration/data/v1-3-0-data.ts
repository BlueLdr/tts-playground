export const OLD_SNIPPETS = [
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
          space_after: false,
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
          space_after: false,
          space_before: true,
        },
      },
      {
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
        text: "ﬆ",
        options: {
          prefix: "",
          suffix: "",
          default_count: 5,
          space_after: false,
          space_before: true,
        },
      },
    ],
  },
  {
    name: "Other",
    open: false,
    data: [
      {
        text: "OURNA",
        options: {
          prefix: "",
          suffix: "",
          default_count: 1,
          space_after: false,
          space_before: true,
        },
      },
      {
        text: "DR",
        options: {
          prefix: "y",
          suffix: "",
          default_count: 4,
          space_after: false,
          space_before: true,
        },
      },
    ],
  },
];

export const OLD_MESSAGES: TTS.Message[] = [
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
    id: "8cbc7ab5971193d3751db0791cdc29c3",
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

export const NEW_SNIPPETS: TTS.Snippet[] = [
  {
    id: "",
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
    id: "",
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
    id: "",
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
    id: "",
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
    id: "",
    text: "ﬆ",
    options: {
      prefix: "",
      suffix: "",
      default_count: 5,
      space_after: false,
      space_before: true,
    },
  },
  {
    id: "",
    text: "OURNA",
    options: {
      prefix: "",
      suffix: "",
      default_count: 1,
      space_after: false,
      space_before: true,
    },
  },
  {
    id: "",
    text: "DR",
    options: {
      prefix: "y",
      suffix: "",
      default_count: 4,
      space_after: false,
      space_before: true,
    },
  },
];

export const NEW_SNIPPETS_SECTIONS: TTS.SnippetsSection[] = [
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
  {
    name: "Other",
    open: false,
    data: [
      "3c92cdc1970bd1573d3911795ba7cac3",
      "7cac7ab5971193d3751db0791cdc29c3",
    ],
  },
];

export const NEW_MESSAGE_CATEGORIES: TTS.MessageCategory[] = [
  {
    name: "Sample Messages",
    open: true,
    data: ["sample-message-1", "sample-message-2"],
  },
];
