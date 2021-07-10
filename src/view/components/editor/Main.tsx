import * as Preact from "preact";
import { useContext } from "preact/hooks";
import { EDITOR_STATE } from "~/model";
import { PauseAddControl } from "~/view/components";

export const EditorMain: Preact.FunctionComponent<{
  text: string;
  onChange: (text: string) => void;
  onSubmit: (text?: string) => void;
  inputRef: Preact.Ref<HTMLTextAreaElement>;
  speed: boolean;
  setSpeed: (speed: boolean) => void;
  status: TTS.RequestStatus;
}> = ({ text, onChange, onSubmit, speed, setSpeed, status, inputRef }) => {
  const { max_length } = useContext(EDITOR_STATE).value;
  return (
    <p className="tts-textarea-container">
      <TTSTextArea
        inputRef={inputRef}
        id="tts-main-input"
        value={text}
        onChange={onChange}
        maxLength={max_length}
        speed={speed}
      />
      <div className="tts-textarea-bottom">
        <div>
          Length:{" "}
          <span>
            {text.length} / {max_length}
          </span>
        </div>
        <div>
          <label>
            Fill remainder with Speed Modifier (¡)
            <input
              type="checkbox"
              checked={speed}
              onInput={(e) => setSpeed((e.target as HTMLInputElement).checked)}
            />
          </label>
        </div>
        <PauseAddControl speedModified={speed} text={text} onAdd={onChange} />
      </div>
      <div className="row">
        <div className="tts-textarea-submit">
          <button
            className="btn btn-primary"
            disabled={status.pending || !text}
            type="submit"
            onClick={(e) => {
              e.preventDefault();
              onSubmit(text);
            }}
          >
            Submit
          </button>
        </div>
      </div>
    </p>
  );
};

export const TTSTextArea: Preact.FunctionComponent<{
  value: string;
  onChange: (text: string) => void;
  inputRef: Preact.Ref<HTMLTextAreaElement>;
  speed: boolean;
  id: string;
  maxLength: number;
}> = ({ value, onChange, speed, id, maxLength, inputRef }) => {
  let end = "";
  const max_len = parseInt(`${maxLength}`);
  if (speed && max_len !== value.length) {
    end = "¡".repeat(Math.max(0, max_len - value.length - 1));
  }
  return (
    <div className="tts-textarea">
      <textarea
        id={id}
        ref={inputRef}
        className="tts-textarea-input"
        value={value}
        rows={12}
        cols={82}
        maxLength={maxLength}
        onInput={(e) => onChange((e.target as HTMLTextAreaElement).value)}
      />
      <div className="tts-textarea-preview">
        <span>{value}</span> <span>{end}</span>
      </div>
    </div>
  );
};
