import { OptimizeLevel } from "~/model";
import { match_case } from "~/view/utils/common";

interface TextTransform {
  match: (value: string) => boolean;
  transform: string | ((value: string) => string);
}

export const WORD_CHARACTERS = "a-zþﬆﬂ0-9􃎜'";

export const PLAIN_TRANSFORMS = {
  [OptimizeLevel.safe]: {
    too: "2",
    one: "1",
    two: "2",
    three: "3",
    four: "4",
    five: "5",
    six: "6",
    seven: "7",
    eight: "8",
    nine: "9",
    ten: "10",
    and: "&",
    be: "ⓑ",
    bee: "ⓑ",
    at: "@",
    no: "№",
    i: "ⓘ",
    bees: "b's",
  },
  [OptimizeLevel.normal]: {
    are: "ⓡ",
    r: "ⓡ",
    you: "ⓤ",
    u: "ⓤ",
    see: "ⓒ",
    why: "ⓨ",
    y: "ⓨ",
    before: "b4",
    none: "nun",
    know: "№",
    speedy: "speeⓓ",
    "speedy's": "speeⓓ's",
    m8: "􃎜8",
    mate: "􃎜8",
    matey: "􃎜80",
  },
  [OptimizeLevel.max]: {
    for: "4",
    fore: "4",
    to: "2",
    a: "ⓐ",
  },
} as const;

export const TRANSFORMS: { [K in OptimizeLevel]: TextTransform[] } = {
  [OptimizeLevel.safe]: [
    {
      match: v => /^\w*ight$/i.test(v),
      transform: v => v.replace(/ight$/i, match => match_case("ite", match)),
    },
    {
      match: v => /th/i.test(v),
      transform: v => v.replace(/th/i, match => match_case("þ", match)),
    },
    {
      match: v => /st/i.test(v),
      transform: v => v.replace(/st/i, match => match_case("ﬆ", match)),
    },
    {
      match: v => /fl/i.test(v),
      transform: v => v.replace(/fl/i, match => match_case("ﬂ", match)),
    },
    {
      // replace any sequence of 3 or more of the same vowel with 2 of that vowel
      match: v => new RegExp("([aeiouy])(\\1){2,}", "i").test(v),
      transform: v =>
        v.replace(new RegExp("([aeiouy])(\\1){2,}", "gi"), "$1$1"),
    },
  ],
  [OptimizeLevel.normal]: [
    {
      match: v => /[aeiouy]'ve\b/i.test(v),
      transform: v =>
        v.replace(/'ve\b/i, match => match_case("'ve", match, "'")),
    },
  ],
  [OptimizeLevel.max]: [
    {
      match: v => /fore?$/i.test(v),
      transform: v => v.replace(/fore?$/i, "4"),
    },
    {
      match: v => /^fore?/i.test(v),
      transform: v => v.replace(/^fore?/i, "4"),
    },
    {
      match: v => /^fou?r\w*/i.test(v),
      transform: v => v.replace(/^fou?r/i, "4"),
    },
  ],
};

export const SAFE_WHITESPACE_TRANSFORMS = [
  {
    before: "[ &,@]",
    after: "[ a-z0-9Ⓐ-ⓩ]",
    reversible: true,
  },
  {
    before: "[Ⓐ-ⓩ]",
    after: "[ Ⓐ-ⓩa-z0-9þﬆﬂ]",
    reversible: true,
  },
  {
    before: "[ a-zⒶ-ⓩ]",
    after: "[ 0-9]",
    reversible: true,
  },
  {
    before: ".",
    after: "[\n\r]",
    reversible: true,
  },
  {
    before: "[?!]",
    after: "[ a-zⒶ-ⓩ]",
  },
];

export const RESTORE_WHITESPACE_TRANSFORMS = [
  {
    before: /[Ⓐ-ⓩ]\?$/i,
    after: /^[^Ⓐ-ⓩ]/i,
  },
  {
    before: /[$￡￥￦€₩₹]\d+(\.\d+)?$/i,
    after: /^[^Ⓐ-ⓩ]/i,
  },
  {
    before: /'[a-z]+$/i,
    after: /^[^Ⓐ-ⓩ]/i,
  },
];
