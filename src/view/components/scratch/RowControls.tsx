import * as Preact from "preact";
import { useCallback, useEffect } from "preact/hooks";
import { useCopyToClipboard, useRequestStatus } from "~/view/utils";

const listener_opts = { once: true };
export const ScratchRowControls: Preact.FunctionComponent<{
  row: TTS.Snippet;
  open: boolean;
  setOpen: (value: boolean) => void;
  onClickEdit: () => void;
  onClickDelete: () => void;
  previewText: (snippet: TTS.Snippet, count?: number) => Promise<void>;
}> = ({ row, open, setOpen, onClickEdit, onClickDelete, previewText }) => {
  const {
    text,
    options: { prefix = "", default_count, suffix = "" },
  } = row;
  const [status, fetch_tts] = useRequestStatus(previewText);
  useEffect(() => {
    if (open) {
      const listener = () => {
        setTimeout(() => setOpen(false), 50);
      };
      window.addEventListener("mouseup", listener, listener_opts);
      return () => {
        // @ts-expect-error:
        window.removeEventListener("mouseup", listener, listener_opts);
      };
    }
  }, [open]);

  const on_delete = useCallback(() => {
    const should_continue = confirm(
      "Are you sure you want to delete this snippet?"
    );
    if (should_continue) {
      onClickDelete();
    }
  }, [onClickDelete]);

  const copy_all = useCopyToClipboard(
    `${prefix}${text.repeat(default_count || 1)}${suffix}`
  );
  const copy_main = useCopyToClipboard(
    row.text.repeat(Math.round((default_count || 2) / 2))
  );
  return (
    <div className="tts-scratch-row-controls" data-open={`${open}`}>
      <button
        className="tts-scratch-row-control icon-button tts-scratch-row-controls-button"
        onClick={() => setOpen(!open)}
      >
        <i className="fas fa-cog" />
      </button>
      <div className="tts-scratch-row-controls-menu">
        <button
          className="icon-button tts-scratch-row-control"
          title="Listen"
          onClick={() => fetch_tts(row, default_count)}
          disabled={status.pending}
        >
          <i className="fas fa-volume-up" />
        </button>
        <button
          className="icon-button tts-scratch-row-control"
          title="Copy to Clipboard"
          onClick={copy_all}
          // @ts-expect-error:
          onAuxClick={copy_main}
          onContextMenu={(e) => {
            e.preventDefault();
            copy_main();
          }}
        >
          <i className="fas fa-clipboard" />
        </button>
        <button
          className="icon-button tts-scratch-row-control"
          title="Edit"
          onClick={onClickEdit}
        >
          <i className="fas fa-edit" />
        </button>
        <button
          className="icon-button tts-scratch-row-control"
          title="Delete"
          onClick={on_delete}
        >
          <i className="fas fa-trash" />
        </button>
      </div>
    </div>
  );
};
