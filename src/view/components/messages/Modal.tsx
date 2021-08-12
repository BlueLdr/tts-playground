import * as Preact from "preact";
import { useCallback, useEffect, useRef } from "preact/hooks";
import {
  DEFAULT_SPEED_CHAR,
  DEFAULT_VOICE,
  do_alert,
  do_confirm,
} from "~/common";
import {
  AudioPlayer,
  ClipboardButton,
  ExportMessage,
  Modal,
  ModalHeader,
  StatusIndicator,
} from "~/view/components";
import {
  useMessageFullText,
  usePlayMessage,
  useStateIfMounted,
} from "~/view/utils";

const MESSAGE_MODAL_REQUEST: TTS.TTSRequest = {
  text: "",
  promise: new Promise(() => {}),
  data: "",
};

export const MessageModal: Preact.FunctionComponent<{
  message: TTS.Message;
  loadMessage: () => void;
  updateMessage: (message: TTS.Message) => boolean;
  deleteMessage: () => void;
  dismiss: () => void;
  isNew?: boolean;
}> = ({
  message,
  loadMessage,
  updateMessage,
  deleteMessage,
  dismiss,
  isNew,
}) => {
  const { name = "", options } = message || {};
  const text = useMessageFullText(message);
  const [value, set_value] = useStateIfMounted(name);

  const saved = useRef(false);
  useEffect(() => {
    if (name !== value) {
      saved.current = false;
    }
  }, [value, name]);

  const on_click_delete = useCallback(() => {
    const should_delete = do_confirm(
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
    >
      {isNew ? (
        <div />
      ) : (
        <button
          className="btn btn-large btn-negative btn-with-icon"
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
            className="btn btn-large btn-with-icon btn-left"
            onClick={() => {
              loadMessage();
              dismiss();
            }}
          >
            <i className="fas fa-folder-open" />
            Load Into Editor
          </button>
          <ClipboardButton
            id="msg-modal"
            className="btn btn-large btn-with-icon btn-right"
            text={text}
          />
          <textarea
            id="clipboard-input-msg-modal"
            className="clipboard-input invisible"
            tabIndex={-1}
          />
        </div>
      )}

      <button
        className="btn btn-large btn-primary"
        onClick={() => {
          if (saved.current) {
            return;
          }
          saved.current = true;
          if (!message.id) {
            do_alert("couldn't save due to missing id");
            console.error("couldn't save due to missing id");
          }
          if (
            updateMessage({
              id: message.id,
              name: value,
              text: message.text,
              options,
            })
          ) {
            dismiss();
          } else {
            saved.current = false;
          }
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
}> = ({ message, name, setName, dismiss, isNew, children }) => {
  const input_ref = useRef<HTMLInputElement>();
  const {
    options: {
      max_length,
      speed,
      bits,
      voice = DEFAULT_VOICE,
      speed_char = DEFAULT_SPEED_CHAR,
    },
  } = message || {};

  const [data, status, submit_message, text] = usePlayMessage(
    message,
    "message-modal-player",
    MESSAGE_MODAL_REQUEST
  );

  const on_play = useCallback(
    e => {
      if (!data) {
        e.preventDefault();
        submit_message();
      }
    },
    [data]
  );

  useEffect(() => {
    input_ref.current?.focus();
  }, []);

  return (
    <Modal className="tts-message-modal" dismiss={dismiss}>
      <ModalHeader dismiss={dismiss}>
        <h3>{isNew ? "Create New" : "Edit"} Saved Message</h3>
      </ModalHeader>
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
        </div>
        <div className="tts-message-modal-preview">{text}</div>
        <div className="tts-message-modal-player">
          <AudioPlayer data={data} id="message-modal-player" onPlay={on_play} />
          <StatusIndicator status={status} />
        </div>
        <div className="tts-message-modal-details">
          <div className="tts-message-modal-options">
            <h4>Options</h4>
            <div className="row">
              <span>
                Character Limit: <strong>{max_length}</strong>
              </span>
              <span>
                Speed Modifier:{" "}
                <strong>{speed ? <code>{speed_char}</code> : "None"}</strong>
              </span>
              <span>
                Bits: <strong>{!!bits ? <code>{bits}</code> : "None"}</strong>
              </span>
              <span>
                Voice: <strong>{voice}</strong>
              </span>
            </div>
          </div>
        </div>
        {!isNew && (
          <div className="tts-message-modal-export">
            <ExportMessage message={message} />
          </div>
        )}
      </div>
      <div className="modal-footer">{children}</div>
    </Modal>
  );
};
