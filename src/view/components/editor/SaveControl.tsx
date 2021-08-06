import * as Preact from "preact";
import { useContext, useEffect, useRef } from "preact/hooks";
import { generate_id } from "~/common";
import { MESSAGES } from "~/model";
import { MessageModalBase } from "~/view/components";
import { useLoadedMessage, useModal, useStateIfMounted } from "~/view/utils";

export const SaveMessage: Preact.FunctionComponent<{
  message: TTS.Message;
  updateMessages: (id: string | null, value: TTS.Message) => boolean;
  disabled?: boolean;
}> = ({ message, updateMessages, disabled }) => {
  const [open, set_open] = useStateIfMounted(false);

  return (
    <button
      className="btn"
      disabled={!message.text || disabled}
      onClick={() => set_open(true)}
    >
      <i className="fas fa-save" />
      Save Message
      {open &&
        useModal(
          <SaveMessageModal
            message={message}
            updateMessages={updateMessages}
            dismiss={() => set_open(false)}
          />
        )}
    </button>
  );
};

export const SaveMessageModal: Preact.FunctionComponent<{
  message: TTS.Message;
  updateMessages: (id: string | null, value: TTS.Message) => boolean;
  dismiss: () => void;
}> = ({ message, updateMessages, dismiss }) => {
  const messages = useContext(MESSAGES).value;
  const [loaded_message, loaded_id] = useLoadedMessage(messages);

  const { name } = message;
  const [value, set_value] = useStateIfMounted(name);
  const new_name = value?.trim();

  const saved = useRef(false);
  useEffect(() => {
    if (name !== value) {
      saved.current = false;
    }
  }, [value, name]);

  return (
    <MessageModalBase
      message={message}
      name={value}
      setName={set_value}
      dismiss={dismiss}
      isNew={!loaded_message}
    >
      <button className="btn" onClick={dismiss}>
        Cancel
      </button>
      {!!loaded_message && (
        <button
          className="btn btn-primary"
          onClick={() => {
            if (saved.current) {
              return;
            }
            saved.current = true;
            if (
              updateMessages(null, {
                ...message,
                id: generate_id(new_name),
                name: new_name,
              })
            ) {
              dismiss();
            } else {
              saved.current = false;
            }
          }}
          disabled={!new_name || new_name === name}
        >
          Save As New...
        </button>
      )}
      <button
        className="btn btn-primary"
        onClick={() => {
          if (saved.current) {
            return;
          }
          saved.current = true;
          if (
            updateMessages(loaded_id, {
              ...message,
              id: !!loaded_message ? message.id : generate_id(new_name),
              name: new_name,
            })
          ) {
            dismiss();
          } else {
            saved.current = false;
          }
        }}
        disabled={!new_name}
      >
        Save {!!loaded_message ? "Changes" : "New"}
      </button>
    </MessageModalBase>
  );
};
