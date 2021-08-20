import * as Preact from "preact";
import { useCopyToClipboard, useMessageFullText } from "~/view/utils";

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
