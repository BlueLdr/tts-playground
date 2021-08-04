import { OptimizeLevel, OptimizeTrigger } from "~/model/types";

interface TextTransform {
  match: (value: string) => boolean;
  transform: string | ((value: string) => string);
}

const PLAIN_TRANSFORMS = {
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
  },
  [OptimizeLevel.normal]: {
    are: "r",
    you: "u",
    why: "y",
  },
  [OptimizeLevel.max]: {
    for: "4",
    fore: "4",
    to: "2",
  },
} as const;

const TRANSFORMS: { [K in OptimizeLevel]: TextTransform[] } = {
  [OptimizeLevel.safe]: [
    {
      match: v => /^\w*ight$/i.test(v),
      transform: v => v.replace(/ight$/i, "ite"),
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
      transform: v => v.replace(/'ve\b/i, "ve"),
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

const SAFE_WHITESPACE_TRANSFORMS = [
  {
    before: /[ &,]/i,
    after: /[ a-z0-9]/i,
    reversible: true,
  },
  {
    before: /[ a-z]/i,
    after: /[ 0-9]/i,
    reversible: true,
  },
  {
    before: /[?!]/,
    after: /[ a-z]/i,
  },
];

const space_can_be_removed = (prev_char: string, next_char: string) => {
  // prevent forming urls, which will be removed in speech
  if (prev_char === ".") {
    return false;
  }
  return SAFE_WHITESPACE_TRANSFORMS.some(
    t =>
      (t.before.test(prev_char) && t.after.test(next_char)) ||
      (!t.reversible
        ? false
        : t.before.test(next_char) && t.after.test(prev_char))
  );
};

const optimize_word = (
  word: string,
  level: OptimizeLevel = OptimizeLevel.normal
) => {
  for (let i = OptimizeLevel.safe; i <= level; i++) {
    const transforms = PLAIN_TRANSFORMS[i];
    if (word.toLowerCase() in transforms) {
      return transforms[word.toLowerCase()];
    }
  }

  let output = word;
  for (let i = OptimizeLevel.safe; i <= level; i++) {
    const transforms = TRANSFORMS[i];
    transforms.forEach(t => {
      if (t.match(output)) {
        output =
          typeof t.transform === "string"
            ? t.transform
            : t.transform?.(word) ?? word;
      }
    });
  }

  return output;
};

const get_first_char = (text: string, index: number = 0) => {
  return (index === 0 ? text : text.slice(index)).search(/[^\s]/i);
};
const get_last_char = (text: string, index: number = text.length) => {
  const input = (index === text.length ? text : text.slice(0, index))
    .split("")
    .reverse()
    .join("");
  const i = input.search(/[^\s]/i);
  return i === -1 ? i : text.length - i;
};

const get_word_start = (text: string, index: number) => {
  if (index > text.length || index <= 0 || text[index - 1] === " ") {
    return -1;
  }
  const i = text.slice(0, index).split("").reverse().join("").search(/\s/i);
  if (i === -1) {
    return 0;
  }
  return index - i;
};

const parse_word = (text: string) => {
  const index = text.search(/[^a-z0-9']/i);
  if (index === -1) {
    return text;
  }
  return text.slice(0, index);
};

const parse_symbol = (text: string) => {
  const index = text.search(/[a-z0-9']/i);
  if (index === -1) {
    return text;
  }
  return text.slice(0, index);
};

export const optimize_whitespace = (
  text: string,
  input_ref: preact.RefObject<HTMLTextAreaElement>,
  trigger: OptimizeTrigger,
  settings: TTS.EditorSettings
) => {
  const { trim_whitespace } = settings;
  let { selectionStart = -1, selectionEnd = -1 } = input_ref.current || {};
  const ignore_cursor = trigger <= OptimizeTrigger.blur;
  if (!trim_whitespace || selectionStart !== selectionEnd) {
    return [text, selectionStart, selectionEnd] as const;
  }
  let cursor_initial = selectionStart;

  let input = text.replace(/\s/g, " ");
  const first_non_space = get_first_char(input);
  const space_at_start = cursor_initial < first_non_space && !ignore_cursor;
  input = input.trimStart();
  cursor_initial = Math.max(cursor_initial - first_non_space, 0);
  const last_non_space = get_last_char(input);
  const space_at_end = cursor_initial > last_non_space && !ignore_cursor;
  input = input.trimEnd();
  cursor_initial = space_at_start ? 0 : Math.min(cursor_initial, input.length);

  const cursor_space_left = input[cursor_initial - 1] === " " || space_at_end;
  const cursor_space_right = input[cursor_initial] === " " || space_at_start;

  let output = "";
  let cursor_final = -1;
  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    if (cursor_initial === i && cursor_final === -1) {
      cursor_final = output.length;
    }
    if (char !== " ") {
      if (space_at_start && output.length === 0) {
        output += " ";
      }
      output += char;
      continue;
    }
    if (!ignore_cursor && i + 1 === cursor_initial && cursor_space_left) {
      output += char;
      cursor_final = output.length;
    } else if (!ignore_cursor && i === cursor_initial && cursor_space_right) {
      output += char;
    } else {
      const prev_char = output.slice(-1);
      const next_char = input[i + 1];
      if (!space_can_be_removed(prev_char, next_char)) {
        output += char;
      }
    }
  }
  if (space_at_end) {
    output += " ";
  }

  if (cursor_final === -1 || space_at_end) {
    cursor_final = output.length;
  }
  return [output, cursor_final, cursor_final] as const;
};

export const optimize_message_words = (
  text: string,
  input_ref: preact.RefObject<HTMLTextAreaElement>,
  trigger: OptimizeTrigger,
  settings: TTS.EditorSettings
) => {
  const { optimize_words, optimize_level } = settings;
  let { selectionStart = -1, selectionEnd = -1 } = input_ref.current || {};
  const ignore_cursor = trigger <= OptimizeTrigger.blur;
  const should_optimize_words = trigger <= optimize_words;
  if (!should_optimize_words || selectionStart !== selectionEnd) {
    return [text, selectionStart, selectionEnd] as const;
  }

  let input = text;
  const cursor_initial = selectionStart;

  const cursor_word_start = get_word_start(input, cursor_initial);
  const cursor_index_in_word =
    cursor_word_start !== -1 ? cursor_initial - cursor_word_start : -1;

  const words = input.split(" ");

  let output = "";
  let cursor_final = cursor_initial === 0 ? 0 : -1;

  let rec_input = "";

  const add_word = (before, after) => {
    rec_input += before;
    output += after;
  };
  for (let word of words) {
    let i = rec_input.length;
    let o = output.length;
    if (i === cursor_initial) {
      cursor_final = o;
    }
    if (i !== 0 && output.slice(-1) !== " ") {
      add_word(" ", " ");
      i = rec_input.length;
      o = output.length;
      if (i === cursor_initial) {
        cursor_final = o;
      }
    }
    if (word === "") {
      add_word(" ", " ");
      continue;
    }
    if (!/^[a-z0-9']+$/i.test(word)) {
      let str = word;
      let cursor_in_this_word = cursor_word_start === i;
      let cursor_index_in_this_word = cursor_index_in_word;
      while (str.length > 0) {
        const part = parse_word(str);
        if (part.length) {
          let new_part = part;
          if (
            !cursor_in_this_word ||
            cursor_index_in_this_word > part.length ||
            cursor_index_in_this_word === 0 ||
            ignore_cursor
          ) {
            new_part = optimize_word(part, optimize_level);
          }
          if (cursor_in_this_word && cursor_index_in_this_word <= part.length) {
            cursor_final =
              o + Math.min(new_part.length, cursor_index_in_this_word);
            cursor_in_this_word = false;
          } else {
            cursor_index_in_this_word -= part.length;
          }
          add_word(part, new_part);
          i = rec_input.length;
          o = output.length;
          str = str.slice(part.length);
        }
        if (str.length === 0) {
          continue;
        }
        const symbols = parse_symbol(str);
        if (symbols.length) {
          if (cursor_in_this_word) {
            if (cursor_index_in_this_word < symbols.length) {
              cursor_final = o + Math.min(symbols.length, cursor_index_in_word);
            } else {
              cursor_index_in_this_word -= symbols.length;
            }
          }
          add_word(symbols, symbols);
          i = rec_input.length;
          o = output.length;
          str = str.slice(symbols.length);
        }
      }
    } else {
      if (!ignore_cursor && cursor_word_start === i) {
        add_word(word, word);
        cursor_final = o + cursor_index_in_word;
      } else {
        const new_word = optimize_word(word, optimize_level);
        if (cursor_word_start === i) {
          cursor_final = o + Math.min(new_word.length, cursor_index_in_word);
        }
        add_word(word, new_word);
      }
    }
  }

  if (output.endsWith("  ")) {
    output = output.slice(0, output.length - 1);
  }
  if (cursor_final === -1) {
    cursor_final = output.length;
  }
  // if (space_at_start && )
  // output = `${space_at_start ? " " : ""}${output}${space_at_end ? " " : ""}`
  return [output, cursor_final, cursor_final] as const;
};

export const optimize_message = (
  text: string,
  input_ref: preact.RefObject<HTMLTextAreaElement>,
  trigger: OptimizeTrigger,
  settings: TTS.EditorSettings
) => {
  const { optimize_words, trim_whitespace } = settings;
  let { selectionStart = -1, selectionEnd = -1 } = input_ref.current || {};
  const should_optimize_words = trigger <= optimize_words;
  if (
    (!trim_whitespace && should_optimize_words) ||
    !text ||
    selectionStart !== selectionEnd
  ) {
    return [text, selectionStart, selectionEnd] as const;
  }

  let [text_trimmed, cursor_start, cursor_end] = optimize_message_words(
    text,
    input_ref,
    trigger,
    settings
  );
  return optimize_whitespace(
    text_trimmed,
    {
      current: {
        ...input_ref.current,
        selectionStart: cursor_start,
        selectionEnd: cursor_end,
      },
    },
    trigger,
    settings
  );
};
