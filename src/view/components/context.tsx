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

const stored_state = storage.get_stored_state();
const initial_state: TTS.AppState = {
  volume: stored_state?.volume ?? 1,
  message: stored_state?.message ?? -1,
  editor: {
    text: stored_state?.editor?.text ?? "",
    max_length: stored_state?.editor?.max_length ?? 255,
    speed: stored_state?.editor?.speed ?? false,
  },
};

const stored_messages: TTS.Message[] = storage.get_stored_messages() ?? [];
const stored_scratch: TTS.ScratchSection[] = storage.get_stored_scratch() ?? [];

export const VOLUME_CTX = createNamedContext<number>(
  initial_state.volume,
  "VOLUME_CTX"
);
export const EDITOR_STATE = createNamedContext<TTS.EditorState>(
  initial_state.editor,
  "EDITOR_UNSAVED"
);

export const LOADED_MESSAGE = createNamedContext<number>(
  initial_state.message ?? -1,
  "LOADED_MESSAGE"
) as Preact.Context<{
  value: number;
  setValue: (index: number, force?: boolean) => boolean;
}>;

export const EDITOR_UNSAVED = createNamedContext<boolean>(
  true,
  "EDITOR_UNSAVED"
);

export const EDIT_MSG_TARGET = createNamedContext<number | undefined>(
  undefined,
  "EDIT_MSG_TARGET"
);

export const ADD_SNIPPET_CALLBACK = createNamedContext<(value: string) => void>(
  () => {},
  "ADD_SNIPPET_CALLBACK"
);

export const MESSAGES = createNamedContext<TTS.Message[]>(
  stored_messages,
  "MESSAGES"
);
export const SCRATCH = createNamedContext<TTS.ScratchSection[]>(
  stored_scratch,
  "MESSAGES"
);

const all_contexts = [
  [VOLUME_CTX, initial_state.volume],
  [EDITOR_STATE, initial_state.editor],
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
    initial_state?.message ?? -1
  );
  const editor_unsaved_ref = useValueRef(editor_unsaved);
  const load_message = hooks.useCallback((index: number, force?: boolean) => {
    if (index == null) {
      return false;
    }
    let discard = true;
    if (editor_unsaved_ref.current && force !== true) {
      discard = confirm("Are you sure you want to discard your changes?");
    }
    if (discard) {
      set_loaded_message(index);
      return true;
    }
    return false;
  }, []);
  const ctx_value = hooks.useMemo(
    () => ({ value: loaded_message, setValue: load_message }),
    [load_message, loaded_message]
  );

  useEffect(() => {
    storage.set_stored_state({
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
