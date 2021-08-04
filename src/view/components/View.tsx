import * as Preact from "preact";
import { memo } from "preact/compat";
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "preact/hooks";
import {
  EDITOR_STATE,
  EDITOR_UNSAVED,
  HELP_ITEM,
  LOADED_MESSAGE,
  MESSAGES,
} from "~/model";
import {
  Editor,
  ImportExport,
  MessagesList,
  Snippets,
  SettingsModal,
  HelpButton,
  Footer,
} from "~/view/components";
import {
  useContextState,
  useModal,
  useStateIfMounted,
  useValueRef,
} from "~/view/utils";

const View: Preact.FunctionComponent = () => {
  const [messages, set_messages] = useContextState(MESSAGES);
  const [loaded_index, set_loaded_index] = useContextState(LOADED_MESSAGE);
  const {
    value: { text, speed, max_length, bits },
  } = useContext(EDITOR_STATE);
  const [is_unsaved, set_unsaved] = useContextState(EDITOR_UNSAVED);
  const help_item = useContext(HELP_ITEM).value;
  const loaded_message = messages[loaded_index];
  const [settings_open, set_settings_open] = useStateIfMounted(false);
  const dismiss = useCallback(() => set_settings_open(false), []);

  const new_is_unsaved = useMemo(() => {
    return !loaded_message
      ? !!text
      : loaded_message.text !== text ||
          loaded_message.options?.speed !== speed ||
          loaded_message.options?.bits !== bits ||
          loaded_message.options?.max_length !== max_length;
  }, [loaded_message, text, speed, max_length, bits]);
  useEffect(() => {
    set_unsaved(new_is_unsaved);
  }, [new_is_unsaved]);

  const load_when_unsaved_reset = useRef<number | null>(null);
  const messages_ref = useValueRef(messages);
  const update_messages = useCallback(
    (index = -1, value) => {
      const same_name = messages_ref.current.findIndex(
        m => m.name === value?.name
      );
      if (same_name > -1 && same_name !== index) {
        alert("A message with this name already exists.");
        return false;
      }
      const data = messages_ref.current?.slice();
      data[index === -1 ? messages_ref.current.length : index] = value;
      const new_messages = data.filter(r => !!r);
      set_messages(new_messages);
      if (!value) {
        load_when_unsaved_reset.current = -1;
      } else if (index === -1) {
        load_when_unsaved_reset.current = new_messages.length - 1;
      } else {
        load_when_unsaved_reset.current = new_messages.findIndex(
          m => m.name === value?.name
        );
      }
      set_unsaved(!value);
      return true;
    },
    [messages]
  );

  useEffect(() => {
    const new_index = load_when_unsaved_reset.current;
    if (new_index != null && (!is_unsaved || new_index === -1)) {
      set_loaded_index(new_index, new_index === -1);
      load_when_unsaved_reset.current = null;
    }
  }, [is_unsaved]);

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
          <div
            className="tts-col tts-col-messages"
            data-help-intro-highlight={help_item === "intro-messages"}
          >
            <MessagesList updateMessages={update_messages} />
          </div>
          <div className="tts-col tts-col-main">
            <Editor message={loaded_message} updateMessages={update_messages} />
            <Footer />
          </div>
          <div className="tts-col tts-col-snippets">
            <div
              className=""
              data-help-intro-highlight={help_item === "intro-snippets"}
            >
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
