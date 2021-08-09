import * as Preact from "preact";
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "preact/hooks";
import { EDITOR_SETTINGS, MESSAGES, SNIPPETS } from "~/model";
import {
  ExpandableChecklist,
  export_messages,
  export_snippets,
  generate_file,
  is_duplicate_snippet,
  ResetStorage,
  Snippet,
} from "~/view/components";
import { useStateIfMounted } from "~/view/utils";

export const ExportForm: Preact.FunctionComponent<{ dismiss: () => void }> = ({
  dismiss,
}) => {
  const settings = useContext(EDITOR_SETTINGS).value;
  const messages = useContext(MESSAGES).value;
  const snippets = useContext(SNIPPETS).value;
  const link_ref = useRef<HTMLAnchorElement>();

  const [exp_messages, set_exp_messages] = useStateIfMounted(messages);
  const [exp_snippets, set_exp_snippets] = useStateIfMounted(snippets);
  const [exp_settings, set_exp_settings] = useStateIfMounted(false);

  const no_snippets_selected = useMemo(() => {
    let all_empty = true;
    for (let i = 0; i < exp_snippets.length; i++) {
      let exp = exp_snippets[i];
      let data = snippets[i];
      if (exp.name !== data?.name) {
        data = snippets.find(s => s.name === exp.name);
        if (!data) {
          return false;
        }
      }
      all_empty = all_empty && exp.data.length === 0;
    }
    return all_empty;
  }, [exp_snippets, snippets]);

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
      if (!no_snippets_selected && !exp_settings) {
        set_filename(`tts-data-messages`);
        set_exp_data(generate_file(export_data.messages));
        return;
      }
    }
    if (!no_snippets_selected) {
      export_data.snippets = export_snippets(exp_snippets);
      if (exp_messages.length === 0 && !exp_settings) {
        set_filename(`tts-data-snippets`);
        set_exp_data(generate_file(export_data.snippets));
        return;
      }
    }
    if (exp_settings) {
      export_data.settings = { ...settings, __type: "settings" };
      if (!exp_messages && !exp_snippets) {
        set_filename(`tts-data-settings`);
        set_exp_data(generate_file(export_data.settings));
        return;
      }
    }
    set_filename(`tts-data`);
    set_exp_data(generate_file(export_data));
  }, [messages, snippets, settings, exp_messages, exp_snippets, exp_settings]);

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
                messages={messages}
                selection={exp_messages}
                setSelection={set_exp_messages}
              />
            </li>
            <li>
              <ExportSnippetsTree
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

const RenderLabel = ({ data }: { data: TTS.SnippetsSection | TTS.Message }) => (
  <Preact.Fragment>{data.name}</Preact.Fragment>
);

export const ExportMessageTree: Preact.FunctionComponent<{
  messages: TTS.Message[];
  selection: TTS.Message[];
  setSelection: (items: TTS.Message[]) => void;
}> = ({ messages, selection, setSelection }) => {
  const checklist_items_initial = useMemo(
    () =>
      messages.map(
        m =>
          ({
            data: m,
            key: m.id,
            selected: !!selection.find(msg => msg.id === m.id),
            Render: RenderLabel,
          } as ExpandableChecklistItem<TTS.Message>)
      ),
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
    setSelection(checklist_items.filter(i => i.selected).map(i => i.data));
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
  snippets: TTS.SnippetsSection[];
  selection: TTS.SnippetsSection[];
  setSelection: (items: TTS.SnippetsSection[]) => void;
}> = ({ snippets, selection, setSelection }) => {
  const checklist_items_initial = useMemo(
    () =>
      snippets.map(g => {
        const group_selected = selection.find(gr => g.name === gr.name);
        return {
          data: g,
          key: g.name,
          selected: group_selected
            ? g.data.map(s => ({
                data: s,
                key: `${s.options.prefix}${s.text}${s.options.suffix}`,
                selected: !!group_selected?.data?.filter(sn =>
                  is_duplicate_snippet(sn, s)
                ),
                Render: Snippet,
              }))
            : [],
          Render: RenderLabel,
        } as ExpandableChecklistItem<TTS.SnippetsSection>;
      }),
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
      checklist_items
        .map(i => ({
          ...i.data,
          data: i.selected.filter(s => s.selected).map(s => s.data),
        }))
        .filter(i => i.data.length > 0)
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
