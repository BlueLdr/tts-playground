import * as Preact from "preact";
import { useCallback, useRef } from "preact/hooks";
import { Snippet, SnippetsRowControls } from "~/view/components";
import { useHoldClick, useStateIfMounted, useValueRef } from "~/view/utils";

export const SnippetsRow: Preact.FunctionComponent<{
  row: TTS.Snippet;
  updateRow: (row: TTS.Snippet) => void;
  onClickDelete: () => void;
  onClickEdit: () => void;
  previewText: (snippet: TTS.Snippet, count?: number) => Promise<void>;
  addToMessage: (text: string, flag?: "start" | "end") => void;
}> = ({
  row,
  updateRow,
  onClickDelete,
  onClickEdit,
  previewText,
  addToMessage,
}) => {
  const [edit, set_edit] = useStateIfMounted(!row.text);
  const is_right_click = useRef(false);
  const options_ref = useValueRef(row?.options);

  const add_to_message = useCallback(
    e => {
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
          `${space_before ? " " : ""}${msg}${text.repeat(default_count || 1)}`,
          "start"
        );
      }
    },
    [addToMessage, row]
  );

  const on_end_hold = useCallback(() => {
    const { space_after, suffix = "" } = options_ref.current ?? {};
    if (!is_right_click.current && (suffix || space_after)) {
      addToMessage(`${suffix}${space_after ? " " : ""}`, "end");
    } else {
      addToMessage("", "end");
    }
    is_right_click.current = false;
    document.getElementById("tts-editor-input")?.focus();
  }, [addToMessage]);

  const add_listeners = useHoldClick(add_to_message, on_end_hold, 100);

  return (
    <li className="tts-snippets-row" data-edit={`${edit}`}>
      <div className="tts-snippets-row-left">
        <button
          type="button"
          className="icon-button tts-snippets-row-control tts-snippets-row-control-add"
          title="Add to message"
          {...add_listeners}
          onContextMenu={e => e.preventDefault()}
          data-help="snippet-insert"
        >
          <i className="fas fa-plus" />
        </button>
        <div className="tts-snippets-row-text" data-help="snippet-text">
          <Snippet data={row} />
        </div>
      </div>
      <SnippetsRowControls
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
