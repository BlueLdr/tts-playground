export const get_stored_snippets = (): TTS.SnippetsSection[] =>
  (
    JSON.parse(
      localStorage.getItem("tts-snippets") ||
        localStorage.getItem("tts-scratch")
    ) || []
  ).map(section => ({
    ...section,
    data: section.data.map(row => {
      const { defaultCount, ...options } = row.options ?? {};
      const mapped = { ...row, options };
      if (!isNaN(parseInt(defaultCount))) {
        mapped.options.defaultCount = parseInt(defaultCount);
      }
      return mapped;
    }),
  }));
export const set_stored_snippets = (value: TTS.SnippetsSection[]) =>
  localStorage.setItem("tts-snippets", JSON.stringify(value));

export const get_stored_messages = (): TTS.Message[] =>
  JSON.parse(localStorage.getItem("tts-messages"));
export const set_stored_messages = (value: TTS.Message[]) =>
  localStorage.setItem("tts-messages", JSON.stringify(value));

export const get_stored_state = (): TTS.AppState =>
  JSON.parse(localStorage.getItem("tts-state"));
export const set_stored_state = (value: TTS.AppState) =>
  localStorage.setItem("tts-state", JSON.stringify(value));
