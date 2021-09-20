import * as Preact from "preact";
import { PureComponent } from "preact/compat";
import * as hooks from "preact/hooks";
import { useEffect } from "preact/hooks";
import { do_confirm } from "~/common";
import * as storage from "~/common";
import {
  ADD_SNIPPET_CALLBACK,
  EDIT_MSG_TARGET,
  EDITOR_SETTINGS,
  EDITOR_STATE,
  EDITOR_UNSAVED,
  HELP_COMPLETED,
  HELP_ITEM,
  ImmutableContextValue,
  INITIAL_STATE,
  IS_OPTIMIZED,
  LOADED_MESSAGE,
  MESSAGE_CATEGORIES,
  MESSAGES,
  OPTIMIZE_MESSAGE_CALLBACK,
  SNIPPETS,
  UNCATEGORIZED_MESSAGES,
  SNIPPETS_SECTIONS,
  VOLUME_CTX,
} from "~/model";
import {
  get_uncategorized_messages,
  useContextState,
  useOptimizeMessage,
  useStateRef,
  useValueRef,
} from "~/view/utils";

const CONTEXTS = {
  VOLUME_CTX: {
    context: VOLUME_CTX,
    initialValue: INITIAL_STATE.volume,
  },
  EDITOR_STATE: {
    context: EDITOR_STATE,
    initialValue: INITIAL_STATE.editor,
  },
  EDITOR_SETTINGS: {
    context: EDITOR_SETTINGS,
    initialValue: INITIAL_STATE.settings,
  },
  EDITOR_UNSAVED: {
    context: EDITOR_UNSAVED,
    initialValue: true,
  },
  EDIT_MSG_TARGET: {
    context: EDIT_MSG_TARGET,
    initialValue: undefined,
  },
  ADD_SNIPPET_CALLBACK: {
    context: ADD_SNIPPET_CALLBACK,
    initialValue: () => {},
  },
  OPTIMIZE_MESSAGE_CALLBACK: {
    context: OPTIMIZE_MESSAGE_CALLBACK,
    initialValue: () => {},
  },
  MESSAGES: {
    context: MESSAGES,
    initialValue: INITIAL_STATE.messages,
  },
  MESSAGE_CATEGORIES: {
    context: MESSAGE_CATEGORIES,
    initialValue: INITIAL_STATE.message_categories,
  },
  UNCATEGORIZED_MESSAGES: {
    context: UNCATEGORIZED_MESSAGES,
    initialValue: INITIAL_STATE.uncategorized_msgs,
  },
  SNIPPETS: {
    context: SNIPPETS,
    initialValue: INITIAL_STATE.snippets,
  },
  SNIPPETS_SECTIONS: {
    context: SNIPPETS_SECTIONS,
    initialValue: INITIAL_STATE.snippets_sections,
  },
  HELP_ITEM: {
    context: HELP_ITEM,
    initialValue: null,
  },
  HELP_COMPLETED: {
    context: HELP_COMPLETED,
    initialValue: INITIAL_STATE.help,
  },
} as const;

type Contexts = typeof CONTEXTS;
type ContextValue<K extends keyof Contexts> =
  Contexts[K]["context"] extends Preact.Context<
    ImmutableContextValue<infer T, infer S>
  >
    ? T
    : any;
type ContextSetter<K extends keyof Contexts> =
  Contexts[K]["context"] extends Preact.Context<
    ImmutableContextValue<infer T, infer S>
  >
    ? S
    : any;

export class WithGlobalContexts extends PureComponent {
  constructor(props) {
    super(props);
    // @ts-expect-error:
    this._state = {};
    // @ts-expect-error:
    this._setters = {};
    // @ts-expect-error:
    this._ctx_values = {};
    Object.entries(CONTEXTS).forEach(([key, { context, initialValue }]) => {
      this._state[key] = initialValue;
      this._setters[key] = this.createSetter(key as keyof Contexts);
      this._ctx_values[key] = new ImmutableContextValue(
        this._state[key],
        this._setters[key]
      );
    });
  }
  mounted: boolean = false;
  _state: { [K in keyof Contexts]: ContextValue<K> };
  _setters: { [K in keyof Contexts]: ContextSetter<K> };
  _ctx_values: {
    [K in keyof Contexts]: ImmutableContextValue<
      ContextValue<K>,
      ContextSetter<K>
    >;
  };

  componentDidMount() {
    this.mounted = true;
  }
  componentWillUnmount() {
    this.mounted = false;
  }

  createSetter = <K extends keyof Contexts>(key: K): ContextSetter<K> =>
    (s => {
      const cur_value = this._state[key];
      const new_value: ContextValue<K> =
        typeof s === "function" ? s(cur_value) : s;
      if (cur_value !== new_value) {
        // @ts-expect-error:
        this._state[key] = new_value;
        // @ts-expect-error:
        this._ctx_values[key] = new ImmutableContextValue(
          new_value,
          this._setters[key] as ContextSetter<K>
        );
        if (this.mounted) {
          this.forceUpdate();
        }
      }
    }) as ContextSetter<K>;

