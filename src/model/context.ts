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

export const LOADED_MESSAGE = createNamedContext<number>(
  INITIAL_STATE.message ?? -1,
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

export const OPTIMIZE_MESSAGE_CALLBACK = createNamedContext<
  (trigger: OptimizeTrigger) => void
>(() => {}, "OPTIMIZE_MESSAGE_CALLBACK");

export const EDITOR_SETTINGS = createNamedContext<TTS.EditorSettings>(
  INITIAL_STATE.settings,
  "EDITOR_SETTINGS"
);

export const MESSAGES = createNamedContext<TTS.Message[]>(
  INITIAL_STATE.messages,
  "MESSAGES"
);
export const SNIPPETS = createNamedContext<TTS.SnippetsSection[]>(
  INITIAL_STATE.snippets,
  "SNIPPETS"
);

export const IS_OPTIMIZED = Preact.createContext<() => boolean>(() => false);
IS_OPTIMIZED.displayName = "IS_OPTIMIZED";

export const HELP_ITEM = createNamedContext<TTS.HelpItem | null>(
  null,
  "HELP_ITEM"
);
