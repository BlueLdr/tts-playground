import * as Preact from "preact";
import { useCallback, useEffect, useMemo, useRef } from "preact/hooks";
import { EDITOR_SETTINGS, MESSAGES, SNIPPETS } from "~/model";
import {
  import_data,
  ImportDuplicateMessages,
  ImportDuplicateSnippets,
  ImportRenameMessages,
  ImportUncategorizedSnippets,
  validate_import_data,
} from "~/view/components";
import { useContextState, useStateIfMounted, useStateRef } from "~/view/utils";

export const ImportForm: Preact.FunctionComponent<{
  dismiss: () => void;
  initialData?: TTS.AnyExportData;
}> = ({ dismiss, initialData }) => {
  const [settings, set_settings] = useContextState(EDITOR_SETTINGS);
  const [messages, set_messages] = useContextState(MESSAGES);
  const [snippets, set_snippets] = useContextState(SNIPPETS);
  const [data, set_data] = useStateIfMounted(initialData);
  const [step, set_step, step_ref] = useStateRef<number>(0);
  const parsed_data = useMemo(
    () => (data ? import_data(data, settings, messages, snippets) : null),
    [data]
  );

  const [messages_dupes_result, set_messages_dupes_result] =
    useStateIfMounted<TTS.Message[]>(undefined);
  const [messages_final_result, set_messages_final_result] =
    useStateIfMounted<TTS.Message[]>(undefined);
  const [snippets_dupes_result, set_snippets_dupes_result] =
    useStateIfMounted<TTS.SnippetsSection[]>(undefined);
  const [snippets_final_result, set_snippets_final_result] =
    useStateIfMounted<TTS.SnippetsSection[]>(undefined);

  const next_step = useCallback(() => set_step(step_ref.current + 1), []);
  const prev_step = useCallback(() => {
    if (step_ref.current === 0) {
      set_data(undefined);
      set_messages_dupes_result(undefined);
      set_messages_final_result(undefined);
      set_snippets_dupes_result(undefined);
      set_snippets_final_result(undefined);
    } else {
      set_step(step_ref.current - 1);
    }
  }, []);

  const [
    settings_result,
    messages_result_initial,
    snippets_result_initial,
    dup_messages = [],
    rename_messages = [],
    dup_snippets = [],
    uncategorized_snippets = [],
  ] = parsed_data ?? [];

  const [success, set_success] = useStateIfMounted(false);

  const on_finish = useCallback(() => {
    if (settings_result) {
      set_settings(settings_result);
    }
    if (messages_final_result) {
      set_messages(messages_final_result);
    }
    if (snippets_final_result) {
      set_snippets(snippets_final_result);
    }
    set_success(true);
  }, [settings_result, messages_final_result, snippets_final_result]);

  useEffect(() => {
    if (!parsed_data) {
      return;
    }

    if (
      dup_messages.length === 0 &&
      rename_messages.length === 0 &&
      dup_snippets.length === 0 &&
      uncategorized_snippets.length === 0
    ) {
      if (settings_result) {
        set_settings(settings_result);
      }
      if (messages_result_initial) {
        set_messages(messages_result_initial);
      }
      if (snippets_result_initial) {
        set_snippets(snippets_result_initial);
      }
      set_success(true);
    }

    if (messages_result_initial) {
      set_messages_dupes_result(messages_result_initial);
      set_messages_final_result(messages_result_initial);
    } else if (dup_messages.length !== 0 && rename_messages.length !== 0) {
      set_messages_dupes_result(messages);
      set_messages_final_result(messages);
    } else if (dup_messages.length === 0 && rename_messages.length > 0) {
      set_messages_dupes_result(messages);
    }

    if (snippets_result_initial) {
      set_snippets_dupes_result(snippets_result_initial);
      set_snippets_final_result(snippets_result_initial);
    } else if (
      dup_snippets.length !== 0 ||
      uncategorized_snippets.length !== 0
    ) {
      set_snippets_dupes_result(snippets);
      set_snippets_final_result(snippets);
    } else if (dup_snippets.length === 0 && uncategorized_snippets.length > 0) {
      set_snippets_dupes_result(snippets);
    }
  }, [parsed_data]);

  const steps = useMemo(() => {
    const arr = [];
    if (dup_messages.length !== 0) {
      arr.push(
        <ImportDuplicateMessages
          current={step === arr.length}
          duplicates={dup_messages}
          messages={messages_result_initial ?? messages}
          updateMessages={set_messages_dupes_result}
          nextStep={next_step}
          prevStep={prev_step}
        />
      );
    }
    if (rename_messages.length !== 0) {
      arr.push(
        <ImportRenameMessages
          current={step === arr.length}
          messages={messages_dupes_result}
          updateMessages={set_messages_final_result}
          duplicates={rename_messages}
          nextStep={next_step}
          prevStep={prev_step}
        />
      );
    }
    if (dup_snippets.length !== 0) {
      arr.push(
        <ImportDuplicateSnippets
          current={step === arr.length}
          snippets={snippets_result_initial ?? snippets}
          updateSnippets={set_snippets_dupes_result}
          duplicates={dup_snippets}
          nextStep={next_step}
          prevStep={prev_step}
        />
      );
    }
    if (uncategorized_snippets.length !== 0) {
      arr.push(
        <ImportUncategorizedSnippets
          current={step === arr.length}
          snippets={snippets_dupes_result}
          updateSnippets={set_snippets_final_result}
          uncategorized={uncategorized_snippets}
          nextStep={next_step}
          prevStep={prev_step}
        />
      );
    }
    return arr;
  }, [
    step,
    dup_messages,
    rename_messages,
    dup_snippets,
    uncategorized_snippets,
    messages_result_initial,
    messages_dupes_result,
    snippets_result_initial,
    snippets_dupes_result,
  ]);

  useEffect(() => {
    if (step > 0 && step === steps.length) {
      on_finish();
    }
  }, [step]);

  if (!parsed_data) {
    return (
      <div className="modal-body tts-import-file" data-help="import-details">
        <ImportFileInput onChange={set_data} />
      </div>
    );
  }

  if (success) {
    return (
      <Preact.Fragment>
        <div className="modal-body tts-import-file">
          <div className="tts-import-success">
            <h4>Import Successful!</h4>
            <i className="far fa-check-circle" />
          </div>
        </div>
        <div className="modal-footer">
          <button
            className="btn btn-large"
            onClick={() => {
              set_data(undefined);
              set_messages_dupes_result(undefined);
              set_messages_final_result(undefined);
              set_snippets_dupes_result(undefined);
              set_snippets_final_result(undefined);
              set_step(0);
              set_success(false);
            }}
          >
            Import More
          </button>
          <button className="btn btn-primary btn-large" onClick={dismiss}>
            Finish
          </button>
        </div>
      </Preact.Fragment>
    );
  }

  return <Preact.Fragment>{steps}</Preact.Fragment>;
};

