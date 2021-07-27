import * as Preact from "preact";
import { OptimizeLevel, OptimizeTrigger } from "~/model";

const trigger_options: { [K in TTS.OptimizeTriggerName]: string } = {
  manual: "Manually",
  submit: "When you click submit",
  stop: "When you stop typing",
  edit: "As you're typing",
};

const level_options: { [K in TTS.OptimizeLevelName]: string } = {
  safe: "Minimum",
  normal: "Normal",
  max: "Maximum",
};

export const OptimizationSettings: Preact.FunctionComponent<{
  onChangeSettings: <K extends keyof TTS.EditorSettings>(
    key: K,
    value: TTS.EditorSettings[K]
  ) => void;
  form: Partial<TTS.EditorSettings>;
}> = ({ form, onChangeSettings }) => {
  return (
    <div className="tts-settings-section">
      <div className="tts-settings-section-header">Optimization Settings</div>
      <div className="tts-settings-item">
        <label
          className="checkbox toggle tts-settings-item tts-settings-whitespace"
          title="Automatically remove any duplicate, leading, or trailing whitespace"
          htmlFor="trim-whitespace"
          onClick={() =>
            onChangeSettings("trim_whitespace", !form.trim_whitespace)
          }
        >
          <span className="checkbox-label">Automatically Trim Spaces</span>
          <input
            id="trim-whitespace"
            name="trim-whitespace"
            type="checkbox"
            className="invisible"
            checked={form.trim_whitespace}
          />
          <div className="toggle-switch" />
        </label>
      </div>
      <div
        className="tts-settings-item tts-settings-trigger"
        title="Choose when message optimization is triggered. Optimization will eliminate unneeded characters (such as replacing 'you' with 'u') to maximize the amount of text you can fit within the character limit."
      >
        <div className="tts-settings-item-label">Optimize Words:</div>
        <div className="tts-settings-item-control">
          <select
            value={form.optimize_words}
            onChange={e =>
              onChangeSettings(
                "optimize_words",
                parseInt((e.target as HTMLSelectElement).value)
              )
            }
          >
            {Object.entries(trigger_options).map(([key, label]) => (
              <option value={OptimizeTrigger[key]} key={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div
        className="tts-settings-item tts-settings-trigger"
        title="Minimum: Speech should be identical before and after optimization.
Normal: Optimization will cause some very minor changes in speech, but shouldn't be noticeable.
Maximum: Some parts of speech may change noticeably, but should still have the correct syllables."
      >
        <div className="tts-settings-item-label">Optimization Level:</div>
        <div className="tts-settings-item-control">
          <select
            value={form.optimize_level}
            onChange={e =>
              onChangeSettings(
                "optimize_level",
                parseInt((e.target as HTMLSelectElement).value)
              )
            }
          >
            {Object.entries(level_options).map(([key, label]) => (
              <option value={OptimizeLevel[key]} key={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
