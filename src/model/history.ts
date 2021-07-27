import {
  deep_equals,
  DEFAULT_HISTORY_STEPS_LIMIT,
  get_stored_state,
} from "~/common";
import { conform_to_schema, HISTORY_STORAGE_SCHEMA } from "./schema";

const LOCAL_STORAGE_HISTORY_KEY = "tts-history";

export class EditorHistoryManager {
  constructor(limit: number, history?: TTS.EditorHistory[], index?: number) {
    this.history = history ?? [];
    this.index = index ?? -1;
    this.initialized = false;
    this.limit = limit;
    this.loaded = !!history;
  }

  private history: TTS.EditorHistory[];
  private index: number;
  private initialized: boolean;
  private loaded: boolean;
  private limit: number;

  private setHistory(new_history: TTS.EditorHistory[]) {
    this.history = new_history;
    this.storeHistory();
  }
  private setIndex(new_index: number) {
    this.index = new_index;
    this.storeHistory();
  }
  private storeHistory() {
    localStorage.setItem(
      LOCAL_STORAGE_HISTORY_KEY,
      JSON.stringify({
        data: this.history,
        index: this.index,
      })
    );
  }

  private _on_change: (
    new_state: TTS.EditorHistory,
    use_cursor_before: boolean
  ) => void = () => {};

  public initialize(
    initial: TTS.EditorHistory,
    on_change: (
      new_state: TTS.EditorHistory,
      use_cursor_before: boolean
    ) => void
  ) {
    if (this.initialized) {
      console.warn(`Attempted to re-initialize EditorHistoryManager`);
      return;
    }
    if (!this.loaded) {
      this.reset(initial);
    }
    this._on_change = on_change;
    this.initialized = true;
  }

  public getCurrentState() {
    return this.history[this.index];
  }

  public reset(initial: TTS.EditorHistory) {
    this.index = 0;
    this.setHistory([{ ...initial, keep: true }]);
  }

  public push(
    state: TTS.EditorHistory,
    replace:
      | boolean
      | ((old_: TTS.EditorHistory, new_: TTS.EditorHistory) => boolean) = false
  ) {
    const { keep: _, ...new_state } = state;
    const { keep, ...cur } = this.getCurrentState();
    if (typeof replace === "function") {
      replace = replace(cur, new_state);
    }
    if (deep_equals(cur, new_state)) {
      return;
    }

    if (replace) {
      const { keep: __, ...prev } = this.history[this.index - 1] ?? {};
      if (keep || deep_equals(prev, new_state)) {
        replace = false;
      }
    }
    const drop = Math.max(
      this.history.length - this.limit + (replace ? 0 : 1),
      0
    );
    this.setHistory(
      this.history
        .slice(drop, this.index + (replace ? 0 : 1))
        .concat({ ...state, keep: state.keep ?? false })
    );
    this.setIndex(this.history.length - 1);
  }

  public undo() {
    const prev_state = this.getCurrentState();
    if (this.index <= 0) {
      console.warn(`Cannot undo, reached start of history.`);
      return prev_state;
    }
    this.setIndex(this.index - 1);
    const new_state = this.getCurrentState();
    this._on_change(
      { ...new_state, cursor_before: prev_state.cursor_before },
      true
    );
    return new_state;
  }

  public redo() {
    if (this.index >= this.history.length - 1) {
      console.warn(`Cannot redo, reached end of history.`);
      return this.getCurrentState();
    }
    this.setIndex(this.index + 1);
    const new_state = this.getCurrentState();
    this._on_change(new_state, false);
    return new_state;
  }

  public keep() {
    this.history[this.index].keep = true;
    this.setHistory(this.history);
  }
}

const create_history_manager = () => {
  const limit =
    get_stored_state()?.settings?.history_steps ?? DEFAULT_HISTORY_STEPS_LIMIT;
  const stored = JSON.parse(
    localStorage.getItem(LOCAL_STORAGE_HISTORY_KEY) ?? "null"
  );
  const conformed = stored
    ? conform_to_schema(stored, HISTORY_STORAGE_SCHEMA)
    : null;
  if (conformed && conformed.data.length === stored.data.length) {
    return new EditorHistoryManager(limit, conformed.data, conformed.index);
  }
  return new EditorHistoryManager(limit);
};
export const EditorHistory = create_history_manager();
