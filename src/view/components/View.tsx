import * as Preact from "preact";
import { memo } from "preact/compat";
import { useCallback, useContext, useEffect } from "preact/hooks";
import { HELP_ITEM } from "~/model";
import {
  Editor,
  ImportExport,
  MessagesList,
  Snippets,
  SettingsModal,
  HelpButton,
  Footer,
} from "~/view/components";
import { useModal, useSaveMessage, useStateIfMounted } from "~/view/utils";

const View: Preact.FunctionComponent = () => {
  const help_item = useContext(HELP_ITEM).value;
  const [settings_open, set_settings_open] = useStateIfMounted(false);
  const dismiss = useCallback(() => set_settings_open(false), []);

  const [loaded_message, update_messages] = useSaveMessage();

  useEffect(() => {
    const listener = e => {
      e.preventDefault();
      e.stopPropagation();
    };
    document.addEventListener("dragover", listener);
    document.addEventListener("dragenter", listener);
    document.addEventListener("drop", listener);
    document.addEventListener("dragleave", listener);
    document.addEventListener("dragexit", listener);
    document.addEventListener("dragend", listener);

    return () => {
      document.removeEventListener("dragover", listener);
      document.removeEventListener("dragenter", listener);
      document.removeEventListener("drop", listener);
      document.removeEventListener("dragleave", listener);
      document.removeEventListener("dragexit", listener);
      document.removeEventListener("dragend", listener);
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
          <ImportExport />
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
              <Snippets />
            </div>
          </div>
        </div>
      </div>
      {settings_open && useModal(<SettingsModal dismiss={dismiss} />)}
    </Preact.Fragment>
  );
};

export default memo(View);
