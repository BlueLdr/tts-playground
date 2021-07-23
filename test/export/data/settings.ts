import { OptimizeLevel, OptimizeTrigger } from "~/model";

export const SETTINGS = {
  open: true,
  insert_at_cursor: true,
  trim_whitespace: true,
  optimize_words: OptimizeTrigger.manual,
  optimize_level: OptimizeLevel.normal,
  voice: "Brian",
  bits_string: "uni300",
  __type: "settings",
};
