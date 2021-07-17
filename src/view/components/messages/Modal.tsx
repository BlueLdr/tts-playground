import * as Preact from "preact";
import { useCallback, useEffect, useRef } from "preact/hooks";
import { ClipboardButton } from "~/view/components";
import { useMessageFullText, useStateIfMounted } from "~/view/utils";

export const MessageModal: Preact.FunctionComponent<{
  message: TTS.Message;
  loadMessage: () => void;
  updateMessage: (message: TTS.Message) => void;
  deleteMessage: () => void;
  dismiss: () => void;
  previewMessage: (text: string) => void;
  isNew?: boolean;
}> = ({
  message,
  loadMessage,
  updateMessage,
  deleteMessage,
  dismiss,
  previewMessage,
  isNew,
}) => {
  const { name = "", options } = message || {};
  const text = useMessageFullText(message);
  const [value, set_value] = useStateIfMounted(name);

  const on_click_delete = useCallback(() => {
    const should_delete = confirm(
      "Are you sure you want to delete this message?"
    );
    if (should_delete) {
      deleteMessage();
      dismiss();
    }
  }, []);

  if (!message) {
    return null;
  }

  return (
    <MessageModalBase
      message={message}
      name={value}
      setName={set_value}
      dismiss={dismiss}
      previewMessage={previewMessage}
    >
      {isNew ? (
        <div />
      ) : (
        <button
          className="btn btn-negative btn-with-icon"
          onClick={on_click_delete}
          disabled={!name}
        >
          <i className="fas fa-trash" />
          Delete
        </button>
      )}
      {!isNew && (
        <div className="btn-multi">
          <button
            className="btn btn-with-icon btn-left"
            onClick={() => {
              loadMessage();
              dismiss();
            }}
          >
            <i className="fas fa-folder-open" />
            Load Into Editor
          </button>
          <ClipboardButton
            className="btn btn-with-icon btn-right"
            text={text}
          />
        </div>
      )}

      <button
        className="btn btn-primary"
        onClick={() => {
          updateMessage({
            name: value,
            text: message.text,
            options,
          });
          dismiss();
        }}
        disabled={!value || value === name}
      >
        Save
      </button>
    </MessageModalBase>
  );
};

export const MessageModalBase: Preact.FunctionComponent<{
  message: TTS.Message;
  name: string;
  setName: (value: string) => void;
  dismiss: () => void;
  isNew?: boolean;
  previewMessage?: (text: string) => void;
}> = ({ message, name, setName, dismiss, isNew, previewMessage, children }) => {
  const input_ref = useRef<HTMLInputElement>();
  const {
    options: { max_length, speed, bits },
  } = message || {};
  const text = useMessageFullText(message);

  useEffect(() => {
    input_ref.current?.focus();
  }, []);

  return (
    <div className="modal-backdrop">
      <div className="modal tts-message-modal">
        <div className="modal-header">
          <h3>{isNew ? "Create New" : "Edit"} Saved Message</h3>
          <button className="icon-button modal-close" onClick={dismiss}>
            <i className="fas fa-times" />
          </button>
        </div>
        <div className="modal-body">
          <div className="row tts-message-modal-name">
            <label className="tts-message-modal-input">
              <p>Message Name</p>
              <input
                ref={input_ref}
                value={name}
                onInput={e => setName((e.target as HTMLInputElement).value)}
              />
            </label>
            {
              // TODO: move full player here
              /*{previewMessage && (
              <button
                className="btn btn-with-icon"
                onClick={() => previewMessage(text)}
              >
                <i className="fas fa-volume-up" />
                Preview Message
              </button>
            )}*/
            }
          </div>
          <div className="tts-message-modal-preview">{text}</div>
          <div className="tts-message-modal-details">
            <h4>Options</h4>
            <div className="row">
              <span>
                Character Limit: <strong>{max_length}</strong>
              </span>
              <span>
                Use Speed Modifier: <strong>{speed ? "Yes" : "No"}</strong>
              </span>
              <span>
                Use Bits: <strong>{!!bits ? "Yes" : "No"}</strong>
              </span>
            </div>
          </div>
        </div>
        <div className="modal-footer">{children}</div>
      </div>
    </div>
  );
};
