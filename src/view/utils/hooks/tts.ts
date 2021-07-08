import * as hooks from "preact/hooks";
import { get_tts_data, play_audio } from "~/common";
import { EDITOR_SETTINGS } from "~/view/components";
import {
  insert_text_at_selection,
  useRequestStatus,
  useStateRef,
  useValueRef,
} from "~/view/utils";

export const usePlayMessage = (
  message: TTS.Message,
  player_id?: string,
  request?: TTS.TTSRequest
) => {
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
    fetch_tts(full_text, request).then((d) => {
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
  const [data, set_data, data_ref] = useStateRef("");

  const [status, fetch_tts] = useRequestStatus(get_tts_data);
  const on_submit = hooks.useCallback(
    (snippet: TTS.Snippet, count?: number) => {
      const {
        text,
        options: { prefix, default_count },
      } = snippet;
      const full_text = `${prefix ?? ""}${text.repeat(
        count || default_count || 1
      )}`;
      return fetch_tts(full_text, request).then((d) => {
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
  const [data, set_data, data_ref] = useStateRef<string>("");
  hooks.useEffect(() => {
    if (data) play_audio(player_id);
  }, [data]);
  const get_data = hooks.useCallback((text: string) => {
    if (!text) {
      return Promise.resolve();
    }
    return get_tts_data(text, request).then((d) => {
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
        if (text_ref.current.endsWith(" ") && value.startsWith(" ")) {
          value = value.slice(1);
        }
        new_text = `${text_ref.current}${value}`.slice(0, length_ref.current);
        cursor_pos.current = new_text.length;
      }
      if (flag === "end") {
        reset_pos.current = true;
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
    }
    if (reset_pos.current) {
      cursor_pos.current = -1;
      reset_pos.current = false;
    }
  }, [text]);

  return insert_snippet;
};
