import * as Preact from "preact";
import { useEffect, useRef } from "preact/hooks";
import {
  AudioPlayer,
  ExportSnippet,
  Modal,
  ModalHeader,
} from "~/view/components";
import { usePlaySnippet, useStateIfMounted } from "~/view/utils";

const SNIPPETS_EDIT_MODAL_REQUEST: TTS.TTSRequest = {
  text: "",
  promise: new Promise(() => {}),
  data: "",
};
export const SnippetsRowEdit: Preact.FunctionComponent<{
  row: TTS.Snippet;
  updateRow: (row: TTS.Snippet) => void;
  onClickDelete: () => void;
  dismiss: () => void;
  isNew?: boolean;
}> = ({ row = {}, updateRow, dismiss, isNew }) => {
  const [value, set_value] = useStateIfMounted(row.text ?? "");
  const [prefix, set_prefix] = useStateIfMounted(row.options?.prefix ?? "");
  const [suffix, set_suffix] = useStateIfMounted(row.options?.suffix ?? "");
  const [count, set_count] = useStateIfMounted(row.options?.default_count || 1);
  const [space_before, set_space_before] = useStateIfMounted(
    row.options?.space_before
  );
  const [space_after, set_space_after] = useStateIfMounted(
    row.options?.space_after
  );

  const [tts_data, status, preview_tts] = usePlaySnippet(
    "snippet-modal-player",
    SNIPPETS_EDIT_MODAL_REQUEST
  );

  const input_ref = useRef<HTMLInputElement>();
  useEffect(() => {
    input_ref.current?.focus();
  }, []);

  const new_row = {
    text: value,
    options: {
      prefix,
      suffix,
      default_count: count,
      space_before: space_before,
      space_after: space_after,
    },
  };
  return (
    <Modal className="tts-snippets-modal" dismiss={dismiss}>
      <ModalHeader dismiss={dismiss}>
        <h3>{!row.text ? "Create New" : "Edit"} Snippet</h3>
      </ModalHeader>
      <div className="modal-body">
        <div className="row tts-snippets-modal-text tts-text">
          <label
            className="tts-snippets-modal-prefix"
            title="Some snippets need to start with a different string than the repeated characters (e.g. the 'y' in yDRDRDR)."
          >
            <span>Prefix</span>
            <input
              value={prefix}
              onInput={e => set_prefix((e.target as HTMLInputElement).value)}
            />
          </label>
          <label className="tts-snippets-modal-input">
            <span>Main Text</span>
            <input
              ref={input_ref}
              value={value}
              onInput={e => set_value((e.target as HTMLInputElement).value)}
            />
          </label>
          <label
            className="tts-snippets-modal-suffix"
            title="Text to insert after all repetitions of the snippet (e.g. punctuation)"
          >
            <span>Suffix</span>
            <input
              value={suffix}
              onInput={e => set_suffix((e.target as HTMLInputElement).value)}
            />
          </label>
          <button
            className="icon-button"
            onClick={() => preview_tts(new_row)}
            disabled={!value}
          >
            <i className="fas fa-volume-up" />
          </button>
          <div className="tts-submit-status">
            {status.pending ? (
              <i className="fas fa-circle-notch" />
            ) : status.success ? (
              <i className="fas fa-check-circle" />
            ) : status.error ? (
              <i className="fas fa-exclamation-circle" />
            ) : null}
          </div>
        </div>
        <div className="row">
          <AudioPlayer id="snippet-modal-player" data={tts_data} />
          {status.error && (
            <p className="error">{JSON.stringify(status.error, null, 2)}</p>
          )}
        </div>
        <h4>Options</h4>
        <div className="row">
          <label
            className="tts-snippets-modal-checkbox"
            title="When adding this snippet to the message, put a space between the existing text and the snippet."
          >
            <input
              type="checkbox"
              checked={space_before}
              onInput={e =>
                set_space_before((e.target as HTMLInputElement).checked)
              }
            />
            Space Before
          </label>
          <label
            className="tts-snippets-modal-checkbox"
            title="When adding this snippet to the message, put a space after the snippet."
          >
            <input
              type="checkbox"
              checked={space_after}
              onInput={e =>
                set_space_after((e.target as HTMLInputElement).checked)
              }
            />
            Space After
          </label>
          <label
            className="tts-snippets-modal-count"
            title="By default, the snippet's main text will be repeated this many times. This can be overridden in the Snippet sidebar."
          >
            <input
              type="number"
              value={count}
              min={1}
              max={20}
              step={1}
              onInput={e => {
                const value = (e.target as HTMLInputElement).valueAsNumber;
                if (!isNaN(value)) {
                  set_count(value);
                }
              }}
            />
            Default Repeat Count
          </label>
        </div>
      </div>
      <div className="modal-footer">
        <button className="btn" onClick={dismiss}>
          Cancel
        </button>
        {!isNew && <ExportSnippet snippet={new_row} />}
        <button
          className="btn btn-primary"
          onClick={() => {
            updateRow(new_row);
            dismiss();
          }}
          disabled={!value}
        >
          Save
        </button>
      </div>
    </Modal>
  );
};
