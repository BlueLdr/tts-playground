import { OptimizeLevel, OptimizeTrigger } from "~/model/types";
import { match_case } from "~/view/utils/common";
import {
  PLAIN_TRANSFORMS,
  RESTORE_WHITESPACE_TRANSFORMS,
  SAFE_WHITESPACE_TRANSFORMS,
  TRANSFORMS,
  WORD_CHARACTERS,
} from "~/view/utils/optimize-transforms";

const WHITESPACE = "[^\\S\r\n]";

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
  return (index === 0 ? text : text.slice(index)).search(/\S/);
};
const get_last_char = (text: string, index: number = text.length) => {
  const input = (index === text.length ? text : text.slice(0, index))
    .split("")
    .reverse()
    .join("");
  const i = input.search(/\S/);
  return i === -1 ? i : text.length - i;
};

const get_word_start = (text: string, index: number) => {
  if (
    index > text.length ||
    index <= 0 ||
    text[index - 1] === " " ||
    text[index - 1] === "\n"
  ) {
    return -1;
  }
  const i = text.slice(0, index).split("").reverse().join("").search(/\s/);
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

const trim_duplicate_whitespace = (text: string) =>
  text.replace(/\s+(\n)/g, "$1").replace(/(\s)\s+/g, "$1");

export const trim_excess_whitespace = (
  text: string,
  input_ref: preact.RefObject<HTMLTextAreaElement>
) => {
  text = text.replace(new RegExp(WHITESPACE, "gi"), " ");
  let { selectionStart = -1, selectionEnd = -1 } = input_ref.current || {};
  if (
    selectionStart === -1 ||
    selectionEnd === -1 ||
    (selectionStart === selectionEnd &&
      (selectionStart === 0 || selectionEnd === text.length))
  ) {
    const output = trim_duplicate_whitespace(text.trim());
    if (selectionStart === -1 || selectionEnd === -1) {
      return [output, -1, -1] as const;
    }
    if (selectionStart === 0) {
      return [output, 0, 0] as const;
    }
    return [output, output.length, output.length] as const;
  }

  let start = trim_duplicate_whitespace(
    text.slice(0, selectionStart).trimStart()
  );
  let middle = trim_duplicate_whitespace(
    text.slice(selectionStart, selectionEnd)
  );
  let end = trim_duplicate_whitespace(text.slice(selectionEnd).trimEnd());

  if (end.length === 0) {
    middle = middle.trimEnd();
    if (middle.length === 0) {
      start = start.trimEnd();
    }
  }

  if (start.length === 0) {
    middle = middle.trimStart();
    if (middle.length === 0) {
      end = end.trimStart();
    }
  }

  if (/\s$/i.test(start) && /^\s/i.test(middle)) {
    if (middle[0] === "\n") {
      start = start.slice(0, -1);
    } else {
      middle = middle.slice(1);
    }
  }
  if (/\s$/i.test(middle) && /^\s/i.test(end)) {
    if (end[0] === "\n") {
      middle = middle.slice(0, -1);
    } else {
      end = end.slice(1);
    }
  }
  if (selectionStart === selectionEnd) {
    if (/\s$/i.test(start)) {
      if (/^\s/i.test(end) || end.length === 0) {
        if (end[0] === "\n" || end.length === 0) {
          start = start.slice(0, -1);
        } else {
          end = end.slice(1);
        }
      }
    } else if (/^\s/i.test(end) && start.length === 0) {
      end = end.slice(1);
    }
  }

  return [
    `${start}${middle}${end}`,
    start.length,
    start.length + middle.length,
  ] as const;
};

export const optimize_whitespace = (
  text: string,
  input_ref: preact.RefObject<HTMLTextAreaElement>,
  trigger: OptimizeTrigger
) => {
  let { selectionStart = -1, selectionEnd = -1 } = input_ref.current || {};
  const ignore_cursor = trigger <= OptimizeTrigger.blur;
  if (selectionStart !== selectionEnd && trigger !== OptimizeTrigger.manual) {
    return [text, selectionStart, selectionEnd] as const;
  }
  let cursor_initial = selectionStart;

  let input = text.replace(new RegExp(WHITESPACE, "g"), " ");
  const first_non_space = get_first_char(input);
  const space_at_start = cursor_initial < first_non_space && !ignore_cursor;
  const newline_at_start =
    input
      .slice(ignore_cursor ? 0 : cursor_initial, first_non_space)
      .includes("\n") && !ignore_cursor;
  input = input.trimStart();
  cursor_initial = Math.max(cursor_initial - first_non_space, 0);
  const last_non_space = get_last_char(input);
  const space_at_end = cursor_initial > last_non_space && !ignore_cursor;
  const newline_at_end =
    input
      .slice(last_non_space, ignore_cursor ? undefined : cursor_initial)
      .includes("\n") && !ignore_cursor;
  input = input.trimEnd();
  cursor_initial = space_at_start ? 0 : Math.min(cursor_initial, input.length);

  let start = trim_duplicate_whitespace(
    input.slice(0, cursor_initial).trimStart()
  );
  let end = trim_duplicate_whitespace(input.slice(cursor_initial).trimEnd());
  cursor_initial = start.length;
  input = `${start}${end}`;

  const cursor_space_left =
    space_at_end || /\s/.test(input[cursor_initial - 1]);
  const cursor_newline_left = space_at_end
    ? newline_at_end
    : input[cursor_initial - 1] === "\n";

  const cursor_space_right = space_at_start || /\s/.test(input[cursor_initial]);
  const cursor_newline_right = space_at_start
    ? newline_at_start
    : input[cursor_initial] === "\n";

  let output = "";
  let cursor_final = -1;
  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    if (cursor_initial === i && cursor_final === -1) {
      cursor_final = output.length;
    }
    if (char !== " " && char !== "\n") {
      if (space_at_start && output.length === 0) {
        output += newline_at_start ? "\n" : " ";
      }
      output += char;
      if (char === "." && input[i + 1] !== "\n" && input[i + 1] !== " ") {
        output += " ";
      }
      continue;
    }
    if (!ignore_cursor && i + 1 === cursor_initial && cursor_space_left) {
      output += cursor_newline_left ? "\n" : " ";
      cursor_final = output.length;
    } else if (!ignore_cursor && i === cursor_initial && cursor_space_right) {
      output += cursor_newline_right ? "\n" : " ";
    } else {
      const before = output;
      const after = input.slice(i + 1);
      if (char === "\n") {
        if (
          (ignore_cursor || (i > 0 && i < input.length)) &&
          before.slice(-1) !== "\n"
        ) {
          output += char;
        }
      } else if (!space_can_be_removed(before, after)) {
        output += char;
      }
    }
  }
  if (space_at_end) {
    output += newline_at_end ? "\n" : " ";
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

  const words = input.split(/( |(?=\n))/);

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
    if (word.length === 0) {
      continue;
    }

    if (i !== 0 && !/\s$/.test(output) && !/^\s/.test(word)) {
      add_word(" ", " ");
      i = rec_input.length;
      o = output.length;
      if (i === cursor_initial) {
        cursor_final = o;
      }
    }
    if (/^\s+$/.test(word)) {
      add_word(word, word);
      continue;
    } else if (word.startsWith("\n")) {
      add_word("\n", "\n");
      i = rec_input.length;
      o = output.length;
      if (i === cursor_initial) {
        cursor_final = o;
      }
      word = word.slice(1);
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
  let input = text.slice(selectionStart, selectionEnd);
  const text_after = text.slice(selectionEnd);

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
    trigger
  );

  input = trim_duplicate_whitespace(input);
  const first_non_space = get_first_char(input);
  const space_at_start = /^\s/i.test(input) && first_non_space > 0;
  const newline_at_start = input.slice(0, first_non_space).includes("\n");

  const last_non_space = get_last_char(input);
  const space_at_end = /\s$/i.test(input) && last_non_space > 0;
  const newline_at_end = input.slice(last_non_space).includes("\n");

  const space_before =
    space_at_start &&
    (text_before.length === 0 ||
      (newline_at_start
        ? text_before.slice(-1) !== "\n"
        : !space_can_be_removed(text_before, output)));
  const newline_before = space_before && input[0] === "\n";
  const space_after =
    space_at_end &&
    (text_after.length === 0 ||
      (newline_at_end
        ? text_after[0] !== "\n"
        : !space_can_be_removed(text_trimmed, output)));
  const newline_after = space_after && input.slice(-1) === "\n";

  const output_ = `${text_before}${
    space_before ? (newline_before ? "\n" : " ") : ""
  }${output}${space_after ? (newline_after ? "\n" : " ") : ""}`;
  return [`${output_}${text_after}`, selectionStart, output_.length];
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
    !should_optimize_words ||
    !text ||
    (selectionStart !== selectionEnd && trigger !== OptimizeTrigger.manual)
  ) {
    if (text && trim_whitespace && trigger <= OptimizeTrigger.blur) {
      return trim_excess_whitespace(text, input_ref);
    }
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
    trigger
  );
};
