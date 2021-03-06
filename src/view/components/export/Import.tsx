import * as Preact from "preact";
import { useCallback, useEffect, useMemo, useRef } from "preact/hooks";
import {
  EDITOR_SETTINGS,
  MESSAGE_CATEGORIES,
  MESSAGES,
  MODAL_DIRTY,
  SNIPPETS,
  SNIPPETS_SECTIONS,
  UNCATEGORIZED_MESSAGES,
} from "~/model";
import {
  import_data,
  ImportDuplicateMessages,
  ImportDuplicateSnippets,
  ImportRenameMessages,
  ImportUncategorizedSnippets,
} from "~/view/components";
import {
  get_uncategorized_messages,
  useContextState,
  useDragAndDrop,
  useStateIfMounted,
  useStateRef,
  useUploadFiles,
} from "~/view/utils";

export const ImportForm: Preact.FunctionComponent<{
  dismiss: () => void;
  data?: TTS.AnyExportData;
  setData: (data: TTS.AnyExportData | null) => void;
}> = ({ dismiss, data, setData }) => {
  const [, set_dirty] = useContextState(MODAL_DIRTY);
  const [settings, set_settings] = useContextState(EDITOR_SETTINGS);
  const [categories, set_categories] = useContextState(MESSAGE_CATEGORIES);
  const [uncat_msgs, set_uncat_msgs] = useContextState(UNCATEGORIZED_MESSAGES);
  const [messages, set_messages] = useContextState(MESSAGES);
  const [snippets, set_snippets] = useContextState(SNIPPETS);
  const [snippets_sections, set_snippets_sections] =
    useContextState(SNIPPETS_SECTIONS);
  const [step, set_step, step_ref] = useStateRef<number>(0);
  const parsed_data = useMemo(
    () =>
      data
        ? import_data(
            data,
            settings,
            messages,
            snippets,
            categories,
            uncat_msgs,
            snippets_sections
          )
        : null,
    [data]
  );

  const [messages_dupes_result, set_messages_dupes_result] =
    useStateIfMounted<TTS.Message[]>(undefined);
  const [messages_final_result, set_messages_final_result] =
    useStateIfMounted<TTS.Message[]>(undefined);
  const [snippets_dupes_result, set_snippets_dupes_result] =
    useStateIfMounted<TTS.Snippet[]>(undefined);
  const [snippets_final_result, set_snippets_final_result] =
    useStateIfMounted<TTS.Snippet[]>(undefined);
  const [sections_final_result, set_sections_final_result] =
    useStateIfMounted<TTS.SnippetsSection[]>(undefined);

  const next_step = useCallback(() => set_step(step_ref.current + 1), []);
  const prev_step = useCallback(() => {
    if (step_ref.current === 0) {
      setData(undefined);
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
    categories_result_initial,
    sections_result_initial,
    uncat_result,
    dup_messages = [],
    rename_messages = [],
    dup_snippets = [],
    uncategorized_snippets = [],
  ] = parsed_data ?? [];

  const [success, set_success] = useStateIfMounted(false);
  useEffect(() => {
    set_dirty(!!parsed_data && !success);
  }, [success, parsed_data]);

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
    let categories_final: TTS.MessageCategory[] | undefined;
    if (categories_result_initial) {
      categories_final = categories_result_initial
        .map(c => ({
          ...c,
          data: c.data.filter(id =>
            (messages_final_result ?? messages).some(m => m.id === id)
          ),
        }))
        .filter(
          c => categories.some(ca => ca.name === c.name) || c.data.length > 0
        );
      set_categories(categories_final);
    }
    if (uncat_result) {
      set_uncat_msgs(
        get_uncategorized_messages(
          messages_final_result ?? messages,
          categories_final ?? categories,
          uncat_result
        )
      );
    }
    let sections_final: TTS.SnippetsSection[] | undefined;
    if (sections_final_result) {
      sections_final = sections_final_result
        .map(s => ({
          ...s,
          data: s.data.filter(id =>
            (snippets_final_result ?? snippets).some(sn => sn.id === id)
          ),
        }))
        .filter(
          c =>
            snippets_sections.some(ca => ca.name === c.name) ||
            c.data.length > 0
        );
      set_snippets_sections(sections_final);
    }

    set_success(true);
  }, [
    settings_result,
    messages_final_result,
    snippets_final_result,
    sections_final_result,
    snippets_sections,
    categories_result_initial,
    categories,
    messages,
  ]);

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
      if (categories_result_initial) {
        set_categories(categories_result_initial);
      }
      if (sections_result_initial) {
        set_snippets_sections(sections_result_initial);
      }
      if (uncat_result) {
        set_uncat_msgs(
          get_uncategorized_messages(
            messages_result_initial ?? messages,
            categories_result_initial ?? categories,
            uncat_result
          ),
          categories_result_initial ?? categories
        );
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

    if (sections_result_initial) {
      set_sections_final_result(sections_result_initial);
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
          sections={sections_result_initial ?? snippets_sections}
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
          sections={sections_result_initial}
          updateSections={set_sections_final_result}
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
        <ImportFileInput onChange={setData} />
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
              setData(undefined);
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
  const input_ref = useRef<HTMLInputElement>();
  const form_ref = useRef<HTMLFormElement>();

  const [error, set_error] = useStateIfMounted<string | undefined>(undefined);

  const upload_file = useUploadFiles(onChange, set_error, form_ref);
  const [dragged, drag_listeners] = useDragAndDrop(upload_file);

  return (
    <form ref={form_ref}>
      <div
        data-dragged={`${dragged}`}
        className="tts-import-input"
        onClick={() => input_ref.current?.click()}
        {...drag_listeners}
      >
        <div className="tts-import-input-main">
          <i className="fas fa-file-upload" />
          <div className="tts-import-input-text">
            <span>Drag & Drop</span>
            <span>OR</span>
            <span>Click to Browse</span>
          </div>
        </div>
        {error && <div className="tts-import-input-error">{error}</div>}
      </div>
      <input
        ref={input_ref}
        id="tts-import-input"
        className="invisible"
        type="file"
        tabIndex={-1}
        multiple={true}
        onChange={e => {
          // @ts-expect-error:
          upload_file(e.target.files);
        }}
        accept="application/json"
      />
    </form>
  );
};
