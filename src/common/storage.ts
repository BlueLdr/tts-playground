import {
  DEFAULT_BITS_STRING,
  DEFAULT_HISTORY_STEPS_LIMIT,
  DEFAULT_SPEED_CHAR,
  DEFAULT_VOICE,
  do_confirm,
  sample_message_categories,
  sample_messages,
  sample_snippets,
  sample_snippets_sections,
  UNCATEGORIZED_GROUP_NAME,
} from "~/common";
import { OptimizeLevel, OptimizeTrigger } from "~/model/types";

const load_storage_or = (key, def) => {
  const stored = localStorage.getItem(key);
  if (stored) {
    return JSON.parse(stored) || def;
  }
  return def;
};

export const get_stored_snippets = (): TTS.Snippet[] =>
  load_storage_or("tts-snippets", sample_snippets);
export const set_stored_snippets = (value: TTS.Snippet[]) =>
  localStorage.setItem("tts-snippets", JSON.stringify(value));

export const get_stored_snippets_sections = (): TTS.SnippetsSection[] =>
  load_storage_or("tts-snippets-sections", sample_snippets_sections);
export const set_stored_snippets_sections = (value: TTS.SnippetsSection[]) =>
  localStorage.setItem("tts-snippets-sections", JSON.stringify(value));

export const get_stored_messages = (): TTS.Message[] =>
  load_storage_or("tts-messages", sample_messages);
export const set_stored_messages = (value: TTS.Message[]) =>
  localStorage.setItem("tts-messages", JSON.stringify(value));

export const get_stored_message_categories = (): TTS.MessageCategory[] =>
  load_storage_or("tts-message-categories", sample_message_categories);
export const set_stored_message_categories = (value: TTS.MessageCategory[]) =>
  localStorage.setItem("tts-message-categories", JSON.stringify(value));

export const get_stored_uncategorized_messages = (): TTS.MessageCategory =>
  load_storage_or("tts-uncat-messages", DEFAULT_UNCAT_MESSAGES);
export const set_stored_uncategorized_messages = (value: TTS.MessageCategory) =>
  localStorage.setItem("tts-uncat-messages", JSON.stringify(value));

export const get_stored_state = (): TTS.AppState =>
  load_storage_or("tts-state", DEFAULT_STATE);
export const set_stored_state = (value: TTS.AppState) =>
  localStorage.setItem("tts-state", JSON.stringify(value));

export const get_stored_help = (): TTS.HelpCompletedMap =>
  load_storage_or("tts-help", {});
export const set_stored_help = (value: TTS.HelpCompletedMap) =>
  localStorage.setItem("tts-help", JSON.stringify(value));

export const reset_all_storage = (clear_help?: boolean) => {
  if (do_confirm("Are you REALLY sure you wanna do this?")) {
    localStorage.setItem("tts-state", "");
    localStorage.setItem("tts-messages", "");
    localStorage.setItem("tts-message-categories", "");
    localStorage.setItem("tts-snippets", "");
    clear_help && localStorage.setItem("tts-help", "");
    window.location.reload();
  }
};

export const DEFAULT_UNCAT_MESSAGES: TTS.MessageCategory = {
  name: UNCATEGORIZED_GROUP_NAME,
  open: false,
  data: [],
};

export const DEFAULT_STATE: TTS.AppState = {
  settings: {
    bits_string: DEFAULT_BITS_STRING,
    trim_whitespace: true,
    optimize_words: OptimizeTrigger.manual,
    optimize_level: OptimizeLevel.normal,
    history_steps: DEFAULT_HISTORY_STEPS_LIMIT,
    skip_tutorials: false,
    stop_playback_at_modifier: true,
  },
  message: null,
  volume: 0.5,
  editor: {
    max_length: 255,
    speed: false,
    bits: "",
    text: "Sample text",
    pause_duration: 1,
    speed_char: DEFAULT_SPEED_CHAR,
    voice: DEFAULT_VOICE,
  },
};
