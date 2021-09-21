import * as Preact from "preact";
import { useCallback, useEffect, useMemo, useRef } from "preact/hooks";
import { deep_equals, replace_item_in } from "~/common";
import { is_duplicate_snippet, Snippet } from "~/view/components";
import { useStateRef, useStateWithRef } from "~/view/utils";

interface DuplicateSnippet {
  old_section: TTS.SnippetsSection;
  new_section: TTS.SnippetsSection;
  old_snippet: TTS.Snippet;
  new_snippet: TTS.Snippet;
  selected: "old" | "new" | undefined;
}

export const ImportDuplicateSnippets: Preact.FunctionComponent<{
  current: boolean;
  snippets: TTS.Snippet[];
  sections: TTS.SnippetsSection[];
  updateSnippets: (snippets: TTS.Snippet[]) => void;
  duplicates: TTS.Snippet[];
  nextStep: () => void;
  prevStep: () => void;
}> = ({
  current,
  snippets,
  sections,
  updateSnippets,
  duplicates,
  nextStep,
  prevStep,
}) => {
  const result_ref = useRef<DuplicateSnippet[]>();
  const [select_all, set_select_all, select_all_ref] = useStateRef<
    "old" | "new" | undefined
  >(undefined);

  const items = useMemo<DuplicateSnippet[]>(
    () =>
      duplicates
        .map(snip => {
          const orig_snip = snippets.find(s => is_duplicate_snippet(s, snip));
          if (!orig_snip) {
            return null;
          }
          const existing_row = result_ref.current?.find(r =>
            deep_equals(r.new_snippet, snip)
          );
          return {
            old_section: sections.find(s => s.data.includes(orig_snip.id)),
            new_section: sections.find(s => s.data.includes(snip.id)),
            old_snippet: orig_snip,
            new_snippet: snip,
            selected: select_all_ref.current ?? existing_row?.selected,
          };
        })
        .filter(r => !!r),
    [snippets, duplicates, sections]
  );

  const [result, set_result] = useStateWithRef(items, result_ref);

  useEffect(() => {
    if (!select_all) {
      return;
    }
    set_result(result.map(s => ({ ...s, selected: select_all })));
  }, [select_all]);

  const on_select = useCallback(
    (row: DuplicateSnippet, selected: "old" | "new") => {
      set_select_all(undefined);
      set_result(
        replace_item_in(
          result_ref.current,
          r => deep_equals(r.new_snippet, row.new_snippet),
          {
            ...row,
            selected,
          }
        )
      );
    },
    []
  );

  const finished = useMemo(() => result.every(s => !!s.selected), [result]);
  const on_submit = useCallback(
    e => {
      e.preventDefault();
      if (!finished) {
        return;
      }
      let output = snippets;
      for (let row of result) {
        if (row.selected === "new") {
          if (!row.new_section) {
            row.new_snippet.id = row.old_snippet.id;
          }
          output = replace_item_in(
            output,
            s => s.id === row.old_snippet.id,
            row.new_snippet
          );
        }
      }

      updateSnippets(output);
      nextStep();
    },
    [finished, result, snippets]
  );

  return current ? (
    <Preact.Fragment>
      <div className="modal-body tts-import-conflicts tts-import-snippets-duplicates">
        <p>
          Some of the snippets you imported had the same content, but with
          different options. Choose the version you want to keep.
        </p>
        <form
          id="duplicate-snippet-form"
          onSubmit={on_submit}
          className="tts-import-compare tts-import-compare-snippets modal-scroll-content"
        >
          <table cellSpacing={0}>
            <thead>
              <tr className="tts-import-compare-row">
                <th className="tts-import-compare-side">
                  <label
                    className="tts-import-compare-header"
                    data-static={items.length === 1}
                  >
                    <div className="tts-import-compare-header-label">
                      Keep Original Snippet
                    </div>
                    {items.length > 1 && (
                      <span className="tts-import-compare-header-input">
                        <input
                          type="radio"
                          value="old"
                          name="select_all"
                          checked={select_all === "old"}
                          onChange={() => set_select_all("old")}
                        />
                        Select All
                      </span>
                    )}
                  </label>
                </th>
                <th
                  className="tts-import-compare-side"
                  data-static={items.length === 1}
                >
                  <label className="tts-import-compare-header">
                    <div className="tts-import-compare-header-label">
                      Use Imported Snippet
                    </div>
                    {items.length > 1 && (
                      <span className="tts-import-compare-header-input">
                        <input
                          type="radio"
                          value="new"
                          name="select_all"
                          checked={select_all === "new"}
                          onChange={() => set_select_all("new")}
                        />
                        Select All
                      </span>
                    )}
                  </label>
                </th>
              </tr>
            </thead>
            <tbody>
              {result.map((s, i) => (
                <ImportSnippetCompareItem
                  key={i}
                  row={s}
                  onSelect={on_select}
                />
              ))}
            </tbody>
          </table>
        </form>
      </div>
      <div className="tts-import-review-footer modal-footer">
        <button className="btn btn-large" type="button" onClick={prevStep}>
          Back
        </button>
        <button
          disabled={!finished}
          className="btn btn-primary btn-large"
          form="duplicate-snippet-form"
        >
          Continue
        </button>
      </div>
    </Preact.Fragment>
  ) : null;
};

export const ImportSnippetCompareItem: Preact.FunctionComponent<{
  row: DuplicateSnippet;
  onSelect: (row: DuplicateSnippet, selected: "old" | "new") => void;
}> = ({ row, onSelect }) => {
  const { old_snippet, new_snippet, selected } = row;

  return (
    <tr className="tts-import-compare-row">
      <td
        className="tts-import-compare-side"
        data-selected={`${selected === "old"}`}
      >
        <label className="btn btn-with-icon btn-large">
          <input
            type="radio"
            checked={selected === "old"}
            onChange={() => onSelect(row, "old")}
            className="tts-import-compare-snippet-old"
          />
          <div className="tts-import-compare-snippet">
            <Snippet data={old_snippet} showRepeats={true} />
          </div>
        </label>
      </td>
      <td
        className="tts-import-compare-side"
        data-selected={`${selected === "new"}`}
      >
        <label className="btn btn-with-icon btn-large">
          <input
            type="radio"
            checked={selected === "new"}
            onChange={() => onSelect(row, "new")}
            className="tts-import-compare-snippet-new"
          />
          <div className="tts-import-compare-snippet">
            <Snippet data={new_snippet} showRepeats={true} />
          </div>
        </label>
      </td>
    </tr>
  );
};
