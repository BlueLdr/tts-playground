import test from "ava";
import { OptimizeTrigger } from "~/model/types";
import { optimize_message } from "~/view/utils";
import { OPTIMIZE_TESTS } from "./data/tests";

const message =
  "  one guy two guy three four five guy six guy  and seven guy, eight   guy nine guy ten guy for guy, before you go, make sure you don't speak too quick alright? goodnight. we make big cookie for to bring customer back. reeeeaaaiiiiiiuiiiiglloooooyyyyy  ";
const message_optimized =
  "1 guy 2 guy 3 4 5 guy 6 guy & 7 guy,8 guy 9 guy 10 guy 4 guy,be4 u go,make sure u don't speak 2 quick alrite? goodnite. we make big cookie 4 2 bring customer back. reeaaiiuiigllooyy";

const settings = {
  insert_at_cursor: true,
  voice: "Brian",
  trim_whitespace: true,
  bits_string: "uni300",
  optimize_safe: false,
  optimize_words: OptimizeTrigger.edit,
  open: false,
};

test("optimize words and whitespace in sentence", t => {
  const [processed] = optimize_message(
    message,
    { current: null },
    OptimizeTrigger.submit,
    settings
  );
  t.is(processed, message_optimized);
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
