import * as Preact from "preact";
import { useCallback, useContext, useEffect, useRef } from "preact/hooks";
import { do_confirm } from "~/common";
import { MODAL_DIRTY } from "~/model";
import { Modal, ModalHeader } from "~/view/components";
import { ExportSnippetsSection } from "~/view/components/export/ExportSnippetSection";
import { useStateIfMounted } from "~/view/utils";

export const SnippetsSectionModal: Preact.FunctionComponent<{
  section?: TTS.SnippetsSection;
  updateSection: (value: TTS.SnippetsSection) => void;
  deleteSection: () => void;
  dismiss: () => void;
}> = ({ section, updateSection, deleteSection, dismiss }) => {
  const set_dirty = useContext(MODAL_DIRTY).setValue;
  const name = section?.name;
  const input_ref = useRef<HTMLInputElement>();
  const [value, set_value] = useStateIfMounted(name);
  const on_click_delete = useCallback(() => {
    const should_delete = do_confirm(
      "Are you sure you want to delete this group and all snippets in it?"
    );
    if (should_delete) {
      deleteSection();
      set_dirty(false);
      dismiss();
    }
  }, []);
  useEffect(() => input_ref.current?.focus(), []);

  useEffect(() => {
    set_dirty(!!section?.name && name !== value);
  }, [name, value, !!section]);

  return (
    <Modal className="tts-snippets-section-modal" dismiss={dismiss}>
      <ModalHeader dismiss={dismiss}>
        <h3>{!name ? "Create New" : "Edit"} Snippet Group</h3>
      </ModalHeader>
      <div className="modal-body">
        <label className="tts-snippets-section-modal-input">
          <span>Group Name</span>
          <input
            ref={input_ref}
            value={value}
            onInput={e => set_value((e.target as HTMLInputElement).value)}
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
        {section && section.name && <ExportSnippetsSection section={section} />}
        <button
          className="btn btn-primary"
          onClick={() => {
            updateSection({
              ...section,
              name: value,
            });
            set_dirty(false);
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