const ImportFileInput: Preact.FunctionComponent<{
  onChange: (data: TTS.AnyExportData) => void;
}> = ({ onChange }) => {
  const [bad_type, set_bad_type] = useStateIfMounted(false);
  const [no_data, set_no_data] = useStateIfMounted(false);
  const [dragged, set_dragged] = useStateIfMounted(false);

  const input_ref = useRef<HTMLInputElement>();
  const form_ref = useRef<HTMLFormElement>();

  const upload_file = useCallback(
    (input_file, on_finish?: () => void) => {
      if (input_file.type !== "application/json") {
        set_bad_type(true);
        return;
      } else if (bad_type) {
        set_bad_type(false);
      }
      const reader = new FileReader();

      reader.onload = ev => {
        if (ev.target) {
          try {
            const new_data = JSON.parse(ev.target["result"] as string);
            const validated = validate_import_data(new_data);
            if (validated) {
              set_no_data(false);
              onChange(validated);
            } else {
              set_no_data(true);
            }
          } catch (err) {
            console.error(`Failed to parse import file:`, err);
            set_bad_type(true);
          }
        }
        on_finish?.();
      };
      reader.readAsText(input_file);
    },
    [bad_type, onChange]
  );

  return (
    <form ref={form_ref}>
      <div
        data-dragged={`${dragged}`}
        className="tts-import-input"
        onClick={() => input_ref.current?.click()}
        onDragOver={e => {
          e.preventDefault();
          e.stopPropagation();
          set_dragged(true);
        }}
        onDragEnter={e => {
          e.preventDefault();
          e.stopPropagation();
          set_dragged(true);
        }}
        onDrop={e => {
          e.preventDefault();
          e.stopPropagation();
          set_dragged(false);
          const input_file = e.dataTransfer.files[0];
          if (!input_file) {
            return;
          }
          upload_file(input_file, e.dataTransfer.clearData);
        }}
        onDragLeave={() => set_dragged(false)}
        onDragExit={() => set_dragged(false)}
        onDragEnd={() => set_dragged(false)}
      >
        <div className="tts-import-input-main">
          <i className="fas fa-file-upload" />
          <div className="tts-import-input-text">
            <span>Drag & Drop</span>
            <span>OR</span>
            <span>Click to Browse</span>
          </div>
        </div>
        {(bad_type || no_data) && (
          <div className="tts-import-input-error">
            {bad_type
              ? "You must select a valid JSON file."
              : "That file did not contain any data that could be imported."}
          </div>
        )}
      </div>
      <input
        ref={input_ref}
        className="invisible"
        type="file"
        tabIndex={-1}
        onChange={e => {
          // @ts-expect-error:
          const input_file = e.target.files[0];
          if (!input_file) {
            return;
          }
          upload_file(input_file);
        }}
        accept="application/json"
      />
    </form>
  );
};
