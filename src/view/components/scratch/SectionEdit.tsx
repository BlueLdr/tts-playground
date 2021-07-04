import * as Preact from "preact";
import { useCallback, useEffect, useRef } from "preact/hooks";
import { useStateIfMounted } from "~/view/utils";

export const ScratchSectionModal: Preact.FunctionComponent<{
  name: string;
  setName: (value: string) => void;
  deleteSection: () => void;
  dismiss: () => void;
}> = ({ name, setName, deleteSection, dismiss }) => {
  const input_ref = useRef<HTMLInputElement>();
  const [value, set_value] = useStateIfMounted(name);
  const on_click_delete = useCallback(() => {
    const should_delete = confirm(
      "Are you sure you want to delete this group and all snippets in it?"
    );
    if (should_delete) {
      deleteSection();
      dismiss();
    }
  }, []);
  useEffect(() => input_ref.current?.focus(), []);

  return (
    <div className="modal-backdrop">
      <div className="modal tts-scratch-section-modal">
        <div className="modal-header">
          <h3>{!name ? "Create New" : "Edit"} Snippet Group</h3>
          <button className="icon-button modal-close" onClick={dismiss}>
            <i className="fas fa-times" />
          </button>
        </div>
        <div className="modal-body">
          <label className="tts-scratch-section-modal-input">
            <span>Group Name</span>
            <input
              ref={input_ref}
              value={value}
              onInput={(e) => set_value((e.target as HTMLInputElement).value)}
            />
          </label>
          {name && (
            <button
              className="btn btn-negative btn-with-icon"
              onClick={on_click_delete}
            >
              <i className="fas fa-trash" />
              Delete Group
            </button>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn" onClick={dismiss}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={() => {
              setName(value);
              dismiss();
            }}
            disabled={!value}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};
