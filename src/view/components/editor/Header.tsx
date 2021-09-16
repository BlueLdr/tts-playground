import * as Preact from "preact";
import { useContext, useEffect, useRef } from "preact/hooks";
import { VOICE_NAMES } from "~/common";
import { OPTIMIZE_MESSAGE_CALLBACK, OptimizeTrigger } from "~/model";
import { ensure_number, useDebounce, useStateIfMounted } from "~/view/utils";

export const EditorHeader: Preact.FunctionComponent<{
  reset: () => void;
  maxLength: number;
  setMaxLength: (value: number) => void;
  voice: string;
  setVoice: (value: string) => void;
  message: TTS.Message;
}> = ({ maxLength, setMaxLength, voice, setVoice, reset, message }) => {
  const optimize_message = useContext(OPTIMIZE_MESSAGE_CALLBACK).value;
  const refocus_target = useRef<HTMLElement | null>();

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
        <div className="tts-header-top tts-col-header">
          <h4>Editor: {message.name || "New Message"}</h4>
          <div className="tts-header-controls">
            <button
              className="btn btn-with-icon icon-only btn-negative tts-options-reset"
              title="Clear the editor and start a new message"
              onClick={reset}
              data-help="reset-editor"
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
                data-help="editor-voice"
                value={voice}
                onChange={e => setVoice((e.target as HTMLSelectElement).value)}
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
            title="Manually trigger message optimization. This will eliminate unneeded characters (such as replacing 'you' with 'u') to maximize the amount of text you can fit within the character limit."
          >
            <button
              className="btn btn-large"
              onFocus={e => {
                refocus_target.current = e.relatedTarget as HTMLElement;
              }}
              onClick={() =>
                optimize_message(OptimizeTrigger.manual, refocus_target.current)
              }
              data-help="optimize-manual"
            >
              Optimize Message
            </button>
          </div>
        </div>
      </div>
    </Preact.Fragment>
  );
};
