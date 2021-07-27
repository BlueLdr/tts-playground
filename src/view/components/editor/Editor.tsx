import * as Preact from "preact";
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "preact/hooks";
import {
  ADD_SNIPPET_CALLBACK,
  EDITOR_STATE,
  EDITOR_UNSAVED,
  LOADED_MESSAGE,
  OptimizeTrigger,
  EditorHistory,
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
  useOptimizeMessageTrigger,
  usePlayMessage,
  useStateObject,
  useValueRef,
} from "~/view/utils";

export const Editor: Preact.FunctionComponent<{
  message?: TTS.Message;
  updateMessages: (index: number, value: TTS.Message) => boolean;
}> = ({ message, updateMessages }) => {
  const [editor_state, set_editor_state] = useContextState(EDITOR_STATE);
  const [is_unsaved, set_unsaved] = useContextState(EDITOR_UNSAVED);
  const set_loaded_message = useContext(LOADED_MESSAGE).setValue;
  const set_add_snippet_callback = useContext(ADD_SNIPPET_CALLBACK).setValue;

  const input_ref = useRef<HTMLTextAreaElement>();
  const [state, set_state] = useStateObject(editor_state);
  const state_ref = useValueRef(state);
  const { text, speed, max_length: max_len, bits } = state;
  const max_length = useMemo(() => ensure_number(max_len, 255), [max_len]);

  const get_current_cursor = useCallback(
    () => ({
      start: input_ref.current.selectionStart,
      end: input_ref.current.selectionEnd,
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
    });
  }, [max_length, speed, text, bits]);

  const new_message = useMemo(
    () => ({
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
  useEffect(() => {
    if (first_render.current) {
      first_render.current = false;
      return;
    }
    if (message) {
      set_state({
        text: message.text,
        speed: message.options?.speed,
        max_length: message.options?.max_length,
        bits: message.options?.bits ?? "",
      });
      EditorHistory.reset({
        state: {
          text: message.text,
          speed: message.options?.speed ?? false,
          max_length: message.options?.max_length ?? 255,
          bits: message.options?.bits ?? "",
        },
        cursor: get_current_cursor(),
      });
    }
  }, [message]);

  const length_ref = useValueRef(max_length);
  const reset = useCallback(() => {
    if (
      is_unsaved &&
      !confirm("Discard unsaved changes to the current message?")
    ) {
      return;
    }
    set_loaded_message(-1, true);
    const new_state = {
      text: "",
      bits: "",
      speed: false,
      max_length: length_ref.current,
    };
    set_state(new_state);
    set_unsaved(false);
    EditorHistory.reset({
      state: new_state,
      cursor: get_current_cursor(),
    });
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

  return (
    <Preact.Fragment>
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
    </Preact.Fragment>
  );
};
