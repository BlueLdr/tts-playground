import * as Preact from "preact";
import { Snippet } from "~/view/components";
import { useCallback, useEffect, useMemo, useRef } from "preact/hooks";
import {
  useDebounce,
  useStateIfMounted,
  useStateRef,
  useStateWithRef,
  useValueRef,
} from "~/view/utils";
import { add_item_to, deep_equals, replace_item_in } from "~/common";

interface UncategorizedSnippetRow {
  selected?: TTS.SnippetsSection;
  snippet: TTS.Snippet;
  discard?: boolean;
}

export const ImportUncategorizedSnippets: Preact.FunctionComponent<{
  current: boolean;
  snippets: TTS.SnippetsSection[];
  updateSnippets: (snippets: TTS.SnippetsSection[]) => void;
  uncategorized: TTS.Snippet[];
  nextStep: () => void;
  prevStep: () => void;
}> = ({
  uncategorized,
  updateSnippets,
  snippets,
  nextStep,
  prevStep,
  current,
}) => {
  const result_ref = useRef<UncategorizedSnippetRow[]>();
  const [select_all, set_select_all, select_all_ref] = useStateRef<
    boolean | undefined
  >(undefined);

  const items = useMemo<UncategorizedSnippetRow[]>(
    () =>
      uncategorized.map(s => ({
        snippet: s,
        selected: undefined,
        discard: false,
      })),
    [uncategorized]
  );

  const [result, set_result] = useStateWithRef(items, result_ref);

  useEffect(() => {
    if (select_all == null) {
      return;
    }
    set_result(
      result.map(s => ({
        ...s,
        discard: select_all,
      }))
    );
  }, [select_all]);

  const on_select_section = useCallback(
    (row: UncategorizedSnippetRow, selected?: TTS.SnippetsSection) => {
      set_select_all(undefined);
      set_result(
        replace_item_in(
          result_ref.current,
          s => deep_equals(s.snippet, row.snippet),
          {
            ...row,
            selected,
          }
        )
      );
    },
    []
  );

  const on_change_discard = useCallback(
    (row: UncategorizedSnippetRow, discard: boolean) => {
      set_select_all(undefined);
      set_result(
        replace_item_in(
          result_ref.current,
          s => deep_equals(s.snippet, row.snippet),
          {
            ...row,
            discard,
          }
        )
      );
    },
    []
  );

  const finished = useMemo(
    () => result.every(s => !!s.selected || s.discard),
    [result]
  );

  const on_submit = useCallback(
    e => {
      e.preventDefault();
      if (!finished) {
        return;
      }
      let output = snippets ?? [];
      if (select_all_ref.current === true) {
        nextStep();
        return;
      }

      for (let row of result) {
        if (!row.selected || row.discard) {
          continue;
        }
        const section =
          output.find(s => s.name === row.selected.name) ?? row.selected;
        output = replace_item_in(
          output,
          s => s.name === row.selected.name,
          {
            ...section,
            data: add_item_to(section.data, row.snippet),
          },
          "end"
        );
      }
      updateSnippets(output);
      nextStep();
    },
    [finished, result, snippets]
  );

  const sections = useMemo(
    () =>
      snippets?.concat(
        result
          .filter(
            r =>
              !!r.selected &&
              !snippets.find(sec => sec.name === r.selected?.name)
          )
          .map(r => r.selected)
      ),
    [snippets, result]
  );

  return current ? (
    <Preact.Fragment>
      <div className="modal-body tts-import-conflicts tts-import-snippets-uncategorized">
        <p>
          Some of the snippets you imported were not part of a group. Choose or
          create a group to add each snippet to.
        </p>
        <form
          id="uncategorized-snippet-form"
          onSubmit={on_submit}
          className="tts-import-rename tts-import-categorize-snippets modal-scroll-content"
        >
          <table cellSpacing={0}>
            <thead>
              <tr className="tts-import-compare-row">
                <th className="tts-import-snippet-col">Snippet</th>
                <th className="tts-import-snippet-select-section">Section</th>
                <th className="tts-import-rename-discard">
                  <label>
                    Discard
                    <input
                      type="checkbox"
                      checked={select_all}
                      onChange={() => set_select_all(!select_all)}
                    />
                  </label>
                </th>
              </tr>
            </thead>
            <tbody>
              {result.map((s, i) => (
                <ImportSnippetCategorizeItem
                  key={i}
                  row={s}
                  sections={sections}
                  onChangeDiscard={on_change_discard}
                  onSelect={on_select_section}
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
          form="uncategorized-snippet-form"
        >
          Continue
        </button>
      </div>
    </Preact.Fragment>
  ) : null;
};

export const ImportSnippetCategorizeItem: Preact.FunctionComponent<{
  row: UncategorizedSnippetRow;
  sections: TTS.SnippetsSection[];
  onSelect: (
    row: UncategorizedSnippetRow,
    selected: TTS.SnippetsSection
  ) => void;
  onChangeDiscard: (row: UncategorizedSnippetRow, discard: boolean) => void;
}> = ({ row, sections, onSelect, onChangeDiscard }) => {
  const { snippet, selected, discard } = row;
  const row_ref = useValueRef(row);

  const [value, set_value] = useStateIfMounted(selected?.name ?? "");
  const on_change = useCallback(
    (name: string) => {
      if (!name.trim()) {
        onSelect(row_ref.current, undefined);
        return;
      }
      const section: TTS.SnippetsSection = sections.find(
        s => s.name === name
      ) ?? {
        name,
        open: false,
        data: [],
      };
      onSelect(row_ref.current, section);
    },
    [onSelect, sections]
  );
  const [on_change_debounced] = useDebounce(on_change, 100);

  useEffect(() => {
    on_change_debounced(value);
  }, [value]);

  return (
    <tr className="tts-import-compare-row">
      <td className="tts-import-categorize-snippet">
        <Snippet data={snippet} showRepeats={true} />
      </td>
      <td className="tts-import-categorize-section">
        <label className="tts-import-categorize-section-input">
          <input
            id="categorize-input"
            value={value}
            // @ts-expect-error
            onChange={e => set_value(e.target.value)}
            list="categories-list"
            disabled={discard}
            autocomplete="off"
          />
          <datalist id="categories-list">
            {sections?.map(s => (
              <option key={s.name} value={s.name}>
                {s.name}
              </option>
            ))}
          </datalist>
        </label>
      </td>
      <td className="tts-import-rename-discard">
        <label>
          <input
            type="checkbox"
            checked={discard}
            onInput={() => onChangeDiscard(row, !discard)}
          />
        </label>
      </td>
    </tr>
  );
};
