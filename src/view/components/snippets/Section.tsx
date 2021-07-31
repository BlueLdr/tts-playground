import * as Preact from "preact";
import { useCallback, useContext, useEffect } from "preact/hooks";
import { ADD_SNIPPET_CALLBACK } from "~/model";
import { SnippetsRow, SnippetsRowEdit } from "~/view/components";
import { useModal, useStateIfMounted } from "~/view/utils";

export const SnippetsSection: Preact.FunctionComponent<{
  section: TTS.SnippetsSection;
  updateSection: (value: TTS.SnippetsSection) => void;
  onClickEdit: () => void;
  previewText: (snippet: TTS.Snippet, count?: number) => Promise<void>;
}> = ({ section, updateSection, onClickEdit, previewText }) => {
  const addToMessage = useContext(ADD_SNIPPET_CALLBACK).value;
  const [open, set_open] = useStateIfMounted(section.open ?? false);
  const update_row = useCallback(
    (index: number, value?: TTS.Snippet) => {
      const data = section.data?.slice() ?? [];
      data[index] = value;
      updateSection({ ...section, data: data.filter(r => !!r) });
    },
    [updateSection, section]
  );

  useEffect(() => {
    updateSection({ ...section, open });
  }, [open]);

  const [edit_target, set_edit_target] = useStateIfMounted(undefined);

  return (
    <div className="tts-snippets-section" data-open={`${open}`}>
      <div className="tts-snippets-section-header" data-help="snippets-group">
        <div
          className="tts-snippets-section-title"
          onClick={() => set_open(!open)}
        >
          <div className="tts-snippets-section-expand">
            {open ? (
              <i className="fas fa-chevron-down" />
            ) : (
              <i className="fas fa-chevron-right" />
            )}
          </div>
          <span>{section.name}</span>
        </div>
        {open && (
          <button
            className="icon-button tts-snippets-section-edit"
            onClick={onClickEdit}
          >
            <i className="fas fa-edit" />
          </button>
        )}
      </div>
      <ul>
        {section.data?.map((r, i) => (
          <SnippetsRow
            key={i}
            row={r}
            updateRow={value => update_row(i, value)}
            onClickDelete={() => update_row(i)}
            onClickEdit={() => set_edit_target(i)}
            previewText={previewText}
            addToMessage={addToMessage}
          />
        ))}
        <li className="tts-snippets-row tts-snippets-section-add-row-item">
          <button
            className="tts-snippets-section-add-row"
            type="button"
            onClick={() => set_edit_target(section.data?.length ?? 0)}
          >
            <i className="fas fa-plus" />
            Add a Snippet
          </button>
        </li>
      </ul>
      {edit_target != null &&
        useModal(
          <SnippetsRowEdit
            row={section.data[edit_target]}
            updateRow={value => update_row(edit_target, value)}
            onClickDelete={() => update_row(edit_target)}
            dismiss={() => set_edit_target(undefined)}
            isNew={edit_target === section.data?.length}
          />
        )}
    </div>
  );
};
