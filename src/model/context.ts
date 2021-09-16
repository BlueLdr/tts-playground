import * as Preact from "preact";
import * as hooks from "preact/hooks";
import { INITIAL_STATE } from "~/model/initial-state";
import { OptimizeTrigger } from "~/model/types";

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

export const VOLUME_CTX = createNamedContext<number>(
  INITIAL_STATE.volume,
  "VOLUME_CTX"
);
export const EDITOR_STATE = createNamedContext<TTS.EditorState>(
  INITIAL_STATE.editor,
  "EDITOR_STATE"
);

export const LOADED_MESSAGE = createNamedContext<string | null>(
  INITIAL_STATE.message ?? null,
  "LOADED_MESSAGE"
) as Preact.Context<
  ImmutableContextValue<
    string | null,
    (index: string | null, force?: boolean, passive?: boolean) => boolean
  >
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

export const OPTIMIZE_MESSAGE_CALLBACK = createNamedContext<
  (trigger: OptimizeTrigger, refocus?: HTMLElement) => void
>(() => {}, "OPTIMIZE_MESSAGE_CALLBACK");

export const EDITOR_SETTINGS = createNamedContext<TTS.EditorSettings>(
  INITIAL_STATE.settings,
  "EDITOR_SETTINGS"
);

export const MESSAGES = createNamedContext<TTS.Message[]>(
  INITIAL_STATE.messages,
  "MESSAGES"
);

export const MESSAGE_CATEGORIES = createNamedContext<TTS.MessageCategory[]>(
  INITIAL_STATE.message_categories,
  "MESSAGE_CATEGORIES"
);

export const UNCATEGORIZED_MESSAGES = createNamedContext<TTS.MessageCategory>(
  INITIAL_STATE.uncategorized_msgs,
  "UNCATEGORIZED_MESSAGES"
) as Preact.Context<
  ImmutableContextValue<
    TTS.MessageCategory,
    (uncat: TTS.MessageCategory, new_categories?: TTS.MessageCategory[]) => void
  >
>;
export const SNIPPETS = createNamedContext<TTS.SnippetsSection[]>(
  INITIAL_STATE.snippets,
  "SNIPPETS"
);

export const IS_OPTIMIZED = Preact.createContext<() => boolean>(() => false);
IS_OPTIMIZED.displayName = "IS_OPTIMIZED";

export const HELP_ITEM = createNamedContext<TTS.HelpKey | null>(
  null,
  "HELP_ITEM"
);

export const HELP_COMPLETED = createNamedContext<TTS.HelpCompletedMap>(
  INITIAL_STATE.help,
  "HELP_COMPLETED"
);
