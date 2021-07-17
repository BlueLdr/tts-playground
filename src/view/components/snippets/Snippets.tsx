import * as Preact from "preact";
import { useCallback } from "preact/hooks";
import { SNIPPETS } from "~/model";
import {
  AudioPlayer,
  SnippetsSection,
  SnippetsSectionModal,
} from "~/view/components";
import {
  useContextState,
  useModal,
  usePlaySnippet,
  useStateIfMounted,
} from "~/view/utils";

const SNIPPETS_PREVIEW_REQUEST: TTS.TTSRequest = {
  text: "",
  promise: new Promise(() => {}),
  data: "",
};
export const Snippets: Preact.FunctionComponent = () => {
  const [snippets, set_snippets] = useContextState(SNIPPETS);
  const [edit_target, set_edit_target] = useStateIfMounted(undefined);
  const update_snippets = useCallback(
    (index: number, value?: TTS.SnippetsSection) => {
      const data = snippets?.slice();
      data[index] = value;
      set_snippets(data.filter(r => !!r));
    },
    [snippets]
  );

  const on_finish_edit = useCallback(
    (name: string) => {
      if (edit_target == null) {
        return;
      }
      const section = snippets[edit_target];
      update_snippets(edit_target, {
        data: [],
        open: false,
        ...section,
        name,
      });
    },
    [edit_target, update_snippets, snippets]
  );

  const on_delete_section = useCallback(() => {
    if (edit_target == null) {
      return;
    }
    update_snippets(edit_target);
    set_edit_target(undefined);
  }, [update_snippets, edit_target]);

  const [tts_data, , preview_tts] = usePlaySnippet(
    "snippets-sidebar-player",
    SNIPPETS_PREVIEW_REQUEST
  );

  return (
    <div className="tts-snippets">
      <div className="row tts-col-header tts-snippets-header">
        <h4>Snippets</h4>

        <button
          className="tts-snippets-add-section icon-button"
          type="button"
          onClick={() => set_edit_target(snippets?.length ?? 0)}
          title="Create a new group of snippets"
        >
          <i className="fas fa-plus" />
        </button>
      </div>
      <div className="tts-snippets-section-list">
        {snippets.map((s, i) => (
          <SnippetsSection
            key={i}
            section={s}
            updateSection={value => update_snippets(i, value)}
            onClickEdit={() => set_edit_target(i)}
            previewText={preview_tts}
          />
        ))}
      </div>
      <AudioPlayer
        id="snippets-sidebar-player"
        className="tts-snippets-sidebar-player invisible"
        data={tts_data}
      />
      {edit_target != null &&
        useModal(
          <SnippetsSectionModal
            name={snippets[edit_target]?.name}
            setName={on_finish_edit}
            dismiss={() => set_edit_target(undefined)}
            deleteSection={on_delete_section}
          />
        )}
    </div>
  );
};
