import * as Preact from "preact";
import { useContext, useMemo } from "preact/hooks";
import { MESSAGES } from "~/model";
import { useMessageFullText } from "~/view/utils";

export const DiffButton: Preact.FunctionComponent<{
  message: TTS.Message;
}> = ({ message }) => {
  const messages = useContext(MESSAGES).value;
  const old_message = useMemo(
    () => messages.find(m => m.id === message.id),
    [message.id]
  );
  const old_text = useMessageFullText(old_message);
  const new_text = useMessageFullText(message);

  if (!old_text || !new_text || old_text === new_text) {
    return null;
  }
  return (
    <form
      id="diff-form"
      action="https://text-compare.com"
      method="POST"
      target="_blank"
    >
      <input type="hidden" value={old_text} name="text1" id="inputText1" />
      <input type="hidden" value={new_text} name="text2" id="inputText2" />
      <button type="submit" class="btn btn-large btn-primary">
        Review Changes
      </button>
    </form>
  );
};
