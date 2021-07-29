import * as Preact from "preact";

export const HelpSettings: Preact.FunctionComponent<{
  onChangeSettings: <K extends keyof TTS.EditorSettings>(
    key: K,
    value: TTS.EditorSettings[K]
  ) => void;
  form: Partial<TTS.EditorSettings>;
}> = ({ form, onChangeSettings }) => {
  return (
    <div className="tts-settings-section">
      <div className="tts-settings-section-header">Help & Tutorials</div>
      <div className="tts-settings-item">
        <label
          className="checkbox toggle tts-settings-item tts-settings-skip"
          title="Disable tutorials that appear the first time you use certain features."
          data-help="tutorials-help"
        >
          <span className="checkbox-label">Skip All Tutorials</span>
          <input
            type="checkbox"
            className="invisible"
            checked={form.skip_tutorials}
            onChange={() =>
              onChangeSettings("skip_tutorials", !form.skip_tutorials)
            }
          />
          <div className="toggle-switch" />
        </label>
      </div>
    </div>
  );
};
