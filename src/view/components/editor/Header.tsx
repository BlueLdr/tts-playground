import * as Preact from "preact";
import { ensure_number, useStateIfMounted } from "~/view/utils";

export const EditorHeader: Preact.FunctionComponent<{
  reset: () => void;
  maxLength: number;
  setMaxLength: (value: number) => void;
}> = ({ maxLength, setMaxLength, reset }) => {
  const [open, set_open] = useStateIfMounted(false);
  return (
    <div className="tts-header">
      <div className="tts-header-top">
        <h4>TTS Message</h4>
        <button
          className="tts-settings-button"
          type="button"
          onClick={() => set_open(!open)}
        >
          <i className="fas fa-cog" />
        </button>
      </div>
      <div className="tts-settings" data-open={`${open}`}>
        <div className="row">
          <label className="tts-settings-char-limit">
            <span>Character Limit: {maxLength}</span>
            <input
              type="range"
              min={255}
              max={500}
              onInput={(e) =>
                setMaxLength(
                  ensure_number(
                    (e.target as HTMLInputElement).valueAsNumber,
                    255
                  )
                )
              }
              value={maxLength}
            />
          </label>
          <button className="btn btn-with-icon btn-negative" onClick={reset}>
            <i className="fas fa-undo" />
            Clear
          </button>
        </div>
      </div>
    </div>
  );
};
