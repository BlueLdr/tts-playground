import * as Preact from "preact";
import { useCallback, useMemo, useRef } from "preact/hooks";
import { remove_item_from, replace_item_in } from "~/common";
import { ImmutableContextValue, SNIPPETS, SNIPPETS_SECTIONS } from "~/model";
import {
  AudioPlayer,
  Organizer,
  SnippetsRow,
  SnippetsRowEdit,
  SnippetsSectionModal,
} from "~/view/components";
import {
  SEARCH_BAR,
  SearchBar,
  useOrganizerSearch,
} from "~/view/components/common/SearchBar";
import {
  snippet_to_string,
  useContextState,
  useModal,
  usePlaySnippet,
  useRenderPropsFunc,
  useSaveSnippetInSection,
  useStateIfMounted,
  useValueRef,
} from "~/view/utils";

const snippets_section_header_props = () =>
  ({ "data-help": "snippets-group" } as HTMLDivProps);

const get_item_key = (_, snip, __) => snip.id;

const regex_test_snippet = (item: TTS.Snippet, regex) =>
  regex.test(snippet_to_string(item));

const SNIPPETS_PREVIEW_REQUEST: TTS.TTSRequest = {
  text: "",
  promise: new Promise(() => {}),
  data: "",
};

export const SnippetsList: Preact.FunctionComponent = () => {
  const [snippets, set_snippets] = useContextState(SNIPPETS);
  const [sections, set_sections] = useContextState(SNIPPETS_SECTIONS);
  const snippets_ref = useValueRef(snippets);
  const sections_ref = useValueRef(sections);
  const [edit_row_target_id, set_edit_row_target_id_] = useStateIfMounted<
    string | undefined
  >(undefined);
  const [edit_section_target_id, set_edit_section_target_id] =
    useStateIfMounted<string | undefined>(undefined);
  const [reorder_enabled, set_reorder_enabled] = useStateIfMounted(false);

  const edit_row_target_section = useRef<TTS.SnippetsSection | null>(null);
  const set_edit_row_target_id = useCallback(
    (target?: string, target_section?: TTS.SnippetsSection) => {
      if (target && !target_section) {
        return;
      }
      edit_row_target_section.current = target_section ?? null;
      set_edit_row_target_id_(target);
    },
    []
  );

  const update_snippet_in_sections = useSaveSnippetInSection(
    sections_ref,
    set_sections
  );
  const update_snippet = useCallback(
    (id: string, value: TTS.Snippet, section: string) => {
      set_snippets(
        replace_item_in(snippets_ref.current, s => s.id === id, value, "end")
      );
      update_snippet_in_sections(id, value, section);
    },
    [update_snippet_in_sections]
  );
  const on_delete_snippet = useCallback(
    (id: string) => {
      update_snippet_in_sections(
        id,
        undefined,
        edit_row_target_section.current?.name
      );
      set_snippets(remove_item_from(snippets_ref.current, s => s.id === id));
    },
    [update_snippet_in_sections]
  );

  const [tts_data, , preview_tts] = usePlaySnippet(
    "snippets-sidebar-player",
    SNIPPETS_PREVIEW_REQUEST
  );

  const edit_row_target = useMemo(
    () => snippets.find(s => s.id === edit_row_target_id),
    [snippets, edit_row_target_id]
  );

  const edit_section_target = useMemo(() => {
    if (edit_section_target_id == null) {
      return;
    }
    return (
      sections.find(s => s.name === edit_section_target_id) ?? {
        name: "",
        open: false,
        data: [],
      }
    );
  }, [sections, edit_section_target_id]);

  const update_section = useCallback(
    (name: string, value: TTS.SnippetsSection) => {
      set_sections(
        replace_item_in(
          sections_ref.current,
          c => c.name === name,
          value,
          "end"
        ).filter(c => !!c)
      );
    },
    []
  );

  const remove_snippets_in_section = useCallback(
    (section: TTS.SnippetsSection) => {
      const result = snippets_ref.current.filter(
        m => !section.data.includes(m.id)
      );
      set_snippets(result);
    },
    []
  );

  const [search, set_search] = useStateIfMounted("");
  const search_ctx_value = useMemo(
    () => new ImmutableContextValue(search, set_search),
    [search]
  );
  const search_inputs = useMemo(() => (search ? [search] : null), [search]);

  const [search_results_items, search_results_sections] = useOrganizerSearch(
    snippets,
    sections,
    undefined,
    search_inputs,
    regex_test_snippet
  );
  const is_search = useValueRef(
    !!search_results_items || !!search_results_sections
  );

  const list_sections = useMemo(
    () =>
      (search_results_sections ?? sections).map(c => ({
        ...c,
        data: c.data.map(id => snippets.find(m => m.id === id)),
      })),
    [search_results_sections, sections, snippets]
  );

  const set_list_sections = useCallback(
    (sections_: TTS.SnippetsSectionPopulated[]) => {
      let results: TTS.SnippetsSection[] = [];
      if (!!is_search.current) {
        results = sections_.reduce(
          (list, updated) =>
            replace_item_in(
              list,
              sec => sec.name === updated.name,
              prev_value => ({ ...prev_value, open: updated.open })
            ),
          sections_ref.current
        );
      } else {
        results = sections_.map(section => ({
          ...section,
          data: section.data.map(s => s.id),
        }));
      }
      set_sections(results);
    },
    []
  );

  const on_delete_section = useCallback(() => {
    remove_snippets_in_section(edit_section_target);
    set_sections(
      remove_item_from(
        sections_ref.current,
        s => s.name === edit_section_target_id
      )
    );
  }, [edit_section_target, edit_section_target_id]);

  const on_click_add_section = useCallback(
    () => set_edit_section_target_id(""),
    []
  );

  const RenderHeader = useRenderPropsFunc<OrganizerHeaderProps>(
    props => <SnippetsHeader {...props} onClickAdd={on_click_add_section} />,
    [],
    "SnippetsHeader"
  );

  const RenderSectionHeaderControls = useRenderPropsFunc<
    OrganizerSectionHeaderControlsProps<TTS.Snippet>
  >(
    ({ section }) => (
      <button
        className="icon-button tts-snippets-section-edit"
        onClick={() => set_edit_section_target_id(section.name)}
      >
        <i className="fas fa-edit" />
      </button>
    ),
    [],
    "SnippetsSectionHeaderControls"
  );

  const RenderSectionExtras = useRenderPropsFunc<
    OrganizerSectionExtrasProps<TTS.Snippet>
  >(
    ({ section }) => (
      <div className="organizer-section-item tts-snippets-section-add-row-item">
        <button
          className="tts-snippets-section-add-row"
          type="button"
          onClick={() =>
            set_edit_row_target_id("", {
              ...section,
              data: section.data.map(s => s.id),
            })
          }
        >
          <i className="fas fa-plus" />
          Add a Snippet
        </button>
      </div>
    ),
    [],
    "SnippetsSectionAdd"
  );

  const RenderItem = useRenderPropsFunc<OrganizerItemProps<TTS.Snippet>>(
    ({ data, buttons, reorderEnabled }) => (
      <SnippetsRow
        row={data}
        onClickDelete={on_delete_snippet}
        onClickEdit={() => {
          const section = sections_ref.current.find(s =>
            s.data.includes(data.id)
          );
          set_edit_row_target_id(data.id, section);
        }}
        previewText={preview_tts}
        buttons={reorderEnabled ? buttons : undefined}
      />
    ),
    [preview_tts],
    "SnippetsRow"
  );

  return (
    <div className="tts-snippets">
      <SEARCH_BAR.Provider value={search_ctx_value}>
        <div className="tts-snippets-list">
          <Organizer<TTS.Snippet>
            RenderHeader={RenderHeader}
            RenderSectionHeaderControls={RenderSectionHeaderControls}
            RenderSectionExtras={RenderSectionExtras}
            RenderItem={RenderItem}
            getSectionHeaderProps={snippets_section_header_props}
            getItemKey={get_item_key}
            sections={list_sections}
            reorderEnabled={reorder_enabled}
            setReorderEnabled={set_reorder_enabled}
            updateSections={set_list_sections}
          />
        </div>
      </SEARCH_BAR.Provider>
      <AudioPlayer
        id="snippets-sidebar-player"
        className="tts-snippets-sidebar-player invisible"
        data={tts_data}
      />
      {edit_row_target_id != null &&
        useModal(
          <SnippetsRowEdit
            row={edit_row_target}
            updateRow={value =>
              update_snippet(
                edit_row_target_id,
                value,
                edit_row_target_section.current?.name
              )
            }
            onClickDelete={() =>
              update_snippet(
                edit_row_target_id,
                undefined,
                edit_row_target_section.current?.name
              )
            }
            isNew={!edit_row_target}
            dismiss={() => set_edit_row_target_id(null, null)}
          />
        )}

      {edit_section_target_id != null &&
        useModal(
          <SnippetsSectionModal
            section={edit_section_target}
            updateSection={(value: TTS.SnippetsSection) =>
              update_section(edit_section_target_id, value)
            }
            deleteSection={on_delete_section}
            dismiss={() => set_edit_section_target_id(null)}
          />
        )}
    </div>
  );
};

export const SnippetsHeader: Preact.FunctionComponent<{
  className: string;
  buttons: Preact.ComponentChildren;
  reorderEnabled: boolean;
  onClickAdd: () => void;
}> = ({ className, buttons, reorderEnabled, onClickAdd }) => {
  return (
    <div className={`row tts-col-header ${className}`}>
      <SearchBar />
      <h4 data-help="snippets-overview">Snippets</h4>
      <div className="tts-col-header-controls">
        {buttons}
        {!reorderEnabled && (
          <button
            className="tts-snippets-add-section icon-button"
            type="button"
            onClick={onClickAdd}
            title="Create a new group of snippets"
          >
            <i className="fas fa-plus" />
          </button>
        )}
      </div>
    </div>
  );
};
