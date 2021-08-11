import * as Preact from "preact";
import { useContext, useMemo } from "preact/hooks";
import { LOADED_MESSAGE, MESSAGES } from "~/model";
import { MessageModal } from "~/view/components/messages/Modal";
import {
  useContextState,
  useCopyToClipboard,
  useMessageFullText,
  useModal,
  useStateIfMounted,
} from "~/view/utils";

export const MessagesList: Preact.FunctionComponent<{
  updateMessages: (index: string | null, message?: TTS.Message) => boolean;
}> = ({ updateMessages }) => {
  const messages = useContext(MESSAGES).value;
  const [loaded_id, set_loaded_id] = useContextState(LOADED_MESSAGE);
  const [edit_target, set_edit_target] = useStateIfMounted<string | null>(null);

  const edit_target_msg = useMemo(
    () => messages.find(m => m.id === edit_target),
    [messages, edit_target]
  );

  return (
    <div className="tts-messages">
      <div
        className="row tts-col-header tts-messages-header"
        data-help="messages-overview"
      >
        <h4>Messages</h4>
      </div>
      <div className="tts-message-list">
        {messages.map(m => (
          <MessagesListItem
            key={m.id}
            active={m.id === loaded_id}
            message={m}
            openMessageInModal={() => set_edit_target(m.id)}
          />
        ))}
      </div>
      {edit_target != null &&
        useModal(
          <MessageModal
            message={edit_target_msg}
            loadMessage={() => set_loaded_id(edit_target)}
            updateMessage={value => updateMessages(edit_target, value)}
            deleteMessage={() => updateMessages(edit_target)}
            dismiss={() => set_edit_target(null)}
          />
        )}
    </div>
  );
};

export const MessagesListItem: Preact.FunctionComponent<{
  active: boolean;
  message: TTS.Message;
  openMessageInModal: () => void;
}> = ({ active, message, openMessageInModal }) => {
  const copy = useCopyToClipboard(useMessageFullText(message));
  return (
    <div className="tts-message-item" data-active={`${active}`}>
      <div className="tts-message-item-header">
        <div className="tts-message-item-title" onClick={openMessageInModal}>
          {message.name}
        </div>
        <button
          className="btn icon-button tts-message-item-copy"
          onClick={copy}
          title="Copy message to clipboard"
        >
          <i className="fas fa-clipboard" />
        </button>
      </div>
    </div>
  );
};
