import * as Preact from "preact";
import { useCallback, useEffect, useRef } from "preact/hooks";
import { ensure_number, useModal, useStateIfMounted } from "~/view/utils";

export const PAUSE_CHAR_SPEED_MODIFIED = "ᴾ";

export const SLASH_DURATION = 2.5 / 14; // seconds
export const MOD_PAUSE_CHAR_DURATION = 1.067 / 14; // seconds

export const generate_unmodified_pause = (duration) =>
  "/ ".repeat(Math.max(1, Math.round(duration / SLASH_DURATION)));
export const generate_modified_pause = (duration) =>
  PAUSE_CHAR_SPEED_MODIFIED.repeat(
    Math.max(1, Math.round(duration / MOD_PAUSE_CHAR_DURATION))
  );

export const generate_pause = (duration, preserve_speed = false) =>
  preserve_speed
    ? generate_modified_pause(duration)
    : generate_unmodified_pause(duration);

export const PauseAddControl: Preact.FunctionComponent<{
  text: string;
  onAdd: (text: string) => void;
  speedModified: boolean;
}> = ({ text, onAdd, speedModified }) => {
  const [open, set_open] = useStateIfMounted(false);
  const [duration, set_duration] = useStateIfMounted(1);
  const [preserve, set_preserve] = useStateIfMounted(speedModified);
  const input_ref = useRef<HTMLInputElement>();

  const dismiss = () => set_open(false);
  const add_pause = useCallback(() => {
    const str = generate_pause(duration, preserve);
    return `${!preserve && !text.endsWith(" ") ? " " : ""}${str}`;
  }, [duration, preserve, text]);

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

  const modal = (
    <div className="modal-backdrop">
      <div className="modal tts-pause-modal">
        <div className="modal-header">
          <h3>Add a Pause</h3>
        </div>

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
                  onInput={(e) =>
                    set_duration(
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

            <label className="tts-pause-modal-checkbox">
              <input
                type="checkbox"
                checked={preserve}
                onInput={(e) =>
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
              onAdd(add_pause());
              dismiss();
            }}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="tts-pause-control">
      <button className="btn" onClick={() => set_open(true)}>
        Add Pause
      </button>
      {open && useModal(modal)}
    </div>
  );
};
