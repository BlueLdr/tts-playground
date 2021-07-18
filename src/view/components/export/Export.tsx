import * as Preact from "preact";
import { useCallback, useContext, useEffect, useRef } from "preact/hooks";
import { EDITOR_SETTINGS, MESSAGES, SNIPPETS } from "~/model";
import {
  export_messages,
  export_snippets,
  generate_file,
  ResetStorage,
} from "~/view/components";
import { useStateIfMounted } from "~/view/utils";

export const ExportForm: Preact.FunctionComponent<{ dismiss: () => void }> = ({
  dismiss,
}) => {
  const settings = useContext(EDITOR_SETTINGS).value;
  const messages = useContext(MESSAGES).value;
  const snippets = useContext(SNIPPETS).value;
  const link_ref = useRef<HTMLAnchorElement>();

  const [exp_messages, set_exp_messages] = useStateIfMounted(true);
  const [exp_snippets, set_exp_snippets] = useStateIfMounted(true);
  const [exp_settings, set_exp_settings] = useStateIfMounted(false);

  const [exp_data, set_exp_data] = useStateIfMounted<string | undefined>(
    undefined
  );
  const [filename, set_filename] = useStateIfMounted("");

  const on_submit = useCallback(() => {
    if (!exp_messages && !exp_snippets && !exp_settings) {
      return;
    }
    const export_data: TTS.ExportData = { __type: "export-data" };
    if (exp_messages) {
      export_data.messages = export_messages(messages);
      if (!exp_snippets && !exp_settings) {
        set_filename(`tts-data-messages`);
        set_exp_data(generate_file(export_data.messages));
        return;
      }
    }
    if (exp_snippets) {
      export_data.snippets = export_snippets(snippets);
      if (!exp_messages && !exp_settings) {
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
      <div className="modal-body tts-export-export">
        <div className="tts-export-export-form">
          <h4>What data would you like to export?</h4>
          <ul>
            <li>
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={exp_messages}
                  onInput={() => set_exp_messages(!exp_messages)}
                />
                <span className="checkbox-label">Messages</span>
              </label>
            </li>
            <li>
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={exp_snippets}
                  onInput={() => set_exp_snippets(!exp_snippets)}
                />
                <span className="checkbox-label">Snippets</span>
              </label>
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
        <button className="btn btn-negative" onClick={() => set_page(true)}>
          Reset Storage
        </button>
        <button className="btn btn-primary" onClick={dismiss}>
          Done
        </button>
      </div>
    </Preact.Fragment>
  );
};
