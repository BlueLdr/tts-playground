import * as Preact from "preact";
import { useContext } from "preact/hooks";
import { LOADED_MESSAGE } from "~/model";
import { useCopyToClipboard, useMessageFullText } from "~/view/utils";

export const MessagesListItem: Preact.FunctionComponent<{
  message: TTS.Message;
  openMessageInModal: (id: string) => void;
  buttons?: Preact.ComponentChildren | null;
}> = ({ message, openMessageInModal, buttons }) => {
  const loaded_id = useContext(LOADED_MESSAGE).value;
  const copy = useCopyToClipboard(useMessageFullText(message));
  return (
    <div
      className="tts-message-item"
      data-active={`${loaded_id === message.id}`}
    >
      <div className="tts-message-item-header">
        <div
          className="tts-message-item-title"
          onClick={() => openMessageInModal(message.id)}
        >
          {message.name}
        </div>
        {buttons || (
          <button
            className="btn icon-button tts-message-item-copy"
            onClick={copy}
            title="Copy message to clipboard"
          >
            <i className="fas fa-clipboard" />
          </button>
        )}
      </div>
    </div>
  );
};