  render() {
    const { children } = this.props;
    return (
      <Preact.Fragment>
        {Object.entries(CONTEXTS).reduce((prev, [key, spec]) => {
          const { Provider } = spec.context;
          return (
            // @ts-expect-error:
            <Provider context={spec.context} value={this._ctx_values[key]}>
              {prev}
            </Provider>
          );
        }, children)}
      </Preact.Fragment>
    );
  }
}

export const WithContextHooks: Preact.FunctionComponent = ({ children }) => {
  const messages = hooks.useContext(MESSAGES).value;
  const categories = hooks.useContext(MESSAGE_CATEGORIES).value;
  const [uncategorized, set_uncat_msgs] = useContextState(
    UNCATEGORIZED_MESSAGES
  );
  const snippets = hooks.useContext(SNIPPETS).value;
  const sections = hooks.useContext(SNIPPETS_SECTIONS).value;
  const volume = hooks.useContext(VOLUME_CTX).value;
  const editor_state = hooks.useContext(EDITOR_STATE).value;
  const editor_settings = hooks.useContext(EDITOR_SETTINGS).value;
  const help_completed = hooks.useContext(HELP_COMPLETED).value;

  const editor_unsaved = hooks.useContext(EDITOR_UNSAVED).value;
  const [loaded_id, set_loaded_id, loaded_id_ref] = useStateRef(
    INITIAL_STATE?.message ?? null
  );
  const editor_unsaved_ref = useValueRef(editor_unsaved);
  const should_optimize = hooks.useRef<boolean>(false);
  const load_message = hooks.useCallback(
    (id: string | null, force?: boolean, passive?: boolean) => {
      if (id !== null && typeof id !== "string") {
        return false;
      }
      let discard = true;
      if (editor_unsaved_ref.current && force !== true) {
        discard = do_confirm("Are you sure you want to discard your changes?");
      }
      if (discard) {
        should_optimize.current = false;
        const event: TTS.LoadMessageEvent = new CustomEvent("load-message", {
          detail: {
            callback: () => set_loaded_id(id),
            id: id,
            prev_id: loaded_id_ref.current,
            passive,
          },
        });
        window.dispatchEvent(event);
        return true;
      }
      return false;
    },
    []
  );
  const loaded_msg_ctx_value = hooks.useMemo(
    () => new ImmutableContextValue(loaded_id, load_message),
    [load_message, loaded_id]
  );

  const msgs_ref = useValueRef(messages);
  const cats_ref = useValueRef(categories);
  const uncat_ref = useValueRef(uncategorized);
  const set_uncat_messages = hooks.useCallback(
    (uncat: TTS.MessageCategory, new_categories?: TTS.MessageCategory[]) => {
      const new_value = get_uncategorized_messages(
        msgs_ref.current,
        new_categories ?? cats_ref.current,
        uncat
      );
      if (JSON.stringify(new_value) !== JSON.stringify(uncat_ref.current)) {
        set_uncat_msgs(new_value);
      }
    },
    [set_uncat_msgs]
  );
  const uncat_ctx_value = hooks.useMemo(
    () => new ImmutableContextValue(uncategorized, set_uncat_messages),
    [uncategorized, set_uncat_messages]
  );

  useEffect(() => {
    storage.set_stored_state({
      volume,
      message: loaded_id,
      editor: editor_state,
      settings: editor_settings,
    });
  }, [volume, editor_state, loaded_id, editor_settings]);

  useEffect(() => {
    set_uncat_messages(uncat_ref.current);
    storage.set_stored_messages(messages);
  }, [messages]);

  useEffect(() => {
    set_uncat_messages(uncat_ref.current);
    storage.set_stored_message_categories(categories);
  }, [categories]);

  useEffect(() => {
    storage.set_stored_uncategorized_messages(uncategorized);
  }, [uncategorized]);

  useEffect(() => {
    storage.set_stored_snippets(snippets);
  }, [snippets]);

  useEffect(() => {
    storage.set_stored_snippets_sections(sections);
  }, [sections]);

  useEffect(() => {
    storage.set_stored_help(help_completed);
  }, [help_completed]);

  const is_optimized = hooks.useRef(false);
  const get_is_optimized = hooks.useCallback(() => is_optimized.current, []);
  useEffect(() => {
    if (editor_unsaved) {
      should_optimize.current = true;
    } else if (!should_optimize.current) {
      setTimeout(() => {
        should_optimize.current = true;
      }, 1000);
    }
  }, [editor_unsaved]);
  useOptimizeMessage(editor_settings, is_optimized, should_optimize);

  return (
    <UNCATEGORIZED_MESSAGES.Provider value={uncat_ctx_value}>
      <IS_OPTIMIZED.Provider value={get_is_optimized}>
        <LOADED_MESSAGE.Provider value={loaded_msg_ctx_value}>
          {children}
        </LOADED_MESSAGE.Provider>
      </IS_OPTIMIZED.Provider>
    </UNCATEGORIZED_MESSAGES.Provider>
  );
};
