import * as common from "~/common";
import { OptimizeLevel, OptimizeTrigger } from "./types";

const stored_state = common.get_stored_state();
const initial_state: TTS.AppState = {
  volume: stored_state?.volume ?? 1,
  message: stored_state?.message ?? -1,
  settings: {
    insert_at_cursor: stored_state?.settings?.insert_at_cursor ?? false,
    trim_whitespace: stored_state?.settings?.trim_whitespace ?? false,
    optimize_words:
      stored_state?.settings?.optimize_words ?? OptimizeTrigger.manual,
    optimize_level:
      stored_state?.settings?.optimize_level ?? OptimizeLevel.normal,
    voice: stored_state?.settings?.voice ?? common.VOICE_NAMES[0],
    bits_string:
      stored_state?.settings?.bits_string ?? common.DEFAULT_BITS_STRING,
    history_steps:
      stored_state?.settings?.history_steps ??
      common.DEFAULT_HISTORY_STEPS_LIMIT,
    skip_tutorials: stored_state?.settings?.skip_tutorials ?? false,
  },
  editor: {
    text: stored_state?.editor?.text ?? "",
    max_length: stored_state?.editor?.max_length ?? 255,
    speed: stored_state?.editor?.speed ?? false,
    bits: stored_state?.editor?.bits ?? "",
    pause_duration: stored_state?.editor?.pause_duration ?? 1,
  },
};

const messages: TTS.Message[] = common.get_stored_messages() ?? [];
const snippets: TTS.SnippetsSection[] = common.get_stored_snippets() ?? [];
const help: TTS.HelpCompletedMap = common.get_stored_help() ?? {};

export const INITIAL_STATE = {
  ...initial_state,
  messages,
  snippets,
  help,
} as const;
