import * as Preact from "preact";
import { useStateIfMounted } from "~/view/utils";
import { useContext, useEffect } from "preact/hooks";
import { EDITOR_SETTINGS } from "~/model";
import { DEFAULT_BITS_STRING } from "~/common";

export const BitsInput: Preact.FunctionComponent<{
  bits: string;
  setBits: (bits: string) => void;
}> = ({ bits, setBits }) => {
  const default_str =
    useContext(EDITOR_SETTINGS).value?.bits_string ?? DEFAULT_BITS_STRING;
  const [enabled, set_enabled] = useStateIfMounted(!!bits);
  const [value, set_value] = useStateIfMounted(bits || default_str);
  useEffect(() => {
    if (enabled && bits && bits !== value) {
      set_value(bits);
    } else if (enabled && !bits) {
      set_enabled(false);
    }
  }, [bits]);

  useEffect(() => {
    if (enabled && value && value !== bits) {
      setBits(value);
    }
  }, [value]);

  useEffect(() => {
    if (enabled && value && value !== bits) {
      setBits(value);
    } else if (!enabled) {
      setBits("");
    }
  }, [enabled]);

  return (
    <div className="tts-textarea-bits">
      <label className="tts-textarea-bits-checkbox">
        <input
          type="checkbox"
          checked={enabled}
          onInput={e => set_enabled((e.target as HTMLInputElement).checked)}
        />
        Use Bits
      </label>
      <input
        className="tts-textarea-bits-string"
        value={value}
        disabled={!enabled}
        onChange={
          enabled
            ? e => {
                const str = (e.target as HTMLInputElement).value.trim();
                if (str) {
                  set_value(str);
                }
              }
            : undefined
        }
        onBlur={
          enabled
            ? e => {
                if (!(e.target as HTMLInputElement).value.trim()) {
                  set_value(default_str);
                }
              }
            : undefined
        }
      />
    </div>
  );
};
