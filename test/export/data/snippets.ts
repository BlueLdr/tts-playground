import TTS from "~/model/types";

export const SNIPPET_ONE: TTS.ExportedSnippet = {
  text: "test snippet 1",
  options: {
    prefix: "",
    suffix: "",
    space_before: true,
    space_after: false,
    default_count: 1,
  },
  __type: "snippet",
};

export const SNIPPET_TWO: TTS.ExportedSnippet = {
  text: "test snippet 2",
  options: {
    prefix: "?",
    suffix: "",
    space_before: false,
    space_after: false,
    default_count: 2,
  },
  __type: "snippet",
};

export const SNIPPET_THREE: TTS.ExportedSnippet = {
  text: "test snippet 3",
  options: {
    prefix: "",
    suffix: "!",
    space_before: false,
    space_after: true,
    default_count: 3,
  },
  __type: "snippet",
};

export const SNIPPET_SECTION_ONE: TTS.ExportedSnippetsSection = {
  name: "test snippet section 1",
  open: true,
  data: Array(3)
    .fill(0)
    .map((_, i) => ({
      text: `test snippet section 1 snippet ${i + 1}`,
      options: {
        prefix: "",
        suffix: "",
        space_before: !!(i % 2),
        space_after: !!((i % 2) + 1),
        default_count: i + 1,
      },
      __type: "snippet",
    })),
  __type: "snippets-section",
};

export const SNIPPET_SECTION_TWO: TTS.ExportedSnippetsSection = {
  name: "test snippet section 2",
  open: false,
  data: Array(3)
    .fill(0)
    .map((_, i) => ({
      text: `test snippet section 2 snippet ${i + 1}`,
      options: {
        prefix: "",
        suffix: "",
        space_before: !!(i % 2),
        space_after: !!((i % 2) + 1),
        default_count: i + 1,
      },
      __type: "snippet",
    })),
  __type: "snippets-section",
};

export const SNIPPET_SECTION_THREE: TTS.ExportedSnippetsSection = {
  name: "test snippet section 3",
  open: false,
  data: Array(3)
    .fill(0)
    .map((_, i) => ({
      text: `test snippet section 3 snippet ${i + 1}`,
      options: {
        prefix: "",
        suffix: "",
        space_before: !!(i % 2),
        space_after: !!((i % 2) + 1),
        default_count: i + 1,
      },
      __type: "snippet",
    })),
  __type: "snippets-section",
};
