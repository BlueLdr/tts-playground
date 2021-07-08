import * as Preact from "preact";
import { useCallback, useContext, useRef } from "preact/hooks";
import { ADD_SNIPPET_CALLBACK, ScratchRowControls } from "~/view/components";
import { useHoldClick, useStateIfMounted, useValueRef } from "~/view/utils";

export const ScratchRow: Preact.FunctionComponent<{
  row: TTS.Snippet;
  updateRow: (row: TTS.Snippet) => void;
  onClickDelete: () => void;
  onClickEdit: () => void;
  previewText: (snippet: TTS.Snippet, count?: number) => Promise<void>;
}> = ({ row, updateRow, onClickDelete, onClickEdit, previewText }) => {
  const addToMessage = useContext(ADD_SNIPPET_CALLBACK).value;
  const [edit, set_edit] = useStateIfMounted(!row.text);
  const [count, set_count] = useStateIfMounted(row.options?.default_count || 1);
  const is_right_click = useRef(false);
  const options_ref = useValueRef(row?.options);

  // TODO: space before/after not working right
  const add_to_message = useCallback(
    (e) => {
      const {
        text = "",
        options: { prefix, space_before, default_count },
      } = row;
      if (e?.button === 2) {
        e.preventDefault();
        is_right_click.current = true;
        addToMessage(text, e?.initialClick ? "start" : undefined);
      } else if (!e?.initialClick) {
        addToMessage(text);
      } else {
        let msg = prefix ? prefix : "";
        addToMessage(
          `${space_before ? " " : ""}${msg}${text.repeat(
            count || default_count || 1
          )}`,
          "start"
        );
      }
    },
    [addToMessage, count, row]
  );

  const on_end_hold = useCallback(() => {
    if (!is_right_click.current && options_ref.current?.space_after) {
      addToMessage(" ", "end");
    } else {
      addToMessage("", "end");
    }
    is_right_click.current = false;
    document.getElementById("tts-editor-input")?.focus();
  }, [addToMessage]);

  const add_listeners = useHoldClick(add_to_message, on_end_hold, 100);

  return (
    <li className="tts-scratch-row" data-edit={`${edit}`}>
      <div className="tts-scratch-row-left">
        <button
          type="button"
          className="icon-button tts-scratch-row-control tts-scratch-row-control-add"
          title="Add to message"
          {...add_listeners}
          onContextMenu={(e) => e.preventDefault()}
        >
          <i className="fas fa-plus" />
        </button>
        <div className="tts-scratch-row-text">
          {row.options?.prefix ? (
            <span className="tts-scratch-row-text-prefix">
              {row.options.prefix}
            </span>
          ) : null}
          {row.text ?? " "}
        </div>
      </div>
      <ScratchRowControls
        row={row}
        open={edit}
        setOpen={set_edit}
        onClickEdit={onClickEdit}
        onClickDelete={onClickDelete}
        previewText={previewText}
      />
    </li>
  );
};
