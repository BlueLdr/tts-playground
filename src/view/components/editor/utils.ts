import * as hooks from "preact/hooks";
import { useCallback, useEffect, useMemo, useRef } from "preact/hooks";
import { EDITOR_STATE, EditorHistory } from "~/model";
import { useStateRef, useValueRef } from "~/view/utils";

const TERMINATION_CHARS = /[ \-*&!@.,;':+=]/;
type TextAction = "type" | "backspace" | "delete" | "replace" | "snippet";

export const useHistoryListeners = (
  input_ref: preact.RefObject<HTMLTextAreaElement>
) => {
  const editor_state = hooks.useContext(EDITOR_STATE).value;
  const state_ref = useValueRef(editor_state);
  const { max_length, speed, bits, speed_char } = editor_state;

  const prev_cursor_pos = useRef(input_ref.current?.selectionStart ?? -1);
  const prev_action = useRef<TextAction | undefined>();
  const last_prop_changed = useRef<
    "max_length" | "speed" | "bits" | "text" | "speed_char" | undefined
  >();

  const get_current_cursor = useCallback(
    (elem: HTMLTextAreaElement) => ({
      start: elem?.selectionStart,
      end: elem?.selectionEnd,
    }),
    []
  );
  const cursor_start = useRef(get_current_cursor(input_ref.current));

  const first_render = useRef(true);
  useEffect(() => {
    if (first_render.current) {
      first_render.current = false;
      return;
    }
    const state = EditorHistory.getCurrentState()?.state;
    if (!state) {
      return;
    }
    const changed = Object.entries({
      max_length: max_length !== state.max_length,
      speed: speed !== state.speed,
      bits: bits !== state.bits,
      speed_char: speed_char !== state.speed_char,
    })
      .filter(([, v]) => !!v)
      .map(([prop]) => prop);
    if (changed.length === 0) {
      return;
    }
    EditorHistory.push(
      {
        state: state_ref.current,
        cursor: get_current_cursor(input_ref.current),
      },
      changed.length === 1 && changed[0] === last_prop_changed.current
    );
    // @ts-expect-error:
    last_prop_changed.current = changed.length > 1 ? undefined : changed[0];
    prev_action.current = undefined;
  }, [max_length, speed, bits, speed_char]);

  const onChange = useCallback(e => {
    let action: TextAction,
      edge_char,
      pos_changed = false;
    const cursor = e.target.selectionStart;
    const before = state_ref.current.text;
    const after = e.target.value;
    if (before === after) {
      prev_cursor_pos.current = cursor;
      return;
    }

    const before_pre = before.slice(0, prev_cursor_pos.current);
    const after_pre = after.slice(0, cursor);
    const before_post = before.slice(prev_cursor_pos.current);
    const after_post = after.slice(cursor);

    const new_state: TTS.EditorHistory = {
      state: {
        ...state_ref.current,
        text: after,
      },
      cursor: {
        start: cursor,
        end: e.target.selectionEnd,
      },
    };

    if (before_pre === after_pre) {
      edge_char = after_post[0];
      action = "delete";
      pos_changed = cursor !== prev_cursor_pos.current;
    } else if (before_post !== after_post) {
      action = "replace";
      pos_changed = true;
    } else {
      action = before_pre.length > after_pre.length ? "backspace" : "type";
      edge_char = after_pre.slice(-1);
      pos_changed =
        cursor - prev_cursor_pos.current !== (action === "backspace" ? -1 : 1);
    }

    const action_changed = action !== prev_action.current;
    const replace = !(
      pos_changed ||
      action_changed ||
      TERMINATION_CHARS.test(edge_char)
    );

    const { cursor_before: old_cursor_before, cursor: old_cursor } =
      EditorHistory.getCurrentState();
    let cursor_before = replace ? old_cursor_before : cursor_start.current;
    if (
      !cursor_start.current ||
      cursor_start.current.start == null ||
      cursor_start.current.end == null
    ) {
      cursor_before = old_cursor;
    }
    EditorHistory.push({ ...new_state, cursor_before }, replace);

    prev_cursor_pos.current = cursor;
    prev_action.current = action;
    last_prop_changed.current = "text";
  }, []);

  const update_cursor_pos = useCallback(e => {
    cursor_start.current = get_current_cursor(e.target);
  }, []);

  const insert_held = useRef(false);
  const snippet_ended = useRef(false);
  const on_add_snippet = useCallback(
    (new_text: string, flag?: "start" | "end") => {
      if (new_text === state_ref.current.text && flag !== "end") {
        prev_cursor_pos.current = input_ref.current.selectionStart;
        return;
      }

      if (flag === "start") {
        insert_held.current = true;
      } else if (flag === "end") {
        if (new_text === state_ref.current.text) {
          EditorHistory.push({
            keep: true,
            state: { ...state_ref.current },
            cursor: {
              start: input_ref.current.selectionStart,
              end: input_ref.current.selectionEnd,
            },
          });
        } else {
          insert_held.current = false;
          snippet_ended.current = true;
        }
      }
      last_prop_changed.current = "text";
      prev_action.current = "snippet";
    },
    []
  );

  useEffect(() => {
    if (
      prev_action.current !== "snippet" ||
      insert_held.current ||
      !snippet_ended.current
    ) {
      return;
    }
    snippet_ended.current = false;
    EditorHistory.push({
      state: { ...state_ref.current },
      cursor: {
        start: input_ref.current.selectionStart,
        end: input_ref.current.selectionEnd,
      },
      keep: true,
    });
  }, [editor_state.text]);

  return [
    useMemo<EventListenersOf<HTMLTextAreaElement>>(
      () => ({
        onChange,
        onKeyDown: update_cursor_pos,
        onKeyUp: update_cursor_pos,
        onClick: update_cursor_pos,
        onSelect: update_cursor_pos,
        onMouseUp: update_cursor_pos,
      }),
      [onChange, update_cursor_pos]
    ),
    on_add_snippet,
  ] as const;
};

const ctrl_z_listener = e => {
  if (
    (e.key === "z" || e.key === "Z") &&
    (e.ctrlKey || e.metaKey) &&
    !e.altKey
  ) {
    e.preventDefault();
    if (e.shiftKey) {
      EditorHistory.redo();
    } else {
      EditorHistory.undo();
    }
  }
};

export const useCtrlZListener = (
  modal_container: preact.RefObject<HTMLDivElement>
) => {
  const [enabled, set_enabled, enabled_ref] = useStateRef<boolean>(true);
  useEffect(() => {
    if (modal_container.current) {
      const observer = new MutationObserver(e => {
        const enable = (e[0].target as HTMLDivElement)?.childElementCount === 0;
        if (enable !== enabled_ref.current) {
          set_enabled(enable);
        }
      });
      observer.observe(modal_container.current, { childList: true });
      return () => {
        observer.disconnect();
      };
    }
  }, [modal_container.current]);
  useEffect(() => {
    if (enabled) {
      window.addEventListener("keydown", ctrl_z_listener);
    }
    return () => {
      if (!enabled_ref.current) {
        window.removeEventListener("keydown", ctrl_z_listener);
      }
    };
  }, [enabled]);
};
