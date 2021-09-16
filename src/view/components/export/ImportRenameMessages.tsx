import * as Preact from "preact";
import { useCallback, useEffect, useMemo, useRef } from "preact/hooks";
import { replace_item_in } from "~/common";
import {
  useDebounce,
  useStateIfMounted,
  useStateRef,
  useStateWithRef,
  useValueRef,
} from "~/view/utils";

interface RenameMessageRow {
  message: TTS.Message;
  name: string;
  discard: boolean;
  invalid: boolean;
}

export const ImportRenameMessages: Preact.FunctionComponent<{
  current: boolean;
  messages: TTS.Message[];
  updateMessages: (messages: TTS.Message[]) => void;
  duplicates: TTS.Message[];
  nextStep: () => void;
  prevStep: () => void;
}> = ({
  messages,
  updateMessages,
  duplicates: _duplicates,
  nextStep,
  prevStep,
  current,
}) => {
  const result_ref = useRef<RenameMessageRow[]>();
  const messages_ref = useValueRef(messages);
  const is_invalid = useCallback(
    (name: string, message: TTS.Message) =>
      name === message.name ||
      !!messages_ref.current.find(m => m.name === name) ||
      !!result_ref.current?.find(
        m => m.name === name && !m.discard && m.message.name !== message.name
      ),
    []
  );

  const [select_all, set_select_all, select_all_ref] = useStateRef<
    boolean | undefined
  >(undefined);

  const duplicates = useMemo<RenameMessageRow[]>(
    () =>
      _duplicates
        ?.filter(d => messages?.find(m => m.name === d.name))
        .map(d => {
          const existing_row = result_ref.current?.find(
            r => r.message.name === d.name
          );
          return {
            message: d,
            name: "",
            discard: select_all_ref.current ?? false,
            ...(existing_row ?? {}),
            invalid: existing_row
              ? is_invalid(existing_row.name, existing_row.message)
              : false,
          };
        }),
    [_duplicates, messages]
  );

  const [result, set_result] = useStateWithRef(duplicates, result_ref);
  useEffect(() => {
    set_result(duplicates);
  }, [duplicates]);

  useEffect(() => {
    if (select_all == null) {
      return;
    }
    set_result(result.map(r => ({ ...r, discard: select_all })));
  }, [select_all]);

  const on_change_name = useCallback((row: RenameMessageRow, name: string) => {
    set_result(
      replace_item_in(
        result_ref.current,
        m => m.message.name === row.message.name,
        {
          ...row,
          name,
          invalid: is_invalid(name, row.message),
        }
      )
    );
  }, []);

  const on_change_discard = useCallback(
    (row: RenameMessageRow, discard: boolean) => {
      set_select_all(undefined);
      set_result(
        replace_item_in(
          result_ref.current,
          m => m.message.name === row.message.name,
          {
            ...row,
            discard,
            invalid: is_invalid(row.name, row.message),
          }
        )
      );
    },
    []
  );

  const finished = useMemo(
    () =>
      result.every(
        r => (r.name && r.name !== r.message.name && !r.invalid) || r.discard
      ),
    [result]
  );
  const on_submit = useCallback(
    e => {
      e.preventDefault();
      if (!e.target.checkValidity() || !finished) {
        e.target.reportValidity();
        return;
      }
      const output = messages.concat(
        result
          .filter(r => !r.discard && !r.invalid)
          .map(r => ({ ...r.message, name: r.name }))
      );
      updateMessages(output);
      nextStep();
    },
    [result, finished]
  );

  return current ? (
    <Preact.Fragment>
      <div className="modal-body tts-import-conflicts">
        <p>
          Some of the messages you imported had identical names to existing
          messages but different content. Rename or discard these messages.
        </p>
        <form
          id="import-rename-form"
          className="tts-import-rename modal-scroll-content"
          onSubmit={on_submit}
        >
          <table cellSpacing={0}>
            <thead>
              <tr className="tts-import-rename-row">
                <th className="tts-import-rename-message">Message</th>
                <th className="tts-import-rename-name">New Name</th>
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
              {result.map(r => (
                <ImportMessageRenameItem
                  key={r.message.id}
                  {...r}
                  onChangeName={on_change_name}
                  onChangeDiscard={on_change_discard}
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
          form="import-rename-form"
        >
          Continue
        </button>
      </div>
    </Preact.Fragment>
  ) : null;
};

export const ImportMessageRenameItem: Preact.FunctionComponent<
  RenameMessageRow & {
    onChangeName: (row: RenameMessageRow, name: string) => void;
    onChangeDiscard: (row: RenameMessageRow, discard: boolean) => void;
  }
> = ({ onChangeName, onChangeDiscard, ...row }) => {
  const { message, name, discard, invalid } = row;
  const [value, set_value] = useStateIfMounted(name ?? message?.name);
  const [on_change_name] = useDebounce(onChangeName, 80);
  useEffect(() => {
    on_change_name(row, value);
  }, [value]);
  useEffect(() => {
    if (name !== value) {
      set_value(name);
    }
  }, [name]);

  return (
    <tr className="tts-import-rename-row">
      <td className="tts-import-rename-message">
        <div className="tts-import-compare-message-text tts-text">
          {message.text}
        </div>
      </td>
      <td className="tts-import-rename-name">
        <p>
          <div>Previous Name:</div>
          <strong>{message.name}</strong>
        </p>
        <div>New Name:</div>
        <input
          type="text"
          value={value}
          // @ts-expect-error:
          defaultValue={message.name}
          required={!discard}
          // @ts-expect-error:
          onChange={e => set_value(e.target.value)}
          disabled={discard}
          data-invalid={`${!discard && invalid}`}
        />
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
