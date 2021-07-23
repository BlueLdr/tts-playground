import * as Preact from "preact";
import { useCallback, useContext, useEffect, useRef } from "preact/hooks";
import {
  EDITOR_SETTINGS,
  EDITOR_STATE,
  OPTIMIZE_MESSAGE_CALLBACK,
  OptimizeTrigger,
} from "~/model";
import { BitsInput, PauseAddControl } from "~/view/components";
import { useDebounce } from "~/view/utils";

export const EditorMain: Preact.FunctionComponent<{
  text: string;
  setState: <T extends TTS.EditorState>(
    new_state: Partial<T> | ((prev_state: T) => T)
  ) => void;
  onSubmit: (text?: string) => void;
  inputRef: Preact.RefObject<HTMLTextAreaElement>;
  speed: boolean;
  bits: string;
  status: TTS.RequestStatus;
}> = ({ text, setState, onSubmit, speed, bits, status, inputRef }) => {
  const { max_length } = useContext(EDITOR_STATE).value;
  const bits_length = bits ? bits.length + 1 : 0;
  const on_change_text = useCallback(
    (text: string) => setState({ text }),
    [setState]
  );
  const on_change_bits = useCallback(
    (bits: string) => setState({ bits }),
    [setState]
  );
  const on_change_speed = useCallback(
    (speed: boolean) => setState({ speed }),
    [setState]
  );
  return (
    <p className="tts-textarea-container">
      <TTSTextArea
        inputRef={inputRef}
        id="tts-main-input"
        value={text}
        onChange={on_change_text}
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
              onInput={e =>
                on_change_speed((e.target as HTMLInputElement).checked)
              }
            />
            Speed Modifier
          </label>
        </div>
        <BitsInput bits={bits} setBits={on_change_bits} />
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
  const settings = useContext(EDITOR_SETTINGS).value;
  const optimize_text = useContext(OPTIMIZE_MESSAGE_CALLBACK).value;
  const preview_ref = useRef<HTMLDivElement>();
  const [optimize, cancel_optimize] = useDebounce(optimize_text, 300);
  const [optimize_delayed, cancel_delayed_optimize] = useDebounce(
    optimize_text,
    5000
  );
  useEffect(() => {
    if (settings.optimize_words === OptimizeTrigger.stop) {
      optimize_delayed(OptimizeTrigger.stop);
    } else if (settings.optimize_words >= OptimizeTrigger.edit) {
      optimize(OptimizeTrigger.edit);
    }
    return () => {
      cancel_optimize();
      cancel_delayed_optimize();
    };
  }, [value]);

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
        onBlur={() => optimize(OptimizeTrigger.blur)}
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
