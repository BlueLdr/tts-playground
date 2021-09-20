import * as Preact from "preact";
import { memo } from "preact/compat";
import { useCallback, useContext, useEffect } from "preact/hooks";
import { HELP_ITEM } from "~/model";
import {
  Editor,
  ImportExport,
  MessagesList,
  SettingsModal,
  HelpButton,
  Footer,
  validate_import_data,
  SnippetsList,
} from "~/view/components";
import {
  useModal,
  useSaveMessage,
  useStateIfMounted,
  useStateRef,
  useUploadFiles,
} from "~/view/utils";

const View: Preact.FunctionComponent = () => {
  const help_item = useContext(HELP_ITEM).value;
  const [settings_open, set_settings_open] = useStateIfMounted(false);
  const dismiss = useCallback(() => set_settings_open(false), []);

  const [loaded_message, update_messages] = useSaveMessage();

  const [import_data, set_import_data, import_data_ref] =
    useStateRef<TTS.AnyExportData | null>(null);

  const upload_files = useUploadFiles(set_import_data);

  useEffect(() => {
    const drag_listener = e => {
      e.preventDefault();
      e.stopPropagation();
    };
    const drop_listener = e => {
      e.preventDefault();
      e.stopPropagation();
      if (document.getElementById("modal-container")?.childElementCount <= 0) {
        upload_files(e.dataTransfer.files);
        e.dataTransfer.clearData();
      }
    };
    const paste_listener = e => {
      if (
        document.getElementById("modal-container")?.childElementCount > 0 &&
        document.getElementById("tts-export-modal") &&
        import_data_ref.current
      ) {
        return;
      }
      if (e?.clipboardData?.files?.length > 0) {
        e.preventDefault();
        e.stopPropagation();
        upload_files(e.clipboardData.files).then(() => {
          e.clipboardData.clearData();
        });
        return;
      }
      const data = e?.clipboardData?.getData("text");
      try {
        const json = JSON.parse(data);
        const validated = validate_import_data(json);
        if (validated) {
          e.preventDefault();
          e.stopPropagation();
          set_import_data(validated);
        }
      } catch (e) {}
    };
    document.addEventListener("paste", paste_listener);
    document.addEventListener("dragover", drag_listener);
    document.addEventListener("dragenter", drag_listener);
    document.addEventListener("drop", drop_listener);
    document.addEventListener("dragleave", drag_listener);
    document.addEventListener("dragexit", drag_listener);
    document.addEventListener("dragend", drag_listener);

    return () => {
      document.removeEventListener("paste", paste_listener);
      document.removeEventListener("dragover", drag_listener);
      document.removeEventListener("dragenter", drag_listener);
      document.removeEventListener("drop", drop_listener);
      document.removeEventListener("dragleave", drag_listener);
      document.removeEventListener("dragexit", drag_listener);
      document.removeEventListener("dragend", drag_listener);
    };
  }, []);

  return (
    <Preact.Fragment>
      <div className="header">
        <div className="header-left">
          <h1>TTS Playground</h1>
          <h4>By BlueLdr</h4>
        </div>
        <div className="header-right">
          <HelpButton />
          <button
            className="header-button"
            type="button"
            onClick={() => set_settings_open(true)}
          >
            <i className="fas fa-cog" />
          </button>
          <ImportExport
            importData={import_data}
            setImportData={set_import_data}
          />
          <button className="help-link btn btn-primary" data-help="intro-start">
            App Overview
          </button>
          <button className="help-link btn btn-primary" data-help="help-docs">
            Read the TTS Guide
          </button>
        </div>
      </div>
      <div className="tts-container">
        <div className="tts-container">
          <div className="tts-col tts-col-messages">
            <div data-help-intro-highlight={help_item === "intro-messages"}>
              <MessagesList updateMessages={update_messages} />
            </div>
          </div>
          <div className="tts-col tts-col-main">
            <Editor message={loaded_message} updateMessages={update_messages} />
            <Footer />
          </div>
          <div className="tts-col tts-col-snippets">
            <div data-help-intro-highlight={help_item === "intro-snippets"}>
              <SnippetsList />
            </div>
          </div>
        </div>
      </div>
      {settings_open && useModal(<SettingsModal dismiss={dismiss} />)}
    </Preact.Fragment>
  );
};

export default memo(View);
