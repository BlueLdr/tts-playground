import * as Preact from "preact";
import { useContext, useEffect, useMemo } from "preact/hooks";
import { LOADED_MESSAGE, MESSAGES } from "~/model";
import { MessagesListItem, Category } from "~/view/components";
import { useStateIfMounted } from "~/view/utils";

export const MessageCategoryListItem: Preact.FunctionComponent<{
  category: TTS.MessageCategory;
  updateCategory: (name: string, value: TTS.MessageCategory) => void;
  onClickEditCategory: (name: string) => void;
  onClickEditMessage: (id: string) => void;
}> = ({
  category,
  updateCategory,
  onClickEditCategory,
  onClickEditMessage,
}) => {
  const messages = useContext(MESSAGES).value;
  const these_messages = useMemo(
    () => messages.filter(m => category.data.includes(m.id)),
    [messages, category.data]
  );
  const loaded_id = useContext(LOADED_MESSAGE).value;

  const [open, set_open] = useStateIfMounted(category.open ?? false);
  useEffect(() => {
    updateCategory(category.name, { ...category, open });
  }, [open]);

  return (
    <Category
      title={category.name}
      open={category.open}
      setOpen={() => set_open(!open)}
      data-help="messages-group"
      className="tts-message-category"
      controls={
        <button
          className="icon-button category-edit tts-message-category-edit"
          onClick={() => onClickEditCategory(category.name)}
        >
          <i className="fas fa-edit" />
        </button>
      }
    >
      {these_messages.length > 0 ? (
        <ul>
          {these_messages.map(m => (
            <li key={m.id}>
              <MessagesListItem
                active={m.id === loaded_id}
                message={m}
                openMessageInModal={() => onClickEditMessage(m.id)}
              />
            </li>
          ))}
        </ul>
      ) : (
        <div className="tts-message-category-empty">
          This category is empty.
        </div>
      )}
    </Category>
  );
};
