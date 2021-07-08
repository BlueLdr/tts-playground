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
} from "~/model";
import {
  StatusIndicator,
  EditorHeader,
  ClipboardButton,
  EditorMain,
  AudioPlayer,
  SaveMessage,
} from "~/view/components";
import {
  ensure_number,
  useContextState,
  useInsertSnippet,
  usePlayMessage,
  useStateIfMounted,
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
  const [text, set_text] = useStateIfMounted(editor_state?.text ?? "");
  const [speed, set_speed] = useStateIfMounted(editor_state?.speed ?? false);
  const [max_len, set_max_length] = useStateIfMounted(
    editor_state?.max_length ?? 255
  );
  const max_length = useMemo(() => ensure_number(max_len, 255), [max_len]);

  useEffect(() => {
    set_editor_state({
      max_length: max_length,
      speed,
      text,
    });
  }, [max_length, speed, text]);

  const new_message = useMemo(
    () => ({
      text,
      name: message?.name,
      options: {
        max_length,
        speed,
      },
    }),

    [max_length, speed, text, message?.name]
  );

  const [data, status, on_submit, message_text] = usePlayMessage(new_message);

  const first_render = useRef(true);
  useEffect(() => {
    if (first_render.current) {
      first_render.current = false;
      return;
    }
    if (message) {
      set_text(message.text);
      set_speed(message.options?.speed);
      set_max_length(message.options?.max_length);
    }
  }, [message]);

  const reset = useCallback(() => {
    if (
      is_unsaved &&
      !confirm("Discard unsaved changes to the current message?")
    ) {
      return;
    }
    set_text("");
    set_speed(false);
    set_unsaved(false);
    set_loaded_message(-1);
  }, [is_unsaved]);

  const insert_snippet = useInsertSnippet(text, max_length, input_ref);
  useEffect(() => {
    set_add_snippet_callback(() => (value: string, flag?: "start" | "end") => {
      const new_text = insert_snippet(value, flag);
      set_text(new_text);
    });
  }, []);

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
        onChange={set_text}
        onSubmit={on_submit}
        speed={speed}
        setSpeed={set_speed}
        status={status}
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
