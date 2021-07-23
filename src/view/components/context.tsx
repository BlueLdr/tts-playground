import * as Preact from "preact";
import { PureComponent } from "preact/compat";
import * as hooks from "preact/hooks";
import { useEffect } from "preact/hooks";
import * as storage from "~/common";
import {
  ADD_SNIPPET_CALLBACK,
  EDIT_MSG_TARGET,
  EDITOR_SETTINGS,
  EDITOR_STATE,
  EDITOR_UNSAVED,
  ImmutableContextValue,
  INITIAL_STATE,
  IS_OPTIMIZED,
  LOADED_MESSAGE,
  MESSAGES,
  OPTIMIZE_MESSAGE_CALLBACK,
  SNIPPETS,
  VOLUME_CTX,
} from "~/model";
import {
  useOptimizeMessage,
  useStateIfMounted,
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
  SNIPPETS: {
    context: SNIPPETS,
    initialValue: INITIAL_STATE.snippets,
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
  const snippets = hooks.useContext(SNIPPETS).value;
  const volume = hooks.useContext(VOLUME_CTX).value;
  const editor_state = hooks.useContext(EDITOR_STATE).value;
  const editor_settings = hooks.useContext(EDITOR_SETTINGS).value;

  const editor_unsaved = hooks.useContext(EDITOR_UNSAVED).value;
  const [loaded_message, set_loaded_message] = useStateIfMounted(
    INITIAL_STATE?.message ?? -1
  );
  const editor_unsaved_ref = useValueRef(editor_unsaved);
  const should_optimize = hooks.useRef<boolean>(false);
  const load_message = hooks.useCallback((index: number, force?: boolean) => {
    if (index == null) {
      return false;
    }
    let discard = true;
    if (editor_unsaved_ref.current && force !== true) {
      discard = confirm("Are you sure you want to discard your changes?");
    }
    if (discard) {
      should_optimize.current = false;
      set_loaded_message(index);
      return true;
    }
    return false;
  }, []);
  const ctx_value = hooks.useMemo(
    () => new ImmutableContextValue(loaded_message, load_message),
    [load_message, loaded_message]
  );

  useEffect(() => {
    storage.set_stored_state({
      volume,
      message: loaded_message,
      editor: editor_state,
      settings: editor_settings,
    });
  }, [volume, editor_state, loaded_message, editor_settings]);

  useEffect(() => {
    storage.set_stored_messages(messages);
  }, [messages]);

  useEffect(() => {
    storage.set_stored_snippets(snippets);
  }, [snippets]);

  const is_optimized = hooks.useRef(false);
  const get_is_optimized = hooks.useCallback(() => is_optimized.current, []);
  useEffect(() => {
    if (editor_unsaved) {
      should_optimize.current = true;
    }
  }, [editor_unsaved]);
  useOptimizeMessage(editor_settings, is_optimized, should_optimize);

  return (
    <IS_OPTIMIZED.Provider value={get_is_optimized}>
      <LOADED_MESSAGE.Provider value={ctx_value}>
        {children}
      </LOADED_MESSAGE.Provider>
    </IS_OPTIMIZED.Provider>
  );
};
