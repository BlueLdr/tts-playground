import { OptimizeLevel, OptimizeTrigger } from "~/model/types";
import { match_case } from "~/view/utils/common";
import {
  PLAIN_TRANSFORMS,
  RESTORE_WHITESPACE_TRANSFORMS,
  SAFE_WHITESPACE_TRANSFORMS,
  TRANSFORMS,
  WORD_CHARACTERS,
} from "~/view/utils/optimize-transforms";

const space_can_be_removed = (before: string, after: string) => {
  // prevent forming urls, which will be removed in speech
  if (before.endsWith(".")) {
    return false;
  }
  return (
    SAFE_WHITESPACE_TRANSFORMS.some(
      t =>
        (new RegExp(`${t.before}$`, "i").test(before) &&
          new RegExp(`^${t.after}`, "i").test(after)) ||
        (!t.reversible
          ? false
          : new RegExp(`^${t.before}`, "i").test(after) &&
            new RegExp(`${t.after}$`, "i").test(before))
    ) &&
    !RESTORE_WHITESPACE_TRANSFORMS.some(
      t => t.before.test(before) && t.after.test(after)
    )
  );
};

const optimize_word = (
  word: string,
  level: OptimizeLevel = OptimizeLevel.normal
) => {
  for (let i = OptimizeLevel.safe; i <= level; i++) {
    const transforms = PLAIN_TRANSFORMS[i];
    if (word.toLowerCase() in transforms) {
      const after = transforms[word.toLowerCase()];
      if (word === word.toLowerCase()) {
        return after.toLowerCase();
      }
      if (word === word.toUpperCase()) {
        return after.toUpperCase();
      }
      return word.replace(word, match => match_case(after, match));
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
            : t.transform?.(output) ?? output;
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
  const index = text.search(new RegExp(`[^${WORD_CHARACTERS}]`, "i"));
  if (index === -1) {
    return text;
  }
  return text.slice(0, index);
};

const parse_symbol = (text: string) => {
  const index = text.search(new RegExp(`[${WORD_CHARACTERS}]`, "i"));
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
  if (
    !trim_whitespace ||
    (selectionStart !== selectionEnd && trigger !== OptimizeTrigger.manual)
  ) {
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
      if (char === ".") {
        output += " ";
      }
      continue;
    }
    if (!ignore_cursor && i + 1 === cursor_initial && cursor_space_left) {
      output += char;
      cursor_final = output.length;
    } else if (!ignore_cursor && i === cursor_initial && cursor_space_right) {
      output += char;
    } else {
      const before = output;
      const after = input.slice(i + 1);
      if (!space_can_be_removed(before, after)) {
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
  if (
    !should_optimize_words ||
    (selectionStart !== selectionEnd && trigger !== OptimizeTrigger.manual)
  ) {
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
    if (!new RegExp(`^[${WORD_CHARACTERS}]+$`, "i").test(word)) {
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

export const optimize_selection = (
  text: string,
  input_ref: preact.RefObject<HTMLTextAreaElement>,
  trigger: OptimizeTrigger,
  settings: TTS.EditorSettings
): readonly [string, number, number] => {
  let { selectionStart = -1, selectionEnd = -1 } = input_ref.current || {};
  const text_before = text.slice(0, selectionStart);
  const input = text.slice(selectionStart, selectionEnd - 1);
  const text_after = text.slice(selectionEnd - 1);

  const [text_trimmed] = optimize_message_words(
    input,
    {
      current: {
        ...input_ref.current,
        selectionStart: 0,
        selectionEnd: input.length,
      },
    },
    trigger,
    settings
  );
  const [output] = optimize_whitespace(
    text_trimmed,
    {
      current: {
        ...input_ref.current,
        selectionStart: 0,
        selectionEnd: text_trimmed.length,
      },
    },
    trigger,
    settings
  );
  const space_before =
    input.startsWith(" ") &&
    (text_before.length === 0 ||
      !space_can_be_removed(text_before.slice(-1), input[1]));
  const space_after =
    input.endsWith(" ") &&
    (text_after.length === 0 ||
      !space_can_be_removed(input.slice(-2, -1), text_after[0]));

  const output_ = `${text_before}${space_before ? " " : ""}${output}${
    space_after ? " " : ""
  }`;
  return [`${output_}${text_after}`, selectionStart, output_.length + 1];
};

export const optimize_message = (
  text: string,
  input_ref: preact.RefObject<HTMLTextAreaElement>,
  trigger: OptimizeTrigger,
  settings: TTS.EditorSettings
): readonly [string, number, number] => {
  const { optimize_words, trim_whitespace } = settings;
  let { selectionStart = -1, selectionEnd = -1 } = input_ref.current || {};
  const should_optimize_words = trigger <= optimize_words;
  if (
    (!trim_whitespace && should_optimize_words) ||
    !text ||
    (selectionStart !== selectionEnd && trigger !== OptimizeTrigger.manual)
  ) {
    return [text, selectionStart, selectionEnd] as const;
  }

  if (selectionStart !== selectionEnd) {
    return optimize_selection(text, input_ref, trigger, settings);
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
