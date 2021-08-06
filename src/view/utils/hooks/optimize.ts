import preact from "preact";
import * as hooks from "preact/hooks";
import {
  EDITOR_SETTINGS,
  EDITOR_STATE,
  OPTIMIZE_MESSAGE_CALLBACK,
  OptimizeTrigger,
} from "~/model";
import {
  optimize_message,
  useCallbackAfterUpdate,
  useContextState,
  useValueRef,
} from "~/view/utils";

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
