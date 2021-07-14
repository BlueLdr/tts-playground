import * as Preact from "preact";
import { useContext } from "preact/hooks";
import { LOADED_MESSAGE, MESSAGES } from "~/model";
import { AudioPlayer } from "~/view/components";
import { MessageModal } from "~/view/components/messages/Modal";
import {
  useAudioPlayer,
  useContextState,
  useCopyToClipboard,
  useMessageFullText,
  useModal,
  useStateIfMounted,
} from "~/view/utils";

export const MessagesList: Preact.FunctionComponent<{
  updateMessages: (index: number, message?: TTS.Message) => void;
}> = ({ updateMessages }) => {
  const messages = useContext(MESSAGES).value;
  const [loaded_index, set_loaded_index] = useContextState(LOADED_MESSAGE);
  const [edit_target, set_edit_target] = useStateIfMounted(undefined);

  const [tts_data, preview_tts] = useAudioPlayer("messages-sidebar-player");

  return (
    <div className="tts-messages">
      <div className="row tts-col-header tts-messages-header">
        <h4>Messages</h4>
      </div>
      <div className="tts-message-list">
        {messages.map((m, i) => (
          <MessagesListItem
            active={i === loaded_index}
            message={m}
            openMessageInModal={() => set_edit_target(i)}
          />
        ))}
      </div>
      <AudioPlayer
        id="messages-sidebar-player"
        className="tts-messages-sidebar-player invisible"
        data={tts_data}
      />
      {edit_target != null &&
        useModal(
          <MessageModal
            message={messages[edit_target]}
            loadMessage={() => set_loaded_index(edit_target)}
            updateMessage={(value) => updateMessages(edit_target, value)}
            deleteMessage={() => updateMessages(edit_target)}
            dismiss={() => set_edit_target(undefined)}
            previewMessage={preview_tts}
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
