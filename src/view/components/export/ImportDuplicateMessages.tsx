import * as Preact from "preact";
import { useCallback, useEffect, useMemo, useRef } from "preact/hooks";
import { replace_item_in } from "~/common";
import { is_duplicate_message } from "~/view/components";
import { useMessageFullText, useStateRef, useStateWithRef } from "~/view/utils";

interface DuplicateMessageRow {
  old_message: TTS.Message;
  new_message: TTS.Message;
  selected: "old" | "new" | undefined;
}

export const ImportDuplicateMessages: Preact.FunctionComponent<{
  current: boolean;
  messages: TTS.Message[];
  updateMessages: (messages: TTS.Message[]) => void;
  duplicates: TTS.Message[];
  nextStep: () => void;
  prevStep: () => void;
}> = ({
  current,
  messages,
  updateMessages,
  duplicates,
  nextStep,
  prevStep,
}) => {
  const result_ref = useRef<DuplicateMessageRow[]>();
  const [select_all, set_select_all, select_all_ref] = useStateRef<
    "old" | "new" | undefined
  >(undefined);

  const items = useMemo<DuplicateMessageRow[]>(
    () =>
      duplicates
        .map(d => {
          const orig = messages?.find(m => is_duplicate_message(m, d));
          if (!orig) {
            return null;
          }
          const existing_row = result_ref.current?.find(
            r =>
              r.new_message.name === d.name && r.old_message.name === orig.name
          );
          return {
            old_message: orig,
            new_message: d,
            selected: select_all_ref.current ?? existing_row?.selected,
          };
        })
        .filter(a => !!a),
    [messages, duplicates]
  );

  const [result, set_result] = useStateWithRef(items, result_ref);

  useEffect(() => {
    if (!select_all) {
      return;
    }
    set_result(result.map(r => ({ ...r, selected: select_all })));
  }, [select_all]);

  const on_select = useCallback(
    (row: DuplicateMessageRow, selected: "old" | "new") => {
      set_select_all(undefined);
      set_result(
        replace_item_in(
          result_ref.current,
          r =>
            r.new_message.name === row.new_message.name &&
            r.old_message.name === row.old_message.name,
          {
            ...row,
            selected,
          }
        )
      );
    },
    []
  );

  const finished = useMemo(() => result.every(r => !!r.selected), [result]);
  const on_submit = useCallback(
    e => {
      e.preventDefault();
      if (!finished) {
        return;
      }
      let output = messages;
      for (let row of result) {
        if (row.selected === "new") {
          output = replace_item_in(
            output,
            m => m.name === row.old_message.name,
            row.new_message
          );
        }
      }
      updateMessages(output);
      nextStep();
    },
    [finished, result]
  );

  return current ? (
    <Preact.Fragment>
      <div className="modal-body tts-import-conflicts">
        <p>
          Some of the messages you imported were identical to existing messages,
          but with different names. Choose the name you want to keep.
        </p>
        <form
          id="duplicate-message-form"
          onSubmit={on_submit}
          className="tts-import-compare modal-scroll-content"
        >
          <div className="tts-import-compare-row">
            <div className="tts-import-compare-row-top">
              <div className="tts-import-compare-side">
                <label
                  className="tts-import-compare-header"
                  data-static={items.length === 1}
                >
                  <div className="tts-import-compare-header-label">
                    Keep Original Name
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
              </div>
              <div
                className="tts-import-compare-side"
                data-static={items.length === 1}
              >
                <label className="tts-import-compare-header">
                  <div className="tts-import-compare-header-label">
                    Use Imported Name
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
              </div>
            </div>
          </div>
          {result.map((row, i) => (
            <ImportMessageCompareItem key={i} row={row} onSelect={on_select} />
          ))}
        </form>
      </div>
      <div className="tts-import-review-footer modal-footer">
        <button className="btn btn-large" type="button" onClick={prevStep}>
          Back
        </button>
        <button
          className="btn btn-primary btn-large"
          form="duplicate-message-form"
          disabled={!finished}
        >
          Continue
        </button>
      </div>
    </Preact.Fragment>
  ) : null;
};

export const ImportMessageCompareItem: Preact.FunctionComponent<{
  row: DuplicateMessageRow;
  onSelect: (row: DuplicateMessageRow, selected: "old" | "new") => void;
}> = ({ row, onSelect }) => {
  const { old_message, new_message, selected } = row;
  const text = useMessageFullText(old_message);

  return (
    <div className="tts-import-compare-row">
      <div className="tts-import-compare-row-top">
        <div
          className="tts-import-compare-side"
          data-selected={`${selected === "old"}`}
        >
          <label className="btn btn-with-icon btn-large">
            <input
              type="radio"
              value={old_message.name}
              checked={selected === "old"}
              onChange={() => onSelect(row, "old")}
              className="tts-import-compare-message-old"
            />
            <div className="tts-import-compare-message-name">
              {old_message.name}
            </div>
          </label>
        </div>
        <div
          className="tts-import-compare-side"
          data-selected={`${selected === "new"}`}
        >
          <label className="btn btn-with-icon btn-large">
            <input
              type="radio"
              value={new_message.name}
              checked={selected === "new"}
              onChange={() => onSelect(row, "new")}
              className="tts-import-compare-message-new"
            />
            <div className="tts-import-compare-message-name">
              {new_message.name}
            </div>
          </label>
        </div>
      </div>
      <div className="tts-import-compare-row-bottom">
        <div className="tts-import-compare-message-text tts-text">{text}</div>
      </div>
    </div>
  );
};
