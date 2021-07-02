import * as Preact from "preact";
import { memo } from "preact/compat";
import { useContext, useEffect, useMemo } from "preact/hooks";
import {
  Editor,
  EDITOR_STATE,
  EDITOR_UNSAVED,
  LOADED_MESSAGE,
  MESSAGES,
} from "~/view/components";

export const View: Preact.FunctionComponent = memo(() => {
  const messages = useContext(MESSAGES).value;
  const loaded_index = useContext(LOADED_MESSAGE).value;
  const { text, speed, max_length } = useContext(EDITOR_STATE).value;
  const set_unsaved = useContext(EDITOR_UNSAVED).setValue;
  const loaded_message = messages[loaded_index];

  const is_unsaved = useMemo(() => {
    return !loaded_message
      ? !!text
      : loaded_message.text !== text ||
          loaded_message.options?.speed !== speed ||
          loaded_message.options?.max_length !== max_length;
  }, [loaded_message, text, speed, max_length]);
  useEffect(() => {
    set_unsaved(is_unsaved);
  }, [is_unsaved]);

  return (
    <div className="tts-container">
      <div className="tts-container">
        <div className="tts-col tts-col-messages"></div>
        <div className="tts-col tts-col-main">
          <Editor message={loaded_message} />
        </div>
        <div className="tts-col tts-col-scratch"></div>
      </div>
    </div>
  );
});
