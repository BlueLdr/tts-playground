import * as Preact from "preact";
import { DEFAULT_BITS_STRING } from "~/common";
import { ensure_number } from "~/view/utils";

export const GeneralSettings: Preact.FunctionComponent<{
  onChangeSettings: <K extends keyof TTS.EditorSettings>(
    key: K,
    value: TTS.EditorSettings[K]
  ) => void;
  form: Partial<TTS.EditorSettings>;
}> = ({ form, onChangeSettings }) => {
  return (
    <div className="tts-settings-section">
      <div className="tts-settings-section-header">General Settings</div>
      {/*<div
        className="tts-settings-item tts-settings-insert"
        title="Insert a snippet from the snippets pad at either the cursor position or at the end of the message"
        data-help="snippet-insert-pos"
      >
        <div className="tts-settings-item-label">Insert Snippets At:</div>
        <div className="tts-settings-item-control">
          <label className="radio-button tts-settings-insert-input">
            <input
              type="radio"
              value="true"
              checked={form.insert_at_cursor === true}
              onChange={() => onChangeSettings("insert_at_cursor", true)}
            />
            <span className="radio-label">Cursor</span>
          </label>
          <label className="radio-button tts-settings-insert-input">
            <input
              type="radio"
              value="true"
              checked={form.insert_at_cursor === false}
              onChange={() => onChangeSettings("insert_at_cursor", false)}
            />
            <span className="radio-label">End</span>
          </label>
        </div>
      </div>*/}
      <div className="tts-settings-item">
        <label
          className="checkbox toggle tts-settings-item tts-settings-skip"
          title="Automatically stop audio playback when the speed modifier starts"
          data-help="tutorials-auto-stop"
        >
          <span className="checkbox-label">
            Automatically Stop Audio at Speed Modifier
          </span>
          <input
            type="checkbox"
            className="invisible"
            checked={form.stop_playback_at_modifier}
            onChange={() =>
              onChangeSettings(
                "stop_playback_at_modifier",
                !form.stop_playback_at_modifier
              )
            }
          />
          <div className="toggle-switch" />
        </label>
      </div>
      <div
        className="tts-settings-item tts-settings-bits"
        data-help="bits-default"
      >
        <div className="tts-settings-item-label">Default Bits String</div>
        <div className="tts-settings-item-control">
          <input
            value={form.bits_string}
            onChange={e => {
              if (!(e.target as HTMLInputElement).value) {
                return;
              }
              onChangeSettings(
                "bits_string",
                (e.target as HTMLInputElement).value.trim()
              );
            }}
            onBlur={e => {
              if (!(e.target as HTMLInputElement).value) {
                onChangeSettings("bits_string", DEFAULT_BITS_STRING);
              }
            }}
          />
        </div>
      </div>
      <div
        className="tts-settings-item tts-settings-history"
        title="Number of undo/redo steps that will be stored. When you exceed this number, the oldest step will be discarded."
        data-help="history-steps"
      >
        <div className="tts-settings-item-label">Max. Undo/Redo Steps</div>
        <div className="tts-settings-item-control">
          <span>{form.history_steps}</span>
          <input
            type="range"
            min={64}
            max={256}
            value={form.history_steps}
            onChange={e => {
              const new_value = ensure_number(
                (e.target as HTMLInputElement).valueAsNumber,
                255
              );
              onChangeSettings("history_steps", new_value);
            }}
          />
        </div>
      </div>
    </div>
  );
};
