import * as Preact from "preact";
import { useCallback, useContext, useEffect, useRef } from "preact/hooks";
import { do_confirm } from "~/common";
import { MODAL_DIRTY } from "~/model";
import { Modal, ModalHeader, ExportMessageCategory } from "~/view/components";
import { useStateIfMounted } from "~/view/utils";

export const CategoryModal: Preact.FunctionComponent<{
  category?: TTS.MessageCategory;
  updateCategory: (name: string, value: TTS.MessageCategory | null) => void;
  onDeleteCategory: (category: TTS.MessageCategory) => void;
  dismiss: () => void;
}> = ({ category, updateCategory, onDeleteCategory, dismiss }) => {
  const set_dirty = useContext(MODAL_DIRTY).setValue;
  const name = category?.name;
  const input_ref = useRef<HTMLInputElement>();
  const [value, set_value] = useStateIfMounted(name);
  const on_click_delete = useCallback(() => {
    const should_delete = do_confirm(
      "Are you sure you want to delete this category and all messages in it?"
    );
    if (should_delete) {
      onDeleteCategory(category);
      set_dirty(false);
      updateCategory(name, null);
      dismiss();
    }
  }, [updateCategory, onDeleteCategory, category]);
  useEffect(() => input_ref.current?.focus(), []);

  useEffect(() => {
    set_dirty(!!category && name !== value);
  }, [name, value, !!category]);

  return (
    <Modal className="tts-message-category-modal" dismiss={dismiss}>
      <ModalHeader dismiss={dismiss}>
        <h3>{!name ? "Create New" : "Edit"} Message Category</h3>
      </ModalHeader>
      <div className="modal-body">
        <label className="tts-message-category-modal-input">
          <span>Category Name</span>
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
            Delete Category
          </button>
        )}
      </div>

      <div className="modal-footer">
        <button className="btn" onClick={dismiss}>
          Cancel
        </button>
        {category && category.name && (
          <ExportMessageCategory category={category} />
        )}
        <button
          className="btn btn-primary"
          onClick={() => {
            updateCategory(name, {
              open: true,
              data: [],
              ...category,
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
