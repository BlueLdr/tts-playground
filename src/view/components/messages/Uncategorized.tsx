import * as Preact from "preact";
import { useContext, useEffect, useMemo } from "preact/hooks";
import { UNCATEGORIZED_GROUP_NAME } from "~/common";
import {
  EDITOR_SETTINGS,
  LOADED_MESSAGE,
  MESSAGE_CATEGORIES,
  MESSAGES,
} from "~/model";
import { Category, MessagesListItem } from "~/view/components";
import { useContextState, useStateIfMounted } from "~/view/utils";

export const UncategorizedMessages: Preact.FunctionComponent<{
  onClickEditMessage: (id: string) => void;
}> = ({ onClickEditMessage }) => {
  const messages = useContext(MESSAGES).value;
  const categories = useContext(MESSAGE_CATEGORIES).value;
  const loaded_id = useContext(LOADED_MESSAGE).value;
  const [settings, set_settings] = useContextState(EDITOR_SETTINGS);
  const [open, set_open] = useStateIfMounted(settings.uncategorized_msgs_open);

  useEffect(() => {
    set_settings(prev => ({ ...prev, uncategorized_msgs_open: open }));
  }, [open]);

  const uncat = useMemo(
    () => messages.filter(m => !categories.find(c => c.data.includes(m.id))),
    [categories, messages]
  );

  return uncat.length > 0 ? (
    <Category
      title={UNCATEGORIZED_GROUP_NAME}
      open={open}
      setOpen={() => set_open(!open)}
      data-help="messages-group"
      className="tts-message-category"
    >
      <ul>
        {uncat.map(m => (
          <li key={m.id}>
            <MessagesListItem
              active={m.id === loaded_id}
              message={m}
              openMessageInModal={() => onClickEditMessage(m.id)}
            />
          </li>
        ))}
      </ul>
    </Category>
  ) : null;
};
