import * as Preact from "preact";
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "preact/hooks";
import {
  EDITOR_SETTINGS,
  MESSAGE_CATEGORIES,
  MESSAGES,
  SNIPPETS,
  SNIPPETS_SECTIONS,
  UNCATEGORIZED_MESSAGES,
} from "~/model";
import {
  ExpandableChecklist,
  export_message_categories,
  export_messages,
  export_snippets,
  export_snippets_sections,
  generate_file,
  ResetStorage,
  Snippet,
} from "~/view/components";
import { useStateIfMounted } from "~/view/utils";

export const ExportForm: Preact.FunctionComponent<{ dismiss: () => void }> = ({
  dismiss,
}) => {
  const settings = useContext(EDITOR_SETTINGS).value;
  const messages = useContext(MESSAGES).value;
  const categories = useContext(MESSAGE_CATEGORIES).value;
  const uncat_msgs = useContext(UNCATEGORIZED_MESSAGES).value;
  const snippets = useContext(SNIPPETS).value;
  const sections = useContext(SNIPPETS_SECTIONS).value;
  const link_ref = useRef<HTMLAnchorElement>();

  const [exp_messages, set_exp_messages] = useStateIfMounted(messages);
  const [exp_snippets, set_exp_snippets] = useStateIfMounted(snippets);
  const [exp_settings, set_exp_settings] = useStateIfMounted(false);

  const [exp_data, set_exp_data] = useStateIfMounted<string | undefined>(
    undefined
  );
  const [filename, set_filename] = useStateIfMounted("");

  const on_submit = useCallback(() => {
    if (!exp_messages && !exp_snippets && !exp_settings) {
      return;
    }
    const export_data: TTS.ExportData = { __type: "export-data" };
    if (exp_messages.length > 0) {
      export_data.messages = export_messages(exp_messages);
      export_data.messageCategories = export_message_categories(
        categories
          .concat(uncat_msgs)
          .map(c => ({
            ...c,
            data: c.data.filter(id => exp_messages.some(m => m.id === id)),
          }))
          .filter(c => c.data.length > 0)
      );
      if (exp_snippets.length === 0 && !exp_settings) {
        set_filename(`tts-data-messages`);
        set_exp_data(generate_file(export_data));
        return;
      }
    }
    if (exp_snippets.length > 0) {
      export_data.snippets = export_snippets(exp_snippets);
      export_data.snippetsSections = export_snippets_sections(
        sections
          .map(s => ({
            ...s,
            data: s.data.filter(id => exp_snippets.some(sn => sn.id === id)),
          }))
          .filter(s => s.data.length > 0)
      );
      if (exp_messages.length === 0 && !exp_settings) {
        set_filename(`tts-data-snippets`);
        set_exp_data(generate_file(export_data));
        return;
      }
    }
    if (exp_settings) {
      export_data.settings = { ...settings, __type: "settings" };
      if (exp_messages.length === 0 && exp_snippets.length === 0) {
        set_filename(`tts-data-settings`);
        set_exp_data(generate_file(export_data.settings));
        return;
      }
    }
    set_filename(`tts-data`);
    set_exp_data(generate_file(export_data));
  }, [
    messages,
    uncat_msgs,
    snippets,
    settings,
    exp_messages,
    exp_snippets,
    exp_settings,
  ]);

  useEffect(() => {
    if (exp_data && filename) {
      link_ref.current?.click();
    }
  }, [exp_data]);

  const [reset_page, set_page] = useStateIfMounted(false);

  const disabled = !(exp_messages || exp_snippets || exp_settings);

  return reset_page ? (
    <ResetStorage onCancel={() => set_page(false)} />
  ) : (
    <Preact.Fragment>
      <div className="modal-body modal-scroll-content tts-export-export">
        <div className="tts-export-export-form" data-help="export-details">
          <h4>What data would you like to export?</h4>
          <ul>
            <li>
              <ExportMessageTree
                categories={categories}
                messages={messages}
                selection={exp_messages}
                setSelection={set_exp_messages}
                uncategorizedMessages={uncat_msgs}
              />
            </li>
            <li>
              <ExportSnippetsTree
                sections={sections}
                snippets={snippets}
                selection={exp_snippets}
                setSelection={set_exp_snippets}
              />
            </li>
            <li>
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={exp_settings}
                  onInput={() => set_exp_settings(!exp_settings)}
                />
                <span className="checkbox-label">Settings</span>
              </label>
            </li>
          </ul>
          <div className="row">
            <button
              className="btn btn-primary btn-large"
              onClick={disabled ? undefined : on_submit}
              disabled={disabled}
            >
              Export
            </button>
          </div>
          {exp_data && filename ? (
            <div className="row">
              <a
                href={`data:application/json;charset=utf-8,${encodeURIComponent(
                  exp_data
                )}`}
                download={`${filename}.json`}
                ref={link_ref}
              >
                Click here if the download doesn't start automatically.
              </a>
            </div>
          ) : null}
        </div>
      </div>
      <div className="modal-footer tts-export-footer">
        <button
          className="btn btn-negative"
          onClick={() => set_page(true)}
          data-help="import-export-reset"
        >
          Reset Storage
        </button>
        <button className="btn btn-primary" onClick={dismiss}>
          Done
        </button>
      </div>
    </Preact.Fragment>
  );
};

