import { OptimizeLevel, OptimizeTrigger } from "~/model";

export const SETTINGS = {
  trim_whitespace: true,
  optimize_words: OptimizeTrigger.manual,
  optimize_level: OptimizeLevel.normal,
  bits_string: "uni300",
  history_steps: 256,
  skip_tutorials: false,
  uncategorized_msgs_open: true,
  __type: "settings",
};
