import * as Preact from "preact";
import { useContext } from "preact/hooks";
import { LOADED_MESSAGE, MessageModalBase, MESSAGES } from "~/view/components";
import { useModal, useStateIfMounted } from "~/view/utils";

export const SaveMessage: Preact.FunctionComponent<{
  message: TTS.Message;
  updateMessages: (index: number, value: TTS.Message) => boolean;
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
  updateMessages: (index: number, value: TTS.Message) => boolean;
  dismiss: () => void;
}> = ({ message, updateMessages, dismiss }) => {
  const messages = useContext(MESSAGES).value;
  const loaded_index = useContext(LOADED_MESSAGE).value;
  const loaded_message = messages[loaded_index];

  const { name } = message;
  const [value, set_value] = useStateIfMounted(name);
  const new_name = value?.trim();

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
            if (
              updateMessages(-1, {
                ...message,
                name: new_name,
              })
            ) {
              dismiss();
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
          if (
            updateMessages(loaded_index, {
              ...message,
              name: new_name,
            })
          ) {
            dismiss();
          }
        }}
        disabled={!new_name}
      >
        Save {!!loaded_message ? "Changes" : "New"}
      </button>
    </MessageModalBase>
  );
};
