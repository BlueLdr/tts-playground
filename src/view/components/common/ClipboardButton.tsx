import * as Preact from "preact";
import { useCopyToClipboard, useTempAnimation } from "~/view/utils";

export const ClipboardButton: Preact.FunctionComponent<{
  id?: string;
  text: string;
  disabled?: boolean;
  className?: string;
}> = ({ id, text, disabled, className }) => {
  const [anim_active, trigger_anim, set_active] = useTempAnimation(2000);
  const copy = useCopyToClipboard(text, id);
  return (
    <button
      id={`tts-clipboard-button${id ? `-${id}` : ""}`}
      className={`btn tts-clipboard-button${className ? ` ${className}` : ""}`}
      data-success={`${anim_active}`}
      disabled={disabled}
      onMouseDown={() => set_active(false)}
      onClick={() =>
        copy()
          .then(trigger_anim)
          .catch(() => {
            console.error(`Failed to copy text to clipboard.`);
          })
      }
    >
      <div className="tts-clipboard-button-inner">
        <i className="fas fa-copy" />
        Copy to Clipboard
      </div>
    </button>
  );
};
