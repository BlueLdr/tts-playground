import * as Preact from "preact";
import { useCallback } from "preact/hooks";
import { SCRATCH } from "~/model";
import {
  AudioPlayer,
  ScratchSection,
  ScratchSectionModal,
} from "~/view/components";
import {
  useContextState,
  useModal,
  usePlaySnippet,
  useStateIfMounted,
} from "~/view/utils";

const SCRATCH_PREVIEW_REQUEST: TTS.TTSRequest = {
  text: "",
  promise: new Promise(() => {}),
  data: "",
};
export const Scratch: Preact.FunctionComponent = () => {
  const [scratch, set_scratch] = useContextState(SCRATCH);
  const [edit_target, set_edit_target] = useStateIfMounted(undefined);
  const update_scratch = useCallback(
    (index: number, value?: TTS.ScratchSection) => {
      const data = scratch?.slice();
      data[index] = value;
      set_scratch(data.filter((r) => !!r));
    },
    [scratch]
  );

  const on_finish_edit = useCallback(
    (name: string) => {
      if (edit_target == null) {
        return;
      }
      const section = scratch[edit_target];
      update_scratch(edit_target, {
        data: [],
        open: false,
        ...section,
        name,
      });
    },
    [edit_target, update_scratch, scratch]
  );

  const on_delete_section = useCallback(() => {
    if (edit_target == null) {
      return;
    }
    update_scratch(edit_target);
    set_edit_target(undefined);
  }, [update_scratch, edit_target]);

  const [tts_data, , preview_tts] = usePlaySnippet(
    "scratch-sidebar-player",
    SCRATCH_PREVIEW_REQUEST
  );

  return (
    <div className="tts-scratch">
      <div className="row tts-scratch-header">
        <h4>Scratch Pad</h4>

        <button
          className="tts-scratch-add-section icon-button"
          type="button"
          onClick={() => set_edit_target(scratch?.length ?? 0)}
          title="Create a new group of snippets"
        >
          <i className="fas fa-plus" />
        </button>
      </div>
      <div className="tts-scratch-section-list">
        {scratch.map((s, i) => (
          <ScratchSection
            key={i}
            section={s}
            updateSection={(value) => update_scratch(i, value)}
            onClickEdit={() => set_edit_target(i)}
            previewText={preview_tts}
          />
        ))}
      </div>
      <AudioPlayer
        id="scratch-sidebar-player"
        className="tts-scratch-sidebar-player invisible"
        data={tts_data}
      />
      {edit_target != null &&
        useModal(
          <ScratchSectionModal
            name={scratch[edit_target]?.name}
            setName={on_finish_edit}
            dismiss={() => set_edit_target(undefined)}
            deleteSection={on_delete_section}
          />
        )}
    </div>
  );
};
