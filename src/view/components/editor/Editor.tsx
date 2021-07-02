import * as Preact from "preact";
import { useCallback, useContext, useEffect, useMemo } from "preact/hooks";
import {
  StatusIndicator,
  EditorHeader,
  EDITOR_STATE,
  EDITOR_UNSAVED,
  LOADED_MESSAGE,
  ClipboardButton,
  EditorMain,
  AudioPlayer,
} from "~/view/components";
import { ensure_number, usePlayMessage, useStateIfMounted } from "~/view/utils";

export const Editor: Preact.FunctionComponent<{ message?: TTS.Message }> = ({
  message,
}) => {
  const { value: editor_state, setValue: set_editor_state } =
    useContext(EDITOR_STATE);
  const { value: is_unsaved, setValue: set_unsaved } =
    useContext(EDITOR_UNSAVED);
  const set_loaded_message = useContext(LOADED_MESSAGE).setValue;

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

  useEffect(() => {
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

  return (
    <Preact.Fragment>
      <EditorHeader
        maxLength={max_length}
        setMaxLength={set_max_length}
        reset={reset}
      />
      <EditorMain
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
        {/*<TTSSaveMessage
          disabled={!is_unsaved}
          loadedMessage={message}
          message={new_message}
        />*/}
        <ClipboardButton text={message_text} disabled={!text} />
      </div>
    </Preact.Fragment>
  );
};
