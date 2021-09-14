import * as Preact from "preact";
import { useCallback, useContext, useMemo } from "preact/hooks";
import { replace_item_in, UNCATEGORIZED_GROUP_NAME } from "~/common";
import {
  EDITOR_SETTINGS,
  LOADED_MESSAGE,
  MESSAGE_CATEGORIES,
  MESSAGES,
} from "~/model";
import {
  CategoryModal,
  MessageModal,
  MessagesListItem,
  Organizer,
} from "~/view/components";
import {
  maybeClassName,
  useContextState,
  useModal,
  useRenderPropsFunc,
  useStateIfMounted,
  useValueRef,
} from "~/view/utils";

const message_category_header_props = (
  category: TTS.MessageCategoryPopulated
) =>
  ({
    "data-help": "messages-group",
    ...(category.name === UNCATEGORIZED_GROUP_NAME
      ? { draggable: false, "data-disable-reorder": "true" }
      : {}),
  } as HTMLDivProps);

const get_item_key = (_, msg, __) => msg.id;

export const MessagesList: Preact.FunctionComponent<{
  updateMessages: (
    index: string | null,
    message: TTS.Message | undefined,
    category: string | undefined
  ) => boolean;
}> = ({ updateMessages }) => {
  const [settings, set_settings] = useContextState(EDITOR_SETTINGS);
  const [messages, set_messages] = useContextState(MESSAGES);
  const messages_ref = useValueRef(messages);
  const [categories, set_categories] = useContextState(MESSAGE_CATEGORIES);
  const set_loaded_id = useContext(LOADED_MESSAGE).setValue;
  const [edit_target, set_edit_target] = useStateIfMounted<string | null>(null);
  const [cat_edit_target, set_cat_edit_target] = useStateIfMounted<
    string | null
  >(null);
  const [reorder_enabled, set_reorder_enabled] = useStateIfMounted(false);

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

  const sections = useMemo(() => {
    const categories_with_data: TTS.MessageCategoryPopulated[] = categories.map(
      c => ({ ...c, data: c.data.map(id => messages.find(m => m.id === id)) })
    );
    const uncat = messages.filter(
      m => !categories.find(c => c.data.includes(m.id))
    );
    if (uncat.length > 0) {
      categories_with_data.push({
        name: UNCATEGORIZED_GROUP_NAME,
        open: settings.uncategorized_msgs_open,
        data: uncat,
      });
    }
    return categories_with_data;
  }, [categories, messages, settings.uncategorized_msgs_open]);
  const set_sections = useCallback(
    (sections_: TTS.MessageCategoryPopulated[]) => {
      const results: TTS.MessageCategory[] = [];
      let uncat_open = null;
      for (let section of sections_) {
        if (section.name === UNCATEGORIZED_GROUP_NAME) {
          uncat_open = section.open;
        } else {
          results.push({
            ...section,
            data: section.data.map(m => m.id),
          });
        }
      }
      set_categories(results);
      if (uncat_open != null) {
        set_settings(prev => ({
          ...prev,
          uncategorized_msgs_open: uncat_open,
        }));
      }
    },
    []
  );

  const RenderHeader = useRenderPropsFunc<OrganizerHeaderProps>(
    props => (
      <MessagesHeader {...props} onClickAdd={() => set_cat_edit_target("")} />
    ),
    [],
    "MessagesHeader"
  );

  const RenderSectionHeaderControls = useRenderPropsFunc<
    OrganizerSectionHeaderControlsProps<TTS.Message>
  >(
    ({ section }) => (
      <button
        className="icon-button category-edit tts-message-category-edit"
        onClick={() => set_cat_edit_target(section.name)}
      >
        <i className="fas fa-edit" />
      </button>
    ),
    [],
    "MessageCategoryHeaderControls"
  );

  const RenderItem = useRenderPropsFunc<OrganizerItemProps<TTS.Message>>(
    ({ data, buttons, reorderEnabled }) => (
      <MessagesListItem
        message={data}
        openMessageInModal={set_edit_target}
        buttons={reorderEnabled ? buttons : null}
      />
    ),
    [],
    "MessageItem"
  );

  const RenderSectionExtras = useRenderPropsFunc<
    OrganizerSectionExtrasProps<TTS.Message>
  >(
    ({ section }) =>
      section.data.length === 0 ? (
        <div className="tts-message-category-empty">
          This category is empty.
        </div>
      ) : null,
    [],
    "MessageSectionExtras"
  );

  return (
    <div className="tts-messages">
      <div className="tts-message-list">
        <Organizer<TTS.Message>
          RenderHeader={RenderHeader}
          RenderSectionHeaderControls={RenderSectionHeaderControls}
          RenderSectionExtras={RenderSectionExtras}
          RenderItem={RenderItem}
          getSectionHeaderProps={message_category_header_props}
          getItemKey={get_item_key}
          sections={sections}
          reorderEnabled={reorder_enabled}
          setReorderEnabled={set_reorder_enabled}
          updateSections={set_sections}
        />
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
export const MessagesHeader: Preact.FunctionComponent<{
  className: string;
  buttons: Preact.ComponentChildren;
  reorderEnabled: boolean;
  onClickAdd: () => void;
}> = ({ className, buttons, reorderEnabled, onClickAdd }) => {
  return (
    <div
      className={`row tts-col-header tts-messages-header${maybeClassName(
        className
      )}`}
      data-help="messages-overview"
    >
      <h4>Messages</h4>
      <div className="tts-col-header-controls">
        {buttons}
        {!reorderEnabled && (
          <button
            className="tts-messages-add-category icon-button"
            type="button"
            onClick={onClickAdd}
            title="Create a new message category"
          >
            <i className="fas fa-plus" />
          </button>
        )}
      </div>
    </div>
  );
};
