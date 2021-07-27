import * as Preact from "preact";
import { useCallback, useContext, useEffect } from "preact/hooks";
import { VOICE_NAMES } from "~/common";
import {
  EDITOR_SETTINGS,
  OPTIMIZE_MESSAGE_CALLBACK,
  OptimizeTrigger,
} from "~/model";
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
  const optimize_message = useContext(OPTIMIZE_MESSAGE_CALLBACK).value;
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
  useEffect(() => {
    if (maxLength !== value) {
      set_value(maxLength);
    }
  }, [maxLength]);
  return (
    <Preact.Fragment>
      <div className="tts-header">
        <div className="tts-header-top">
          <h4>TTS Message</h4>
          <div className="tts-header-controls">
            <button
              className="btn btn-with-icon icon-only btn-negative tts-options-reset"
              title="Clear the editor and start a new message"
              onClick={reset}
            >
              <i className="fas fa-undo" />
            </button>
          </div>
        </div>
        <div className="tts-options">
          <div className="tts-options-item tts-options-char-limit">
            <label
              for="tts-options-char-limit"
              className="tts-options-item-label"
            >
              Character Limit: {value}
            </label>
            <input
              id="tts-options-char-limit"
              className="tts-options-item-control"
              type="range"
              min={255}
              max={500}
              onInput={e => {
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
            className="tts-options-item tts-options-voice"
            title="Select a TTS voice"
          >
            <div className="tts-options-item-label">TTS Voice</div>
            <div className="tts-options-item-control">
              <select
                value={settings.voice}
                onChange={e =>
                  on_change_settings(
                    "voice",
                    (e.target as HTMLSelectElement).value
                  )
                }
              >
                {VOICE_NAMES.map(name => (
                  <option value={name} key={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div
            className="tts-options-item tts-options-trigger"
            title="Choose when message optimization is triggered. Optimization will eliminate unneeded characters (such as replacing 'you' with 'u') to maximize the amount of text you can fit within the character limit."
          >
            <button
              className="btn btn-large"
              onClick={() => optimize_message(OptimizeTrigger.manual)}
            >
              Optimize Message
            </button>
          </div>
        </div>
      </div>
    </Preact.Fragment>
  );
};
