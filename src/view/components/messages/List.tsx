import * as Preact from "preact";
import { useCallback, useContext, useMemo } from "preact/hooks";
import { replace_item_in } from "~/common";
import { LOADED_MESSAGE, MESSAGE_CATEGORIES, MESSAGES } from "~/model";
import {
  CategoryModal,
  MessageCategoryListItem,
  MessageModal,
} from "~/view/components";
import {
  useContextState,
  useModal,
  useStateIfMounted,
  useValueRef,
} from "~/view/utils";

export const MessagesList: Preact.FunctionComponent<{
  updateMessages: (
    index: string | null,
    message: TTS.Message | undefined,
    category: string | undefined
  ) => boolean;
}> = ({ updateMessages }) => {
  const [messages, set_messages] = useContextState(MESSAGES);
  const messages_ref = useValueRef(messages);
  const [categories, set_categories] = useContextState(MESSAGE_CATEGORIES);
  const set_loaded_id = useContext(LOADED_MESSAGE).setValue;
  const [edit_target, set_edit_target] = useStateIfMounted<string | null>(null);
  const [cat_edit_target, set_cat_edit_target] = useStateIfMounted<
    string | null
  >(null);

  const edit_target_msg = useMemo(
    () => messages.find(m => m.id === edit_target),
    [messages, edit_target]
  );

  const edit_target_cat = useMemo(
    () => categories.find(c => c.name === cat_edit_target),
    [categories, cat_edit_target]
  );

  const cat_ref = useValueRef(categories);
  const update_category = useCallback(
    (name: string | undefined, value: TTS.MessageCategory) => {
      set_categories(
        replace_item_in(
          cat_ref.current,
          c => c.name === name,
          value,
          "end"
        ).filter(c => !!c)
      );
    },
    []
  );

  const remove_messages_in_category = useCallback(
    (category: TTS.MessageCategory) => {
      const result = messages_ref.current.filter(
        m => !category.data.includes(m.id)
      );
      set_messages(result);
    },
    []
  );

  return (
    <div className="tts-messages">
      <div
        className="row tts-col-header tts-messages-header"
        data-help="messages-overview"
      >
        <h4>Messages</h4>
        <button
          className="tts-messages-add-category icon-button"
          type="button"
          onClick={() => set_cat_edit_target("")}
          title="Create a new message category"
        >
          <i className="fas fa-plus" />
        </button>
      </div>
      <div className="tts-message-list">
        {categories.map(c => (
          <MessageCategoryListItem
            key={c.name}
            category={c}
            updateCategory={update_category}
            onClickEditCategory={set_cat_edit_target}
            onClickEditMessage={set_edit_target}
          />
        ))}
      </div>
      {edit_target != null &&
        useModal(
          <MessageModal
            message={edit_target_msg}
            loadMessage={() => set_loaded_id(edit_target)}
            updateMessage={(value, cat) =>
              updateMessages(edit_target, value, cat)
            }
            deleteMessage={cat => updateMessages(edit_target, undefined, cat)}
            dismiss={() => set_edit_target(null)}
          />
        )}
      {cat_edit_target != null &&
        useModal(
          <CategoryModal
            category={edit_target_cat}
            updateCategory={update_category}
            onDeleteCategory={remove_messages_in_category}
            dismiss={() => set_cat_edit_target(null)}
          />
        )}
    </div>
  );
};
