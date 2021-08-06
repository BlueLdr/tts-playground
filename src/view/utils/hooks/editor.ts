import * as hooks from "preact/hooks";
import { deep_equals, do_alert } from "~/common";
import {
  EDITOR_STATE,
  EDITOR_UNSAVED,
  LOADED_MESSAGE,
  MESSAGES,
} from "~/model";
import {
  insert_text_at_selection,
  useContextState,
  useValueRef,
} from "~/view/utils";

export const useInsertSnippet = (
  text: string,
  max_length: number,
  input_ref: preact.RefObject<HTMLTextAreaElement>
) => {
  const text_ref = useValueRef(text);
  const length_ref = useValueRef(max_length);
  const cursor_pos = hooks.useRef(-1);
  const reset_pos = hooks.useRef(false);

  const insert_snippet = hooks.useCallback(
    (value: string, flag?: "start" | "end") => {
      if (!flag && cursor_pos.current !== -1) {
        input_ref.current.selectionStart = cursor_pos.current;
        input_ref.current.selectionEnd = cursor_pos.current;
      }
      const [new_text, new_index] = insert_text_at_selection(
        text_ref.current,
        value,
        length_ref.current,
        input_ref
      );
      cursor_pos.current = new_index;

      if (flag === "end") {
        if (new_text === text_ref.current) {
          cursor_pos.current = -1;
        } else {
          reset_pos.current = true;
        }
      }
      if (new_text === text_ref.current) {
        input_ref.current?.focus();
      }
      return new_text;
    },
    []
  );

  hooks.useEffect(() => {
    if (cursor_pos.current !== -1) {
      input_ref.current?.focus();
      input_ref.current.selectionStart = cursor_pos.current;
      input_ref.current.selectionEnd = cursor_pos.current;
      cursor_pos.current = -1;
    }
    if (reset_pos.current) {
      cursor_pos.current = -1;
      reset_pos.current = false;
    }
  }, [text]);

  return insert_snippet;
};

export const useLoadedMessage = (messages: TTS.Message[]) => {
  const [loaded_id, set_loaded_id] = useContextState(LOADED_MESSAGE);
  const loaded = hooks.useMemo(
    () => messages.find(m => m.id === loaded_id) ?? null,
    [messages, loaded_id]
  );
  return [loaded as TTS.Message | null, loaded_id, set_loaded_id] as const;
};

export const useSaveMessage = () => {
  const [messages, set_messages] = useContextState(MESSAGES);
  const [loaded_message, loaded_id, set_loaded_id] = useLoadedMessage(messages);
  hooks.useEffect(() => {
    console.log(`loaded_id`, loaded_id);
  }, [loaded_id]);

  hooks.useEffect(() => {
    console.log(`loaded_message`, loaded_message);
  }, [loaded_message]);
  const {
    value: { text, speed, max_length, bits },
  } = hooks.useContext(EDITOR_STATE);
  const [is_unsaved, set_unsaved] = useContextState(EDITOR_UNSAVED);

  const new_is_unsaved = hooks.useMemo(() => {
    return !loaded_message
      ? !!text
      : loaded_message.text !== text ||
          loaded_message.options?.speed !== speed ||
          loaded_message.options?.bits !== bits ||
          loaded_message.options?.max_length !== max_length;
  }, [loaded_message, text, speed, max_length, bits]);

  hooks.useEffect(() => {
    set_unsaved(new_is_unsaved);
  }, [new_is_unsaved]);

  const load_when_unsaved_reset = hooks.useRef<string | null>(null);
  const messages_ref = useValueRef(messages);
  const loaded_ref = useValueRef(loaded_id);
  const update_messages = hooks.useCallback(
    (id: string | null, value: TTS.Message | undefined): boolean => {
      if (value && !value.id) {
        do_alert("couldn't save due to missing id");
        console.error("couldn't save due to missing id");
        return false;
      }
      if (id && value && value.id !== id) {
        do_alert("couldn't save due to mismatched ids");
        console.error("couldn't save due to mismatched ids");
        return false;
      }
      const msgs = messages_ref.current ?? [];
      const same_name = msgs.find(m => m.name === value?.name);
      if (same_name && same_name.id !== id) {
        do_alert("A message with this name already exists.");
        return false;
      }
      const this_index = msgs.findIndex(m => m.id === id);

      const data = msgs?.slice();
      const prev_msg = data.find(m => m.id === loaded_ref.current);
      data[this_index === -1 ? messages_ref.current.length : this_index] =
        value;
      const new_messages = data.filter(r => !!r);
      set_messages(new_messages);
      if (id === loaded_ref.current) {
        if (!value) {
          load_when_unsaved_reset.current = null;
        } else if (!id) {
          load_when_unsaved_reset.current = value.id;
        } else if (
          // if renaming current message, could be unsaved changes in editor, so passive update
          deep_equals(value, { ...(prev_msg ?? {}), name: value.name })
        ) {
          set_loaded_id(id, true, true);
          return true;
        }
        set_unsaved(!value);
        // create a new message
      } else if (!id) {
        load_when_unsaved_reset.current = value.id;
        set_unsaved(!value);
      }

      return true;
    },
    []
  );

  hooks.useEffect(() => {
    const new_index = load_when_unsaved_reset.current;
    if (new_index != null && !is_unsaved) {
      set_loaded_id(new_index, false, true);
      load_when_unsaved_reset.current = null;
    }
  }, [is_unsaved]);

  hooks.useEffect(() => {
    if (
      typeof loaded_id === "string" &&
      loaded_id.length > 0 &&
      messages.findIndex(m => m.id === loaded_id) < 0
    ) {
      set_loaded_id(null, true, true);
    }
  }, [loaded_id, messages]);

  return [loaded_message, update_messages] as const;
};
