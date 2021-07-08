import * as Preact from "preact";
import * as hooks from "preact/hooks";
import * as storage from "~/common/storage";

export const createNamedContext = <T extends any>(
  initialValue: T,
  name
): Preact.Context<ImmutableContextValue<T>> => {
  const ctx = Preact.createContext(
    new ImmutableContextValue(initialValue, () => {})
  );
  ctx.displayName = name;
  return ctx;
};

export class ImmutableContextValue<T extends any, S = hooks.StateUpdater<T>> {
  constructor(value: T, setValue: S) {
    this._value = value;
    this._setValue = setValue;
  }
  private _value: T;
  private _setValue: S;
  get value() {
    return this._value;
  }
  get setValue() {
    return this._setValue;
  }
  set value(val) {}
  set setValue(val) {}
}

const stored_state = storage.get_stored_state();
const initial_state: TTS.AppState = {
  volume: stored_state?.volume ?? 1,
  message: stored_state?.message ?? -1,
  settings: stored_state?.settings ?? {
    open: stored_state?.settings?.open ?? false,
    insert_at_cursor: stored_state?.settings?.insert_at_cursor ?? false,
  },
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
  "EDITOR_STATE"
);

export const LOADED_MESSAGE = createNamedContext<number>(
  initial_state.message ?? -1,
  "LOADED_MESSAGE"
) as Preact.Context<
  ImmutableContextValue<number, (index: number, force?: boolean) => boolean>
>;

export const EDITOR_UNSAVED = createNamedContext<boolean>(
  true,
  "EDITOR_UNSAVED"
);

export const EDIT_MSG_TARGET = createNamedContext<number | undefined>(
  undefined,
  "EDIT_MSG_TARGET"
);

export const ADD_SNIPPET_CALLBACK = createNamedContext<
  (value: string, flag?: "start" | "end") => void
>(() => {}, "ADD_SNIPPET_CALLBACK");

export const EDITOR_SETTINGS = createNamedContext<TTS.EditorSettings>(
  initial_state.settings,
  "EDITOR_SETTINGS"
);

export const MESSAGES = createNamedContext<TTS.Message[]>(
  stored_messages,
  "MESSAGES"
);
export const SCRATCH = createNamedContext<TTS.ScratchSection[]>(
  stored_scratch,
  "SCRATCH"
);
