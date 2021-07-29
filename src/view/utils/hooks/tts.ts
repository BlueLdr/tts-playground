import preact from "preact";
import * as hooks from "preact/hooks";
import { get_tts_data, play_audio, SPEED_CHAR } from "~/common";
import {
  EDITOR_SETTINGS,
  EDITOR_STATE,
  OPTIMIZE_MESSAGE_CALLBACK,
  OptimizeTrigger,
} from "~/model";
import {
  insert_text_at_selection,
  optimize_message,
  useCallbackAfterUpdate,
  useContextState,
  useMemoRef,
  useRequestStatus,
  useStateRef,
  useValueRef,
} from "~/view/utils";

export const usePlayMessage = (
  message: TTS.Message,
  player_id?: string,
  request?: TTS.TTSRequest
) => {
  const { voice, bits_string } = hooks.useContext(EDITOR_SETTINGS).value ?? {};
  const voice_ref = useValueRef(voice);
  const {
    text,
    options: { speed, max_length, bits },
  } = message;

  const [data, set_data, data_ref] = useStateRef("");
  const full_text = useMemoRef(() => {
    const bits_length = bits && bits_string ? bits_string.length + 1 : 0;
    if (speed && max_length !== text.length) {
      return `${text} ${SPEED_CHAR.repeat(
        Math.max(max_length - text.length - 1 - bits_length, 0)
      )}`;
    }
    return text;
  }, [speed, text, max_length, bits, bits_string]);

  const [status, fetch_tts] = useRequestStatus(get_tts_data);
  const on_submit = hooks.useCallback(() => {
    fetch_tts(full_text.current, request, voice_ref.current).then(d => {
      if (d === data_ref.current) {
        if (data_ref.current) play_audio(player_id, false);
      } else {
        set_data(d);
      }
    });
  }, [request, player_id]);

  hooks.useEffect(() => {
    if (data) play_audio(player_id);
  }, [data]);

  return [
    data,
    status,
    on_submit,
    bits ? `${bits} ${full_text.current}` : full_text.current,
  ] as const;
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
      return fetch_tts(full_text, request, voice_ref.current).then(d => {
        if (d === data_ref.current) {
          if (data_ref.current) play_audio(player_id, false);
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
    return get_tts_data(text, request, voice_ref.current).then(d => {
      if (d === data_ref.current) {
        play_audio(player_id, false);
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
    options: { max_length, speed, bits },
  } = message;
  return hooks.useMemo(() => {
    let text_ = bits ? `${bits} ${text}` : text;
    if (!speed || text_.length >= max_length - 1) {
      return text_;
    }
    return `${text_}${SPEED_CHAR.repeat(max_length - text.length)}`;
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

export const useOptimizeMessage = (
  editor_settings: TTS.EditorSettings,
  is_optimized: preact.RefObject<boolean>,
  enabled: preact.RefObject<boolean>
) => {
  const [editor_state, set_editor_state] = useContextState(EDITOR_STATE);
  const state_ref = useValueRef(editor_state);
  const settings_ref = useValueRef(editor_settings);
  const last_trigger = hooks.useRef<OptimizeTrigger>(Infinity);

  hooks.useEffect(() => {
    is_optimized.current = false;
  }, [editor_state.text]);

  const callback_ref = hooks.useRef<() => void>(() => {});
  const [optimize_message_listener] = useCallbackAfterUpdate(
    hooks.useCallback((e: TTS.OptimizeEvent) => {
      const { trigger, input, callback } = e.detail;
      if (
        (is_optimized.current && last_trigger.current <= trigger) ||
        !enabled.current
      ) {
        callback(
          state_ref.current.text,
          input.current?.selectionStart,
          input.current?.selectionEnd,
          trigger
        );
        return;
      }
      const { trim_whitespace, optimize_words } = settings_ref.current;
      if (!trim_whitespace && trigger > optimize_words) {
        callback(
          state_ref.current.text,
          input.current?.selectionStart,
          input.current?.selectionEnd,
          trigger
        );
        return;
      }
      const [new_text, cursor_start, cursor_end] = optimize_message(
        state_ref.current.text,
        input,
        trigger,
        settings_ref.current
      );

      if (state_ref.current.text !== new_text && callback) {
        callback_ref.current = () => {
          callback_ref.current = () => {};
          callback(new_text, cursor_start, cursor_end, trigger);
        };
      }

      last_trigger.current = trigger;
      is_optimized.current = true;
      set_editor_state({
        ...state_ref.current,
        text: new_text,
      });

      if (state_ref.current.text === new_text && callback) {
        callback(new_text, cursor_start, cursor_end, trigger);
      }
    }, []),
    callback_ref,
    [editor_state.text]
  );

  hooks.useEffect(() => {
    window.addEventListener("optimize-message", optimize_message_listener);
    return () =>
      window.removeEventListener("optimize-message", optimize_message_listener);
  }, []);
};

export const useOptimizeMessageTrigger = (
  input_ref: preact.RefObject<HTMLTextAreaElement>,
  callback_pre?: TTS.OptimizeCallback,
  callback_post?: TTS.OptimizeCallback
) => {
  const settings_ref = useValueRef(hooks.useContext(EDITOR_SETTINGS).value);
  const editor_state = hooks.useContext(EDITOR_STATE).value;
  const state_ref = useValueRef(editor_state);
  const [ctx_callback, set_callback] = useContextState(
    OPTIMIZE_MESSAGE_CALLBACK
  );

  const cb = hooks.useCallback(
    (trigger: OptimizeTrigger) => {
      callback_pre?.(
        state_ref.current.text,
        input_ref.current?.selectionStart,
        input_ref.current?.selectionEnd,
        trigger
      );
      if (trigger > settings_ref.current.optimize_words) {
        callback_post?.(
          state_ref.current.text,
          input_ref.current?.selectionStart,
          input_ref.current?.selectionEnd,
          trigger
        );
        return;
      }
      const evt: TTS.OptimizeEvent = new CustomEvent("optimize-message", {
        bubbles: true,
        detail: {
          trigger,
          input: input_ref,
          callback: callback_post,
        },
      });
      input_ref.current?.dispatchEvent(evt);
    },
    [input_ref, callback_post]
  );
  hooks.useEffect(() => {
    set_callback(() => cb);
  }, [cb]);

  return ctx_callback;
};
