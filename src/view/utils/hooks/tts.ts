import * as hooks from "preact/hooks";
import { get_tts_data, play_audio } from "~/common";
import { EDITOR_SETTINGS } from "~/model";
import {
  insert_text_at_selection,
  trim_whitespace,
  useRequestStatus,
  useStateRef,
  useValueRef,
} from "~/view/utils";

export const usePlayMessage = (
  message: TTS.Message,
  player_id?: string,
  request?: TTS.TTSRequest
) => {
  const voice = hooks.useContext(EDITOR_SETTINGS).value?.voice;
  const voice_ref = useValueRef(voice);
  const {
    text,
    options: { speed, max_length },
  } = message;

  const [data, set_data, data_ref] = useStateRef("");
  const full_text = hooks.useMemo(() => {
    if (speed && max_length !== text.length) {
      return `${text} ${"¡".repeat(max_length - text.length - 1)}`;
    }
    return text;
  }, [speed, text, max_length]);

  const [status, fetch_tts] = useRequestStatus(get_tts_data);
  const on_submit = hooks.useCallback(() => {
    fetch_tts(full_text, request, voice_ref.current).then((d) => {
      if (d === data_ref.current) {
        if (data_ref.current) play_audio(player_id);
      } else {
        set_data(d);
      }
    });
  }, [full_text]);

  hooks.useEffect(() => {
    if (data) play_audio(player_id);
  }, [data]);

  return [data, status, on_submit, full_text] as const;
};

export const usePlaySnippet = (
  player_id?: string,
  request?: TTS.TTSRequest
) => {
  const voice = hooks.useContext(EDITOR_SETTINGS).value?.voice;
  const voice_ref = useValueRef(voice);
  const [data, set_data, data_ref] = useStateRef("");

  const [status, fetch_tts] = useRequestStatus(get_tts_data);
  const on_submit = hooks.useCallback(
    (snippet: TTS.Snippet, count?: number) => {
      const {
        text,
        options: { prefix = "", default_count, suffix = "" },
      } = snippet;
      const full_text = `${prefix}${text.repeat(
        count || default_count || 1
      )}${suffix}`;
      return fetch_tts(full_text, request, voice_ref.current).then((d) => {
        if (d === data_ref.current) {
          if (data_ref.current) play_audio(player_id);
        } else {
          set_data(d);
        }
      });
    },
    []
  );

  hooks.useEffect(() => {
    if (data) play_audio(player_id);
  }, [data]);

  return [data, status, on_submit] as const;
};

export const useAudioPlayer = (
  player_id?: string,
  request?: TTS.TTSRequest
) => {
  const voice = hooks.useContext(EDITOR_SETTINGS).value?.voice;
  const voice_ref = useValueRef(voice);
  const [data, set_data, data_ref] = useStateRef<string>("");
  hooks.useEffect(() => {
    if (data) play_audio(player_id);
  }, [data]);
  const get_data = hooks.useCallback((text: string) => {
    if (!text) {
      return Promise.resolve();
    }
    return get_tts_data(text, request, voice_ref.current).then((d) => {
      if (d === data_ref.current) {
        play_audio(player_id);
      } else {
        set_data(d);
      }
    });
  }, []);

  return [data, get_data] as const;
};

export const useMessageFullText = (message: TTS.Message) => {
  const {
    text,
    options: { max_length, speed },
  } = message;
  return hooks.useMemo(() => {
    if (!speed) {
      return text;
    }
    return `${text} ${"¡".repeat(max_length - text.length - 1)}`;
  }, [text, max_length, speed]);
};

export const useInsertSnippet = (
  text: string,
  max_length: number,
  input_ref: preact.RefObject<HTMLTextAreaElement>
) => {
  const editor_settings = hooks.useContext(EDITOR_SETTINGS).value;
  const insert_at_cursor = useValueRef(editor_settings.insert_at_cursor);
  const text_ref = useValueRef(text);
  const length_ref = useValueRef(max_length);
  const cursor_pos = hooks.useRef(-1);
  const reset_pos = hooks.useRef(false);

  const insert_snippet = hooks.useCallback(
    (value: string, flag?: "start" | "end") => {
      if (!flag && cursor_pos.current !== -1) {
        input_ref.current.selectionStart = cursor_pos.current;
        input_ref.current.selectionEnd = cursor_pos.current;
      }
      let new_text;
      if (insert_at_cursor.current) {
        const [new_text_, new_index] = insert_text_at_selection(
          text_ref.current,
          value,
          length_ref.current,
          input_ref
        );
        new_text = new_text_;
        cursor_pos.current = new_index;
      } else {
        if (
          value.startsWith(" ") &&
          (!text_ref.current || text_ref.current.endsWith(" "))
        ) {
          value = value.slice(1);
        }
        new_text = `${text_ref.current}${value}`.slice(0, length_ref.current);
        cursor_pos.current = new_text.length;
      }
      if (flag === "end") {
        if (new_text === text_ref.current) {
          cursor_pos.current = -1;
        } else {
          reset_pos.current = true;
        }
      }
      if (new_text === text_ref.current) {
        input_ref.current?.focus();
      }
      return new_text;
    },
    []
  );

  hooks.useEffect(() => {
    if (cursor_pos.current !== -1) {
      input_ref.current?.focus();
      input_ref.current.selectionStart = cursor_pos.current;
      input_ref.current.selectionEnd = cursor_pos.current;
      cursor_pos.current = -1;
    }
    if (reset_pos.current) {
      cursor_pos.current = -1;
      reset_pos.current = false;
    }
  }, [text]);

  return insert_snippet;
};

export const useTextOptimization = (
  value: string,
  set_value: hooks.StateUpdater<string>,
  input_ref: preact.RefObject<HTMLTextAreaElement>
) => {
  const settings = hooks.useContext(EDITOR_SETTINGS).value;
  const settings_ref = useValueRef(settings);
  const last_update = hooks.useRef<string>();
  const new_cursor_pos = hooks.useRef<number>(-1);

  hooks.useEffect(() => {
    if (value === last_update.current) {
      if (new_cursor_pos.current !== -1) {
        if (input_ref.current) {
          input_ref.current.selectionStart = new_cursor_pos.current;
          input_ref.current.selectionEnd = new_cursor_pos.current;
        }
        new_cursor_pos.current = -1;
      }
      last_update.current = "";
      return;
    }
    if (!settings_ref.current?.trim_whitespace) {
      return;
    }

    const { selectionStart = -9 } = input_ref.current ?? {};
    let new_text = "";
    for (let i = 0; i < value.length; i++) {
      if (i === selectionStart) {
        new_cursor_pos.current = new_text.length;
      }

      if (
        /\s/.test(value[i]) &&
        (/\s/.test(new_text.slice(-1)) ||
          i === 0 ||
          (i === value.length - 1 && i !== selectionStart - 1)) &&
        i !== selectionStart
      ) {
        continue;
      }
      new_text += value[i];
    }

    last_update.current = new_text;
    if (new_text !== value) {
      set_value(new_text);
    }
  }, [value]);

  return hooks.useCallback(
    (text: string) => {
      if (settings_ref.current?.trim_whitespace) {
        text = trim_whitespace(text);
      }
      set_value(text);
      return text;
    },
    [set_value]
  );
};
