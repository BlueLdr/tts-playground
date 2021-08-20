import * as common from "~/common";

const stored_state = common.get_stored_state();
const initial_state: TTS.AppState = {
  volume: stored_state?.volume ?? common.DEFAULT_STATE.volume,
  message:
    typeof stored_state?.message === "string"
      ? stored_state.message
      : common.DEFAULT_STATE.message,
  settings: {
    trim_whitespace:
      stored_state?.settings?.trim_whitespace ??
      common.DEFAULT_STATE.settings.trim_whitespace,
    optimize_words:
      stored_state?.settings?.optimize_words ??
      common.DEFAULT_STATE.settings.optimize_words,
    optimize_level:
      stored_state?.settings?.optimize_level ??
      common.DEFAULT_STATE.settings.optimize_level,
    bits_string:
      stored_state?.settings?.bits_string ??
      common.DEFAULT_STATE.settings.bits_string,
    history_steps:
      stored_state?.settings?.history_steps ??
      common.DEFAULT_STATE.settings.history_steps,
    skip_tutorials:
      stored_state?.settings?.skip_tutorials ??
      common.DEFAULT_STATE.settings.skip_tutorials,
  },
  editor: {
    text: stored_state?.editor?.text ?? common.DEFAULT_STATE.editor.text,
    max_length:
      stored_state?.editor?.max_length ??
      common.DEFAULT_STATE.editor.max_length,
    speed: stored_state?.editor?.speed ?? common.DEFAULT_STATE.editor.speed,
    bits: stored_state?.editor?.bits ?? common.DEFAULT_STATE.editor.bits,
    pause_duration:
      stored_state?.editor?.pause_duration ??
      common.DEFAULT_STATE.editor.pause_duration,
    speed_char:
      stored_state?.editor?.speed_char ??
      common.DEFAULT_STATE.editor.speed_char,
    voice: stored_state?.editor?.voice ?? common.DEFAULT_STATE.editor.voice,
  },
};

const messages: TTS.Message[] = common.get_stored_messages() ?? [];
const message_categories: TTS.MessageCategory[] =
  common.get_stored_message_categories() ?? [];
const snippets: TTS.SnippetsSection[] = common.get_stored_snippets() ?? [];
const help: TTS.HelpCompletedMap = common.get_stored_help() ?? {};

export const INITIAL_STATE = {
  ...initial_state,
  messages,
  message_categories,
  snippets,
  help,
} as const;
