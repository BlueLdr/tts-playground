import * as Preact from "preact";
import { useCallback, useContext, useEffect, useRef } from "preact/hooks";
import { Modal, ModalHeader } from "~/view/components";
import { ensure_number, useModal, useStateIfMounted } from "~/view/utils";
import { ADD_SNIPPET_CALLBACK } from "~/model";

export const PAUSE_CHAR_SPEED_MODIFIED = "ᴾ";

export const SLASH_DURATION = 2.5 / 14; // seconds
export const MOD_PAUSE_CHAR_DURATION = 1.067 / 14; // seconds

export const generate_unmodified_pause = duration =>
  "/ ".repeat(Math.max(1, Math.round(duration / SLASH_DURATION)));
export const generate_modified_pause = duration =>
  PAUSE_CHAR_SPEED_MODIFIED.repeat(
    Math.max(1, Math.round(duration / MOD_PAUSE_CHAR_DURATION))
  );

export const generate_pause = (duration, preserve_speed = false) =>
  preserve_speed
    ? generate_modified_pause(duration)
    : generate_unmodified_pause(duration);

export const PauseAddControl: Preact.FunctionComponent<{
  text: string;
  speedModified: boolean;
  duration: number;
  onChangeDuration: (d: number) => void;
}> = ({ text, speedModified, duration, onChangeDuration }) => {
  const [open, set_open] = useStateIfMounted(false);
  const [preserve, set_preserve] = useStateIfMounted(speedModified);
  const input_ref = useRef<HTMLInputElement>();
  const on_add_pause = useContext(ADD_SNIPPET_CALLBACK).value;

  const dismiss = () => set_open(false);
  const add_pause = useCallback(() => {
    const str = generate_pause(duration, preserve);
    return `${!preserve && !text.endsWith(" ") ? " " : ""}${str}`;
  }, [duration, preserve, text, on_add_pause]);

  const on_right_click = useCallback(
    e => {
      e.preventDefault();
      on_add_pause(add_pause(), "end");
    },
    [add_pause]
  );

  useEffect(() => {
    if (open) {
      const focused = document.activeElement as HTMLElement;
      input_ref.current?.focus();
      return () => {
        input_ref.current?.blur();
        focused?.focus();
      };
    }
  }, [open]);

  useEffect(() => {
    if (speedModified !== preserve) {
      set_preserve(speedModified);
    }
  }, [speedModified]);

  const modal = (
    <Modal className="modal tts-pause-modal" dismiss={dismiss}>
      <ModalHeader dismiss={dismiss}>
        <h3>Add a Pause</h3>
      </ModalHeader>

      <div className="modal-body">
        <div className="row">
          <label className="tts-pause-modal-duration">
            <span>Pause Duration</span>
            <span>
              <input
                type="number"
                value={duration}
                min={0.1}
                max={10}
                step={0.1}
                onInput={e =>
                  onChangeDuration(
                    ensure_number(
                      (e.target as HTMLInputElement).valueAsNumber,
                      1
                    )
                  )
                }
              />
              seconds
            </span>
          </label>

          <label className="tts-pause-modal-checkbox" data-help="pause-speed">
            <input
              type="checkbox"
              checked={preserve}
              onInput={e =>
                set_preserve((e.target as HTMLInputElement).checked)
              }
            />
            Preserve Speed Modifiers
          </label>
        </div>
      </div>
      <div className="modal-footer">
        <button className="btn" onClick={dismiss}>
          Cancel
        </button>
        <button
          className="btn btn-primary"
          onClick={() => {
            on_add_pause(add_pause(), "end");
            dismiss();
          }}
        >
          Add
        </button>
      </div>
    </Modal>
  );

  return (
    <div className="tts-pause-control">
      <button
        className="btn"
        onClick={e => {
          if (e?.button === 2) {
            on_right_click(e);
          } else {
            set_open(true);
          }
        }}
        onContextMenu={on_right_click}
        data-help="pause-add"
      >
        Add Pause
      </button>
      {open && useModal(modal)}
    </div>
  );
};
