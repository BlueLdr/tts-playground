import * as Preact from "preact";
import { useEffect } from "preact/hooks";
import * as hooks from "preact/hooks";
import * as storage from "~/common/storage";
import { useStateIfMounted, useValueRef } from "~/view/utils";

const createNamedContext = <T extends any>(
  initialValue: T,
  name
): Preact.Context<{ value: T; setValue: hooks.StateUpdater<T> }> => {
  const ctx = Preact.createContext({ value: initialValue, setValue: () => {} });
  ctx.displayName = name;
  return ctx;
};

const CtxProvider = <T extends any>({
  context,
  initialValue,
  children,
}: Preact.RenderableProps<{
  context: Preact.Context<{ value: T; setValue: hooks.StateUpdater<T> }>;
  initialValue: T;
  onUpdate?: (new_value: T) => void;
}>): Preact.VNode | null => {
  const [value, setValue] = useStateIfMounted(initialValue);
  const ctx_value = hooks.useMemo(() => ({ value, setValue }), [value]);
  return <context.Provider value={ctx_value}>{children}</context.Provider>;
};

const stored_settings = storage.get_stored_settings();
const initial_settings: TTS.AppState = {
  volume: stored_settings?.volume ?? 1,
  message: stored_settings?.message ?? -1,
  editor: {
    text: stored_settings?.editor?.text ?? "",
    max_length: stored_settings?.editor?.max_length ?? 255,
    speed: stored_settings?.editor?.speed ?? false,
  },
};

const stored_messages: TTS.Message[] = storage.get_stored_messages() ?? [];
const stored_scratch: TTS.ScratchSection[] = storage.get_stored_scratch() ?? [];

export const VOLUME_CTX = createNamedContext<number>(
  initial_settings.volume,
  "VOLUME_CTX"
);
export const EDITOR_STATE = createNamedContext<TTS.EditorState>(
  initial_settings.editor,
  "EDITOR_UNSAVED"
);

export const LOADED_MESSAGE = createNamedContext<number>(
  initial_settings.message ?? -1,
  "LOADED_MESSAGE"
);

export const EDITOR_UNSAVED = createNamedContext<boolean>(
  true,
  "EDITOR_UNSAVED"
);

export const EDIT_MSG_TARGET = createNamedContext<number | undefined>(
  undefined,
  "EDIT_MSG_TARGET"
);

export const ADD_SNIPPET_CALLBACK = createNamedContext(() => {},
"ADD_SNIPPET_CALLBACK");

export const MESSAGES = createNamedContext<TTS.Message[]>(
  stored_messages,
  "MESSAGES"
);
export const SCRATCH = createNamedContext<TTS.ScratchSection[]>(
  stored_scratch,
  "MESSAGES"
);

const all_contexts = [
  [VOLUME_CTX, initial_settings.volume],
  [EDITOR_STATE, initial_settings.editor],
  [EDITOR_UNSAVED, true],
  [EDIT_MSG_TARGET, undefined],
  [ADD_SNIPPET_CALLBACK, () => {}],
  [MESSAGES, stored_messages],
  [SCRATCH, stored_scratch],
] as const;

export const WithGlobalContexts: Preact.FunctionComponent = ({ children }) => {
  return (
    <Preact.Fragment>
      {all_contexts.reduce(
        (prev, [ctx, value]) => (
          <CtxProvider context={ctx} initialValue={value}>
            {prev}
          </CtxProvider>
        ),
        children
      )}
    </Preact.Fragment>
  );
};

export const WithContextHooks: Preact.FunctionComponent = ({ children }) => {
  const messages = hooks.useContext(MESSAGES).value;
  const scratch = hooks.useContext(SCRATCH).value;
  const volume = hooks.useContext(VOLUME_CTX).value;
  const editor_state = hooks.useContext(EDITOR_STATE).value;

  const editor_unsaved = hooks.useContext(EDITOR_UNSAVED).value;
  const [loaded_message, set_loaded_message] = useStateIfMounted(
    initial_settings?.message ?? -1
  );
  const editor_unsaved_ref = useValueRef(editor_unsaved);
  const load_message = hooks.useCallback((index) => {
    if (index == null) {
      return;
    }
    let discard = true;
    if (editor_unsaved_ref.current) {
      discard = confirm("Are you sure you want to discard your changes?");
    }
    if (discard) {
      set_loaded_message(index);
    }
  }, []);
  const ctx_value = hooks.useMemo(
    () => ({ value: loaded_message, setValue: load_message }),
    [load_message, loaded_message]
  );

  useEffect(() => {
    storage.set_stored_settings({
      volume,
      message: loaded_message,
      editor: editor_state,
    });
  }, [volume, editor_state, loaded_message]);

  useEffect(() => {
    storage.set_stored_messages(messages);
  }, [messages]);

  useEffect(() => {
    storage.set_stored_scratch(scratch);
  }, [scratch]);

  return (
    <LOADED_MESSAGE.Provider value={ctx_value}>
      {children}
    </LOADED_MESSAGE.Provider>
  );
};
