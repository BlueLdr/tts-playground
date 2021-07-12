import * as common from "~/common";

const stored_state = common.get_stored_state();
const initial_state: TTS.AppState = {
  volume: stored_state?.volume ?? 1,
  message: stored_state?.message ?? -1,
  settings: stored_state?.settings ?? {
    open: stored_state?.settings?.open ?? false,
    insert_at_cursor: stored_state?.settings?.insert_at_cursor ?? false,
    trim_whitespace: stored_state?.settings?.trim_whitespace ?? false,
    voice: stored_state?.settings?.voice ?? common.VOICE_NAMES[0],
  },
  editor: {
    text: stored_state?.editor?.text ?? "",
    max_length: stored_state?.editor?.max_length ?? 255,
    speed: stored_state?.editor?.speed ?? false,
  },
};

const messages: TTS.Message[] = common.get_stored_messages() ?? [];
const snippets: TTS.SnippetsSection[] = common.get_stored_snippets() ?? [];

export const INITIAL_STATE = {
  ...initial_state,
  messages,
  snippets,
} as const;
