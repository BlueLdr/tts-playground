import * as Preact from "preact";
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "preact/hooks";
import { do_confirm } from "~/common";
import {
  ADD_SNIPPET_CALLBACK,
  EDITOR_STATE,
  EDITOR_UNSAVED,
  LOADED_MESSAGE,
  OptimizeTrigger,
  EditorHistory,
  HELP_ITEM,
} from "~/model";
import {
  AudioPlayer,
  ClipboardButton,
  EditorHeader,
  EditorMain,
  SaveMessage,
  StatusIndicator,
  useHistoryListeners,
} from "~/view/components";
import {
  ensure_number,
  useContextState,
  useInsertSnippet,
  useModal,
  useOptimizeMessageTrigger,
  usePlayMessage,
  useStateObject,
  useValueRef,
} from "~/view/utils";

const empty_message = (length: number): TTS.Message => ({
  id: "",
  text: "",
  name: "",
  options: {
    bits: "",
    max_length: length,
    speed: false,
  },
});

export const Editor: Preact.FunctionComponent<{
  message?: TTS.Message;
  updateMessages: (id: string | null, value: TTS.Message) => boolean;
}> = ({ message, updateMessages }) => {
  const [editor_state, set_editor_state] = useContextState(EDITOR_STATE);
  const [is_unsaved, set_unsaved] = useContextState(EDITOR_UNSAVED);
  const set_loaded_message = useContext(LOADED_MESSAGE).setValue;
  const set_add_snippet_callback = useContext(ADD_SNIPPET_CALLBACK).setValue;
  const help_item = useContext(HELP_ITEM).value;

  const input_ref = useRef<HTMLTextAreaElement>();
  const [state, set_state] = useStateObject(editor_state);
  const state_ref = useValueRef(state);
  const { text, speed, max_length: max_len, bits, pause_duration } = state;
  const max_length = useMemo(() => ensure_number(max_len, 255), [max_len]);
  const pause_duration_ref = useValueRef(pause_duration);

  const get_current_cursor = useCallback(
    () => ({
      start: input_ref.current?.selectionStart ?? -1,
      end: input_ref.current?.selectionEnd ?? -1,
    }),
    []
  );
  const push_current_state = useCallback((keep?: boolean) => {
    EditorHistory.push({
      keep,
      state: state_ref.current,
      cursor: get_current_cursor(),
    });
  }, []);
  const cursor_from_history = useRef<TTS.EditorHistory["cursor"] | null>(null);
  useEffect(() => {
    EditorHistory.initialize(
      {
        state: editor_state,
        cursor: {
          start: input_ref.current.selectionStart,
          end: input_ref.current.selectionEnd,
        },
      },
      (new_state: TTS.EditorHistory, use_cursor_before: boolean) => {
        const next_cursor = use_cursor_before
          ? new_state.cursor_before ?? new_state.cursor
          : new_state.cursor;
        if (new_state.state !== state_ref.current) {
          new_state.state.pause_duration = pause_duration_ref.current;
          set_state(new_state.state);
          cursor_from_history.current = next_cursor;
        } else {
          input_ref.current.selectionStart = next_cursor.start;
          input_ref.current.selectionEnd = next_cursor.end;
        }
      }
    );
  }, []);

  useEffect(() => {
    if (cursor_from_history.current) {
      input_ref.current.selectionStart = cursor_from_history.current.start;
      input_ref.current.selectionEnd = cursor_from_history.current.end;
      cursor_from_history.current = null;
    }
  }, [state]);

  useEffect(() => {
    const trimmed_text =
      bits && `${text} ${bits}`.length > max_length
        ? text.slice(0, max_length - bits.length - 1)
        : text;
    set_editor_state({
      max_length: max_length,
      speed,
      text: trimmed_text,
      bits,
      pause_duration,
    });
  }, [max_length, speed, text, bits, pause_duration]);

  const new_message = useMemo(
    () => ({
      id: message?.id,
      text:
        bits && `${text} ${bits}`.length > max_length
          ? text.slice(0, max_length - bits.length - 1)
          : text,
      name: message?.name,
      options: {
        max_length,
        speed,
        bits,
      },
    }),

    [max_length, speed, text, message?.name, bits]
  );

  const [data, status, submit_message, message_text] =
    usePlayMessage(new_message);
  const should_submit = useRef<boolean>(false);

  const text_ref = useValueRef(text);
  const last_update = useRef<string>();
  const new_cursor_start = useRef(-1);
  const new_cursor_end = useRef(-1);
  const before_optimize = useCallback(
    (
      new_text: string,
      cursor_start: number,
      cursor_end: number,
      trigger: OptimizeTrigger
    ) => {
      if (new_text !== text_ref.current) {
        push_current_state(trigger <= OptimizeTrigger.submit);
      } else {
        EditorHistory.keep();
      }
    },
    []
  );
  const after_optimize = useCallback(
    (
      new_text: string,
      cursor_start: number,
      cursor_end: number,
      trigger: OptimizeTrigger
    ) => {
      if (new_text !== text_ref.current) {
        new_cursor_start.current = cursor_start;
        new_cursor_end.current = cursor_end;
        last_update.current = new_text;
        should_submit.current = trigger === OptimizeTrigger.submit;
        set_state({ text: new_text });
      } else if (trigger === OptimizeTrigger.submit) {
        should_submit.current = false;
        EditorHistory.keep();
        submit_message();
      }
    },
    []
  );

  useEffect(() => {
    if (should_submit.current) {
      should_submit.current = false;
      EditorHistory.keep();
      submit_message();
    }
    if (text === last_update.current) {
      if (new_cursor_start.current !== -1 && new_cursor_end.current !== -1) {
        if (input_ref.current) {
          input_ref.current.selectionStart = new_cursor_start.current;
          input_ref.current.selectionEnd = new_cursor_end.current;
        }
        new_cursor_start.current = -1;
        new_cursor_end.current = -1;
      }
      push_current_state();
      last_update.current = "";
    }
  }, [text]);

  const optimize_message = useOptimizeMessageTrigger(
    input_ref,
    before_optimize,
    after_optimize
  );

  const on_submit = useCallback(
    () => optimize_message(OptimizeTrigger.submit),
    [optimize_message]
  );

  const first_render = useRef(true);
  const load_message = useCallback((msg?: TTS.Message) => {
    msg = msg ?? empty_message(length_ref.current);
    set_state({
      text: msg?.text ?? "",
      speed: msg.options?.speed,
      max_length: msg.options?.max_length,
      bits: msg.options?.bits ?? "",
    });
    EditorHistory.reset({
      state: {
        text: msg.text,
        speed: msg.options?.speed ?? false,
        max_length: msg.options?.max_length ?? length_ref.current,
        bits: msg.options?.bits ?? "",
        pause_duration: state_ref.current?.pause_duration ?? 1,
      },
      cursor: get_current_cursor(),
    });
  }, []);
  useEffect(() => {
    if (first_render.current) {
      console.log(`not updating editor state`);
      first_render.current = false;
      return;
    }
    if (message) {
      load_message(message);
    }
  }, [message]);

  const msg_ref = useValueRef(message);
  useEffect(() => {
    const on_load_message = (e: TTS.LoadMessageEvent) => {
      if (e.detail.id === e.detail.prev_id && !e.detail.passive) {
        load_message(msg_ref.current);
      }
      if (
        e.detail.passive &&
        !(e.detail.id === null && e.detail.prev_id !== null)
      ) {
        first_render.current = true;
      }
      e.detail.callback();
    };
    window.addEventListener("load-message", on_load_message, { capture: true });
    return () => {
      window.removeEventListener("load-message", on_load_message, {
        capture: true,
      });
    };
  }, []);

  const length_ref = useValueRef(max_length);
  const reset = useCallback(() => {
    if (
      is_unsaved &&
      !do_confirm("Discard unsaved changes to the current message?")
    ) {
      return;
    }
    set_loaded_message(null, true);
    const new_state = {
      text: "",
      bits: "",
      speed: false,
      max_length: length_ref.current,
      pause_duration: pause_duration_ref.current,
    };
    set_state(new_state);
    set_unsaved(false);
    EditorHistory.reset({
      state: new_state,
      cursor: get_current_cursor(),
    });
    window.dispatchEvent(new CustomEvent("reset-message"));
  }, [is_unsaved]);

  const [listeners, on_add_snippet] = useHistoryListeners(input_ref);

  const insert_snippet = useInsertSnippet(text, max_length, input_ref);
  useEffect(() => {
    set_add_snippet_callback(() => (value: string, flag?: "start" | "end") => {
      const new_text = insert_snippet(value, flag);
      on_add_snippet(new_text, flag);
      set_state({ text: new_text });
    });
  }, []);

  const set_max_length = useCallback(
    (len: number) => set_state({ max_length: len }),
    [set_state]
  );

  const is_intro = help_item === "intro-editor";

  const content = (
    <div className="tts-editor" data-help-intro-highlight={is_intro}>
      <EditorHeader
        maxLength={max_length}
        setMaxLength={set_max_length}
        reset={reset}
      />
      <EditorMain
        inputRef={input_ref}
        text={text}
        onSubmit={on_submit}
        speed={speed}
        status={status}
        bits={bits}
        setState={set_state}
        listeners={listeners}
      />
      <div className="row">
        <AudioPlayer data={data} />
        <StatusIndicator status={status} />
      </div>
      {status.error && (
        <div className="error">{JSON.stringify(status.error, null, 2)}</div>
      )}
      <div className="row tts-main-bottom">
        <SaveMessage
          disabled={!is_unsaved}
          message={new_message}
          updateMessages={updateMessages}
        />
        <ClipboardButton text={message_text} disabled={!text} />
      </div>
    </div>
  );

  return (
    <Preact.Fragment>
      {content}
      {is_intro
        ? useModal(content, "#modal-container .modal-backdrop[data-intro-key]")
        : null}
    </Preact.Fragment>
  );
};
