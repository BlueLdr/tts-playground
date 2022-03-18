import * as Preact from "preact";
import { useCallback, useContext, useRef } from "preact/hooks";
import { ADD_SNIPPET_CALLBACK } from "~/model";
import { Snippet, SnippetsRowControls } from "~/view/components";
import { useHoldClick, useStateIfMounted, useValueRef } from "~/view/utils";

interface SnippetsRowProps {
  row: TTS.Snippet;
  // updateRow: (row: TTS.Snippet) => void;
  onClickDelete: (id: string) => void;
  onClickEdit: (id: string) => void;
  previewText: (snippet: TTS.Snippet, count?: number) => Promise<void>;
  buttons?: Preact.ComponentChildren | null;
}

const SnippetsRowBase: Preact.FunctionComponent<
  SnippetsRowProps & {
    addToMessage: (text: string, flag?: "start" | "end") => void;
  }
> = ({
  row,
  onClickDelete,
  onClickEdit,
  previewText,
  buttons,
  addToMessage,
}) => {
  const [edit, set_edit] = useStateIfMounted(!row.text);
  const is_right_click = useRef(false);
  const options_ref = useValueRef(row?.options);

  const on_click_edit = useCallback(
    () => onClickEdit(row.id),
    [onClickEdit, row.id]
  );
  const on_click_delete = useCallback(
    () => onClickDelete(row.id),
    [onClickDelete, row.id]
  );

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
        {buttons || (
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
        )}
        <div className="tts-snippets-row-text" data-help="snippet-text">
          <Snippet data={row} />
        </div>
      </div>
      {!buttons && (
        <SnippetsRowControls
          row={row}
          open={edit}
          setOpen={set_edit}
          onClickEdit={on_click_edit}
          onClickDelete={on_click_delete}
          previewText={previewText}
        />
      )}
    </li>
  );
};

export const SnippetsRow: Preact.FunctionComponent<
  SnippetsRowProps & {
    addToMessage?: (text: string, flag?: "start" | "end") => void;
  }
> = ({ addToMessage, ...props }) => {
  const ctxAddToMessage = useContext(ADD_SNIPPET_CALLBACK).value;
  return (
    <SnippetsRowBase
      addToMessage={addToMessage || ctxAddToMessage}
      {...props}
    />
  );
};
