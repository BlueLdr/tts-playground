import * as Preact from "preact";
import { useCallback } from "preact/hooks";
import { VOICE_NAMES } from "~/common";
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
  const [set_max_length] = useDebounce(setMaxLength, 75);
  return (
    <div className="tts-header">
      <div className="tts-header-top">
        <h4>TTS Message</h4>
        <div className="tts-header-controls">
          <button
            className="btn btn-with-icon icon-only btn-negative tts-settings-reset"
            title="Clear the editor and start a new message"
            onClick={reset}
          >
            <i className="fas fa-undo" />
          </button>
          <button
            className="tts-settings-button"
            type="button"
            onClick={() => on_change_settings("open", !settings.open)}
            data-open={`${settings.open}`}
          >
            <i className="fas fa-cog" />
          </button>
        </div>
      </div>
      <div className="tts-settings" data-open={`${settings.open}`}>
        <div className="row tts-settings-section tts-settings-section-tall">
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
              <label className="radio-button tts-settings-insert-input">
                <input
                  type="radio"
                  value="true"
                  onInput={() => on_change_settings("insert_at_cursor", true)}
                  checked={settings.insert_at_cursor === true}
                />
                <span className="radio-label">Cursor</span>
              </label>
              <label className="radio-button tts-settings-insert-input">
                <input
                  type="radio"
                  value="true"
                  onInput={() => on_change_settings("insert_at_cursor", false)}
                  checked={settings.insert_at_cursor === false}
                />
                <span className="radio-label">End</span>
              </label>
            </div>
          </div>
          <div
            className="tts-settings-item tts-settings-voice"
            title="Select a TTS voice"
          >
            <div className="tts-settings-item-label">TTS Voice</div>
            <div className="tts-settings-item-control">
              <select
                value={settings.voice}
                onChange={(e) =>
                  on_change_settings(
                    "voice",
                    (e.target as HTMLSelectElement).value
                  )
                }
              >
                {VOICE_NAMES.map((name) => (
                  <option value={name} key={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className="tts-settings-section-label">Message Optimization</div>
        <div className="row tts-settings-section">
          <div className="tts-settings-item">
            <label
              className="checkbox tts-settings-whitespace"
              title="Automatically remove any duplicate, leading, or trailing whitespace"
            >
              <input
                type="checkbox"
                checked={settings.trim_whitespace}
                onInput={() =>
                  on_change_settings(
                    "trim_whitespace",
                    !settings.trim_whitespace
                  )
                }
              />
              <span className="checkbox-label">Automatically Trim Spaces</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
