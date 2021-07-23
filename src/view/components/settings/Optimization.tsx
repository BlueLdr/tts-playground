import * as Preact from "preact";
import { useCallback } from "preact/hooks";
import { EDITOR_SETTINGS, OptimizeLevel, OptimizeTrigger } from "~/model";
import { Modal, ModalHeader } from "~/view/components";
import { useContextState, useStateObject } from "~/view/utils";

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
  dismiss: () => void;
}> = ({ dismiss }) => {
  const [settings, set_settings] = useContextState(EDITOR_SETTINGS);
  const [form, set_form] = useStateObject(settings);
  const on_change_settings = useCallback(
    <K extends keyof TTS.EditorSettings>(
      key: K,
      value: TTS.EditorSettings[K]
    ) =>
      set_form({
        [key]: value,
      }),
    []
  );

  return (
    <Modal className="tts-settings-modal" dismiss={dismiss}>
      <ModalHeader dismiss={dismiss}>Optimization Settings</ModalHeader>
      <div className="modal-body">
        <div className="tts-settings-modal-item">
          <label
            className="checkbox toggle tts-settings-modal-item tts-settings-modal-whitespace"
            title="Automatically remove any duplicate, leading, or trailing whitespace"
          >
            <span className="checkbox-label">Automatically Trim Spaces</span>
            <input
              type="checkbox"
              className="invisible"
              checked={form.trim_whitespace}
              onInput={() =>
                on_change_settings("trim_whitespace", !form.trim_whitespace)
              }
            />
            <div className="toggle-switch" />
          </label>
        </div>
        <div
          className="tts-settings-modal-item tts-settings-modal-trigger"
          title="Choose when message optimization is triggered. Optimization will eliminate unneeded characters (such as replacing 'you' with 'u') to maximize the amount of text you can fit within the character limit."
        >
          <div className="tts-settings-modal-item-label">Optimize Words:</div>
          <div className="tts-settings-modal-item-control">
            <select
              value={form.optimize_words}
              onChange={e =>
                on_change_settings(
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
          className="tts-settings-modal-item tts-settings-modal-trigger"
          title="Minimum: Speech should be identical before and after optimization.
Normal: Optimization will cause some very minor changes in speech, but shouldn't be noticeable.
Maximum: Some parts of speech may change noticeably, but should still have the correct syllables."
        >
          <div className="tts-settings-modal-item-label">
            Optimization Level:
          </div>
          <div className="tts-settings-modal-item-control">
            <select
              value={form.optimize_level}
              onChange={e =>
                on_change_settings(
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
      <div className="modal-footer">
        <button className="btn btn-large" onClick={dismiss}>
          Cancel
        </button>
        <button
          className="btn btn-large btn-primary"
          onClick={() => {
            set_settings(form);
            dismiss();
          }}
        >
          Save
        </button>
      </div>
    </Modal>
  );
};
