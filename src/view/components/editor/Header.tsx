import * as Preact from "preact";
import { useCallback } from "preact/hooks";
import { EDITOR_SETTINGS } from "~/model";
import {
  ensure_number,
  useContextState,
  useDebounce,
  useStateIfMounted,
  useValueRef,
} from "~/view/utils";

export const EditorHeader: Preact.FunctionComponent<{
  reset: () => void;
  maxLength: number;
  setMaxLength: (value: number) => void;
}> = ({ maxLength, setMaxLength, reset }) => {
  const [settings, set_settings] = useContextState(EDITOR_SETTINGS);
  const settings_ref = useValueRef(settings);
  const on_change_settings = useCallback(
    <K extends keyof TTS.EditorSettings>(
      key: K,
      value: TTS.EditorSettings[K]
    ) =>
      set_settings({
        ...settings_ref.current,
        [key]: value,
      }),
    []
  );

  const [value, set_value] = useStateIfMounted(maxLength);
  const set_max_length = useDebounce(setMaxLength, 75);
  return (
    <div className="tts-header">
      <div className="tts-header-top">
        <h4>TTS Message</h4>
        <button
          className="tts-settings-button"
          type="button"
          onClick={() => on_change_settings("open", !settings.open)}
        >
          <i className="fas fa-cog" />
        </button>
      </div>
      <div className="tts-settings" data-open={`${settings.open}`}>
        <div className="row">
          <div className="tts-settings-item tts-settings-char-limit">
            <label
              for="tts-settings-char-limit"
              className="tts-settings-item-label"
            >
              Character Limit: {value}
            </label>
            <input
              id="tts-settings-char-limit"
              className="tts-settings-item-control"
              type="range"
              min={255}
              max={500}
              onInput={(e) => {
                const new_value = ensure_number(
                  (e.target as HTMLInputElement).valueAsNumber,
                  255
                );
                set_value(new_value);
                set_max_length(new_value);
              }}
              value={value}
            />
          </div>
          <div
            className="tts-settings-item tts-settings-insert"
            title="Insert a snippet from the scratch pad at either the cursor position or at the end of the message"
          >
            <div className="tts-settings-item-label">Insert Snippets At:</div>
            <div className="tts-settings-item-control">
              <label className="tts-settings-insert-input">
                <input
                  type="radio"
                  value="true"
                  onInput={() => on_change_settings("insert_at_cursor", true)}
                  checked={settings.insert_at_cursor === true}
                />
                <span>Cursor</span>
              </label>
              <label className="tts-settings-insert-input">
                <input
                  type="radio"
                  value="true"
                  onInput={() => on_change_settings("insert_at_cursor", false)}
                  checked={settings.insert_at_cursor === false}
                />
                <span>End</span>
              </label>
            </div>
          </div>
          <div className="tts-settings-item">
            <button
              className="btn btn-with-icon btn-negative tts-settings-item-control"
              onClick={reset}
            >
              <i className="fas fa-undo" />
              Clear
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