const RenderLabel = <T extends { name: string }>({ data }: { data: T }) => (
  <Preact.Fragment>{data.name}</Preact.Fragment>
);

export const ExportMessageTree: Preact.FunctionComponent<{
  categories: TTS.MessageCategory[];
  uncategorizedMessages: TTS.MessageCategory;
  messages: TTS.Message[];
  selection: TTS.Message[];
  setSelection: (items: TTS.Message[]) => void;
}> = ({
  categories,
  messages,
  selection,
  setSelection,
  uncategorizedMessages,
}) => {
  const checklist_items_initial = useMemo<
    ExpandableChecklistItem<TTS.MessageCategoryPopulated>[]
  >(() => {
    const cats = categories.map(c => ({
      // @ts-expect-error:
      data: c as TTS.MessageCategoryPopulated,
      key: c.name,
      selected: c.data.map(
        id =>
          ({
            data: messages.find(m => m.id === id),
            key: id,
            selected: !!selection.find(msg => msg.id === id),
            Render: RenderLabel,
          } as ExpandableChecklistItem<TTS.Message>)
      ),
      Render: RenderLabel,
    }));

    const uncat = messages.filter(
      m => !categories.find(c => c.data.includes(m.id))
    );
    if (uncat.length > 0) {
      const uncat_sorted = uncategorizedMessages.data
        .filter(id => uncat.find(m => m.id === id))
        .map(id => messages.find(m => m.id === id))
        .concat(uncat.filter(m => !uncategorizedMessages.data.includes(m.id)));

      return cats.concat({
        data: {
          ...uncategorizedMessages,
          data: uncat_sorted,
        },
        key: uncategorizedMessages.name,
        selected: uncat_sorted.map(m => ({
          data: m,
          key: m.id,
          selected: !!selection.find(msg => msg.id == m.id),
          Render: RenderLabel,
        })),
        Render: RenderLabel,
      });
    }
    return cats;
  }, []);

  const [checklist_items, set_checklist_items] = useStateIfMounted(
    checklist_items_initial
  );

  const first_render = useRef(true);
  useEffect(() => {
    if (first_render.current) {
      first_render.current = false;
      return;
    }
    setSelection(
      checklist_items.reduce(
        (items, c) =>
          items.concat(c.selected.filter(i => i.selected).map(i => i.data)),
        [] as TTS.Message[]
      )
    );
  }, [checklist_items]);

  return (
    <ExpandableChecklist
      items={checklist_items}
      label="Messages"
      onChange={set_checklist_items}
    />
  );
};

export const ExportSnippetsTree: Preact.FunctionComponent<{
  sections: TTS.SnippetsSection[];
  snippets: TTS.Snippet[];
  selection: TTS.Snippet[];
  setSelection: (items: TTS.Snippet[]) => void;
}> = ({ snippets, sections, selection, setSelection }) => {
  const checklist_items_initial = useMemo<
    ExpandableChecklistItem<TTS.SnippetsSectionPopulated>[]
  >(
    () =>
      sections.map(s => ({
        // @ts-expect-error:
        data: s as TTS.SnippetsSectionPopulated,
        key: s.name,
        selected: s.data.map(
          id =>
            ({
              data: snippets.find(m => m.id === id),
              key: id,
              selected: !!selection.find(snip => snip.id === id),
              Render: Snippet,
            } as ExpandableChecklistItem<TTS.Snippet>)
        ),
        Render: RenderLabel,
      })),
    []
  );

  const [checklist_items, set_checklist_items] = useStateIfMounted(
    checklist_items_initial
  );

  const first_render = useRef(true);
  useEffect(() => {
    if (first_render.current) {
      first_render.current = false;
      return;
    }
    setSelection(
      checklist_items.reduce(
        (items, c) =>
          items.concat(c.selected.filter(i => i.selected).map(i => i.data)),
        [] as TTS.Snippet[]
      )
    );
  }, [checklist_items]);

  return (
    <ExpandableChecklist
      items={checklist_items}
      label="Snippets"
      onChange={set_checklist_items}
    />
  );
};
