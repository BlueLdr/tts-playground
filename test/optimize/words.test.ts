import test from "ava";
import { OptimizeLevel, OptimizeTrigger } from "~/model/types";
import { optimize_message } from "~/view/utils";
import { OPTIMIZE_LEVEL_TESTS, OPTIMIZE_TESTS } from "./data/tests";

const settings = {
  voice: "Brian",
  trim_whitespace: true,
  bits_string: "uni300",
  optimize_level: OptimizeLevel.max,
  optimize_words: OptimizeTrigger.edit,
  history_steps: 256,
  skip_tutorials: false,
};

OPTIMIZE_LEVEL_TESTS.forEach(({ input, level, output }) => {
  test(`optimize words and whitespace in sentence at level "${level}"`, t => {
    const [processed] = optimize_message(
      input,
      { current: null },
      OptimizeTrigger.manual,
      { ...settings, optimize_level: OptimizeLevel[level] }
    );
    t.is(processed, output);
  });
});

OPTIMIZE_TESTS.forEach(({ input, action, output }, i) => {
  const cursor_pos_input = input.indexOf("|");
  const cursor_pos_output = output.indexOf("|");
  const input_ = input.replace("|", "");
  const output_ = output.replace("|", "");
  if (cursor_pos_input === -1 || cursor_pos_output === -1) {
    return;
  }

  test(`optimize message ${i + 1}: '${input}' on ${action}`, t => {
    const element = {
      selectionStart: cursor_pos_input,
      selectionEnd: cursor_pos_input,
    } as HTMLTextAreaElement;
    const [processed, cursor_start, cursor_end] = optimize_message(
      input_,
      { current: element },
      OptimizeTrigger[action],
      settings
    );

    t.is(processed, output_);
    t.is(cursor_start, cursor_pos_output);
    t.is(cursor_end, cursor_pos_output);
  });
});
