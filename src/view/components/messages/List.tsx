import * as Preact from "preact";
import { useCallback, useContext, useEffect, useMemo } from "preact/hooks";
import { replace_item_in, UNCATEGORIZED_GROUP_NAME } from "~/common";
import {
  EDITOR_SETTINGS,
  ImmutableContextValue,
  LOADED_MESSAGE,
  MESSAGE_CATEGORIES,
  MESSAGES,
  OptimizeLevel,
  OptimizeTrigger,
  UNCATEGORIZED_MESSAGES,
} from "~/model";
import {
  CategoryModal,
  MessageModal,
  MessagesListItem,
  Organizer,
  SEARCH_BAR,
  SearchBar,
  useOrganizerSearch,
  useModal,
} from "~/view/components";
import {
  maybeClassName,
  optimize_message,
  useContextState,
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

const regex_test_message = (opt, regex) =>
  regex.test(opt.name) || regex.test(opt.text);

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
  const [uncategorized_msgs, set_uncat_msgs] = useContextState(
    UNCATEGORIZED_MESSAGES
  );
  const uncat_ref = useValueRef(uncategorized_msgs);
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

  const [search, set_search] = useStateIfMounted("");
  const search_ctx_value = useMemo(
    () => new ImmutableContextValue(search, set_search),
    [search]
  );

  const settings = useContext(EDITOR_SETTINGS).value;
  const search_inputs = useMemo<string[] | null>(() => {
    if (!search) {
      return null;
    }
    const strs: string[] = [search];
    for (let level of ["safe", "normal", "max"]) {
      strs.push(
        optimize_message(search, { current: null }, OptimizeTrigger.manual, {
          ...settings,
          optimize_level: OptimizeLevel[level],
        })[0]
      );
    }
    return strs;
  }, [search, settings]);
  const [search_results_items, search_results_sections] = useOrganizerSearch(
    messages,
    categories,
    uncategorized_msgs,
    search_inputs,
    regex_test_message
  );
  const is_search = useValueRef(
    !!search_results_items || !!search_results_sections
  );

  const sections = useMemo(() => {
    if (search_results_sections) {
      return search_results_sections.map(c => ({
        ...c,
        data: c.data.map(id => messages.find(m => m.id === id)),
      }));
    }

    const categories_with_data: TTS.MessageCategoryPopulated[] = categories.map(
      c => ({ ...c, data: c.data.map(id => messages.find(m => m.id === id)) })
    );
    const uncat = messages.filter(
      m => !categories.find(c => c.data.includes(m.id))
    );
    if (uncat.length > 0) {
      const uncat_sorted = uncategorized_msgs.data
        .filter(id => uncat.find(m => m.id === id))
        .map(id => messages.find(m => m.id === id))
        .concat(uncat.filter(m => !uncategorized_msgs.data.includes(m.id)));
      categories_with_data.push({
        ...uncategorized_msgs,
        data: uncat_sorted,
      });
    }
    return categories_with_data;
  }, [categories, search_results_sections, messages, uncategorized_msgs]);

  const set_sections = useCallback(
    (sections_: TTS.MessageCategoryPopulated[]) => {
      let results: TTS.MessageCategory[] = [];
      let uncat = null;
      if (!!is_search.current) {
        results = sections_.reduce((cats, updated) => {
          if (updated.name === UNCATEGORIZED_GROUP_NAME) {
            uncat = { ...uncat_ref.current, open: updated.open };
            return cats;
          }
          return replace_item_in(
            cats,
            cat => cat.name === updated.name,
            prev_value => ({ ...prev_value, open: updated.open })
          );
        }, cat_ref.current);
      } else {
        for (let section of sections_) {
          if (section.name === UNCATEGORIZED_GROUP_NAME) {
            uncat = section;
          } else {
            results.push({
              ...section,
              data: section.data.map(m => m.id),
            });
          }
        }
      }
      set_categories(results);
      if (uncat != null) {
        set_uncat_msgs(
          {
            ...uncat,
            data: uncat.data.map(m => m.id),
          },
          results
        );
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
    ({ section }) =>
      section.name !== UNCATEGORIZED_GROUP_NAME && (
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

  const [MsgModalContainer, toggle_msg_modal] = useModal();
  useEffect(() => {
    toggle_msg_modal(edit_target != null);
  }, [edit_target]);

  const [CatModalContainer, toggle_cat_modal] = useModal();
  useEffect(() => {
    toggle_cat_modal(cat_edit_target != null);
  }, [cat_edit_target]);

  return (
    <div className="tts-messages">
      <SEARCH_BAR.Provider value={search_ctx_value}>
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
      </SEARCH_BAR.Provider>
      <MsgModalContainer>
        <MessageModal
          message={edit_target_msg}
          loadMessage={() => set_loaded_id(edit_target)}
          updateMessage={(value, cat) =>
            updateMessages(edit_target, value, cat)
          }
          deleteMessage={cat => updateMessages(edit_target, undefined, cat)}
          dismiss={() => {
            if (toggle_msg_modal(false)) {
              set_edit_target(null);
            }
          }}
        />
      </MsgModalContainer>
      <CatModalContainer>
        <CategoryModal
          category={edit_target_cat}
          updateCategory={update_category}
          onDeleteCategory={remove_messages_in_category}
          dismiss={() => {
            if (toggle_cat_modal(false)) {
              set_cat_edit_target(null);
            }
          }}
        />
      </CatModalContainer>
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
    >
      <SearchBar />
      <h4 data-help="messages-overview">Messages</h4>
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
