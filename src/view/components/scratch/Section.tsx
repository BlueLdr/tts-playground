import * as Preact from "preact";
import { useCallback, useEffect } from "preact/hooks";
import { ScratchRow, ScratchRowEdit } from "~/view/components";
import { useModal, useStateIfMounted } from "~/view/utils";

export const ScratchSection: Preact.FunctionComponent<{
  section: TTS.ScratchSection;
  updateSection: (value: TTS.ScratchSection) => void;
  onClickEdit: () => void;
  previewText: (snippet: TTS.Snippet, count?: number) => Promise<void>;
}> = ({ section, updateSection, onClickEdit, previewText }) => {
  const [open, set_open] = useStateIfMounted(section.open ?? false);
  const update_row = useCallback(
    (index: number, value?: TTS.Snippet) => {
      const data = section.data?.slice() ?? [];
      data[index] = value;
      updateSection({ ...section, data: data.filter((r) => !!r) });
    },
    [updateSection, section]
  );

  useEffect(() => {
    updateSection({ ...section, open });
  }, [open]);

  const [edit_target, set_edit_target] = useStateIfMounted(undefined);

  return (
    <div className="tts-scratch-section" data-open={`${open}`}>
      <div className="tts-scratch-section-header">
        <div
          className="tts-scratch-section-title"
          onClick={() => set_open(!open)}
        >
          <div className="tts-scratch-section-expand">
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
            className="icon-button tts-scratch-section-edit"
            onClick={onClickEdit}
          >
            <i className="fas fa-edit" />
          </button>
        )}
      </div>
      <ul>
        {section.data?.map((r, i) => (
          <ScratchRow
            key={i}
            row={r}
            updateRow={(value) => update_row(i, value)}
            onClickDelete={() => update_row(i)}
            onClickEdit={() => set_edit_target(i)}
            previewText={previewText}
          />
        ))}
        <li className="tts-scratch-row tts-scratch-section-add-row-item">
          <button
            className="tts-scratch-section-add-row"
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
          <ScratchRowEdit
            row={section.data[edit_target]}
            updateRow={(value) => update_row(edit_target, value)}
            onClickDelete={() => update_row(edit_target)}
            dismiss={() => set_edit_target(undefined)}
          />
        )}
    </div>
  );
};
