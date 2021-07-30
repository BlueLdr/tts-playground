import * as Preact from "preact";
import { useCopyToClipboard, useTempAnimation } from "~/view/utils";

export const ClipboardButton: Preact.FunctionComponent<{
  text: string;
  disabled?: boolean;
  className?: string;
}> = ({ text, disabled, className }) => {
  const [anim_active, trigger_anim, set_active] = useTempAnimation(2000);
  const copy = useCopyToClipboard(text);
  return (
    <button
      id="tts-clipboard-button"
      className={`btn tts-clipboard-button${className ? ` ${className}` : ""}`}
      data-success={`${anim_active}`}
      disabled={disabled}
      onMouseDown={() => set_active(false)}
      onClick={() =>
        copy()
          .then(trigger_anim)
          .catch(() => {})
      }
    >
      <div className="tts-clipboard-button-inner">
        <i className="fas fa-copy" />
        Copy to Clipboard
      </div>
    </button>
  );
};
