import TTS from "~/model/types";

export const SNIPPET_ONE: TTS.ExportedSnippet = {
  id: "test-snippet-1",
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
  id: "test-snippet-2",
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
  id: "test-snippet-3",
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

const S1_SNIPPETS: TTS.Snippet[] = Array(3)
  .fill(0)
  .map((_, i) => ({
    id: `test-snippet-section-1-snippet-${i + 1}`,
    text: `test snippet section 1 snippet ${i + 1}`,
    options: {
      prefix: "",
      suffix: "",
      space_before: !!(i % 2),
      space_after: !!((i % 2) + 1),
      default_count: i + 1,
    },
    __type: "snippet",
  }));

export const SNIPPET_S1_ONE = S1_SNIPPETS[0];
export const SNIPPET_S1_TWO = S1_SNIPPETS[1];
export const SNIPPET_S1_THREE = S1_SNIPPETS[2];

export const SNIPPET_SECTION_ONE: TTS.ExportedSnippetsSection = {
  name: "test snippet section 1",
  open: true,
  data: S1_SNIPPETS.map(s => s.id),
  __type: "snippets-section",
};

const S2_SNIPPETS: TTS.Snippet[] = Array(3)
  .fill(0)
  .map((_, i) => ({
    id: `test-snippet-section-2-snippet-${i + 1}`,
    text: `test snippet section 2 snippet ${i + 1}`,
    options: {
      prefix: "",
      suffix: "",
      space_before: !!(i % 2),
      space_after: !!((i % 2) + 1),
      default_count: i + 1,
    },
    __type: "snippet",
  }));

export const SNIPPET_S2_ONE = S2_SNIPPETS[0];
export const SNIPPET_S2_TWO = S2_SNIPPETS[1];
export const SNIPPET_S2_THREE = S2_SNIPPETS[2];

export const SNIPPET_SECTION_TWO: TTS.ExportedSnippetsSection = {
  name: "test snippet section 2",
  open: false,
  data: S2_SNIPPETS.map(s => s.id),
  __type: "snippets-section",
};

const S3_SNIPPETS: TTS.Snippet[] = Array(3)
  .fill(0)
  .map((_, i) => ({
    id: `test-snippet-section-3-snippet-${i + 1}`,
    text: `test snippet section 3 snippet ${i + 1}`,
    options: {
      prefix: "",
      suffix: "",
      space_before: !!(i % 2),
      space_after: !!((i % 2) + 1),
      default_count: i + 1,
    },
    __type: "snippet",
  }));

export const SNIPPET_S3_ONE = S3_SNIPPETS[0];
export const SNIPPET_S3_TWO = S3_SNIPPETS[1];
export const SNIPPET_S3_THREE = S3_SNIPPETS[2];

export const SNIPPET_SECTION_THREE: TTS.ExportedSnippetsSection = {
  name: "test snippet section 3",
  open: false,
  data: S3_SNIPPETS.map(s => s.id),
  __type: "snippets-section",
};
