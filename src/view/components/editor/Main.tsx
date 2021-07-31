import * as Preact from "preact";
import { useCallback, useContext, useEffect, useRef } from "preact/hooks";
import { SPEED_CHAR } from "~/common";
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
  listeners: EventListenersOf<HTMLTextAreaElement>;
}> = ({
  text,
  setState,
  onSubmit,
  speed,
  bits,
  status,
  inputRef,
  listeners,
}) => {
  const { max_length, pause_duration } = useContext(EDITOR_STATE).value;
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
  const on_change_pause_duration = useCallback(
    (duration: number) => setState({ pause_duration: duration }),
    [setState]
  );
  return (
    <p className="tts-textarea-container">
      <TTSTextArea
        inputRef={inputRef}
        id="tts-main-input"
        value={text}
        onChangeText={on_change_text}
        bitsString={bits}
        maxLength={max_length - bits_length}
        speed={speed}
        {...listeners}
      />
      <div className="tts-textarea-bottom">
        <div className="tts-textarea-length">
          Length: <span>{text.length + bits_length}</span>
          {" / "}
          <span>{max_length}</span>
        </div>
        <div>
          <label
            className="checkbox"
            data-tutorial="speed-overview"
            data-help="speed-overview"
          >
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
        <PauseAddControl
          speedModified={speed}
          text={text}
          duration={pause_duration}
          onChangeDuration={on_change_pause_duration}
        />
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

export const TTSTextArea: Preact.FunctionComponent<
  {
    value: string;
    onChangeText: (text: string) => void;
    inputRef: Preact.RefObject<HTMLTextAreaElement>;
    speed: boolean;
    maxLength: number;
    bitsString: string;
  } & Omit<HTMLTextAreaProps, "value">
> = ({
  value,
  onChangeText,
  speed,
  id,
  maxLength,
  bitsString,
  inputRef,
  onMouseUp,
  onKeyUp,
  onChange,
}) => {
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

  const update_cursor_pos = useCallback(() => {
    preview_ref.current?.setAttribute(
      "data-cursor",
      `${inputRef?.current?.selectionStart}`
    );
  }, []);

  let end = "";
  const max_len = parseInt(`${maxLength}`);
  if (speed && max_len !== value.length) {
    end = SPEED_CHAR.repeat(Math.max(0, max_len - value.length - 1));
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
        onInput={e => {
          onChange?.bind(e.target)?.(e);
          onChangeText((e.target as HTMLTextAreaElement).value);
        }}
        onBlur={() => optimize(OptimizeTrigger.blur)}
        onFocus={cancel_optimize}
        onKeyDown={e => {
          if (
            (e.key === "z" || e.key === "Z") &&
            (e.ctrlKey || e.metaKey) &&
            !e.altKey
          ) {
            e.preventDefault();
          } else if (
            (e.key === "c" || e.key === "C") &&
            (e.ctrlKey || e.metaKey) &&
            !e.altKey &&
            !e.shiftKey &&
            inputRef.current?.selectionStart === 0 &&
            inputRef.current?.selectionEnd === value.length
          ) {
            e.preventDefault();
            e.stopPropagation();
            document.getElementById("tts-clipboard-button")?.click();
            return;
          }
          update_cursor_pos();
        }}
        onKeyUp={function (e) {
          onKeyUp?.bind(e.target)?.(e);
          update_cursor_pos();
        }}
        onClick={update_cursor_pos}
        onSelect={update_cursor_pos}
        onMouseUp={onMouseUp}
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
