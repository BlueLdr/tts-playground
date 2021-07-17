import * as Preact from "preact";
import { useContext, useRef } from "preact/hooks";
import { EDITOR_STATE } from "~/model";
import { BitsInput, PauseAddControl } from "~/view/components";
import { useDebounce, useTextOptimization } from "~/view/utils";

export const EditorMain: Preact.FunctionComponent<{
  text: string;
  onChange: (text: string) => void;
  onSubmit: (text?: string) => void;
  inputRef: Preact.RefObject<HTMLTextAreaElement>;
  speed: boolean;
  setSpeed: (speed: boolean) => void;
  bits: string;
  setBits: (bits: string) => void;
  status: TTS.RequestStatus;
}> = ({
  text,
  onChange,
  onSubmit,
  speed,
  setSpeed,
  bits,
  setBits,
  status,
  inputRef,
}) => {
  const { max_length } = useContext(EDITOR_STATE).value;
  const bits_length = bits ? bits.length + 1 : 0;
  return (
    <p className="tts-textarea-container">
      <TTSTextArea
        inputRef={inputRef}
        id="tts-main-input"
        value={text}
        onChange={onChange}
        bitsString={bits}
        maxLength={max_length - bits_length}
        speed={speed}
      />
      <div className="tts-textarea-bottom">
        <div>
          Length:{" "}
          <span>
            {text.length + bits_length} / {max_length}
          </span>
        </div>
        <div>
          <label>
            <input
              type="checkbox"
              checked={speed}
              onInput={e => setSpeed((e.target as HTMLInputElement).checked)}
            />
            Speed Modifier
          </label>
        </div>
        <BitsInput bits={bits} setBits={setBits} />
        <PauseAddControl speedModified={speed} text={text} />
      </div>
      <div className="row">
        <div className="tts-textarea-submit">
          <button
            className="btn btn-primary"
            disabled={status.pending || !text}
            type="submit"
            onClick={e => {
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
  inputRef: Preact.RefObject<HTMLTextAreaElement>;
  speed: boolean;
  id: string;
  maxLength: number;
  bitsString: string;
}> = ({ value, onChange, speed, id, maxLength, bitsString, inputRef }) => {
  const preview_ref = useRef<HTMLDivElement>();
  const optimize_text = useTextOptimization(value, onChange, inputRef);
  const [on_blur, cancel_optimize] = useDebounce(optimize_text, 300);

  let end = "";
  const max_len = parseInt(`${maxLength}`);
  if (speed && max_len !== value.length) {
    end = "¡".repeat(Math.max(0, max_len - value.length - 1));
  }
  if (bitsString) {
    end += ` ${bitsString}`;
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
        onInput={e => onChange((e.target as HTMLTextAreaElement).value)}
        onBlur={() => on_blur(value)}
        onFocus={cancel_optimize}
        onSelect={() => {
          preview_ref.current?.setAttribute(
            "data-cursor",
            `${inputRef?.current?.selectionStart}`
          );
        }}
        onKeyDown={() => {
          preview_ref.current?.setAttribute(
            "data-cursor",
            `${inputRef?.current?.selectionStart}`
          );
        }}
        onKeyUp={() => {
          preview_ref.current?.setAttribute(
            "data-cursor",
            `${inputRef?.current?.selectionStart}`
          );
        }}
        onClick={() => {
          preview_ref.current?.setAttribute(
            "data-cursor",
            `${inputRef?.current?.selectionStart}`
          );
        }}
      />
      <div className="tts-textarea-preview" ref={preview_ref}>
        <span>{value.slice(0, maxLength)}</span>
        <span className="tts-textarea-preview-over-limit">
          {value.slice(maxLength)}
        </span>{" "}
        <span>{end}</span>
      </div>
    </div>
  );
};
