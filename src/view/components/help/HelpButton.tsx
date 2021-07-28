import * as Preact from "preact";
import { useCallback, useEffect } from "preact/hooks";
import { HELP_ITEM } from "~/model";
import { HELP_DATA } from "~/view/components/help/help-data";
import { useContextState, useStateIfMounted } from "~/view/utils";

const options: EventListenerOptions = { capture: true };
export const HelpButton: Preact.FunctionComponent = () => {
  const [item, set_item] = useContextState(HELP_ITEM);
  const [enabled, set_enabled] = useStateIfMounted(false);

  const silence_event = useCallback(e => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const click_listener = useCallback(e => {
    e.preventDefault();
    e.stopPropagation();
    if (e.target.id === "help-button") {
      set_enabled(false);
      return;
    }
    const key = e.target?.dataset?.help;
    if (!key) {
      return;
    }
    if (key in HELP_DATA) {
      set_item(HELP_DATA[key]);
    } else {
      set_item(HELP_DATA["not-found"]);
    }
  }, []);

  const esc_listener = useCallback(e => {
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      set_enabled(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      return;
    }
    const root = document.getElementById("app");
    if (!root) {
      if (enabled) {
        set_enabled(false);
      }
      return;
    }
    root.setAttribute("data-help-active", "true");
    window.addEventListener("mousedown", silence_event, options);
    window.addEventListener("mouseup", silence_event, options);
    window.addEventListener("click", click_listener, options);
    window.addEventListener("keydown", esc_listener);
    return () => {
      window.removeEventListener("mousedown", silence_event, options);
      window.removeEventListener("mouseup", silence_event, options);
      window.removeEventListener("click", click_listener, options);
      window.removeEventListener("keydown", esc_listener);
      root.removeAttribute("data-help-active");
    };
  }, [enabled]);

  useEffect(() => {
    set_enabled(false);
  }, [item]);

  return (
    <button
      id="help-button"
      className="btn btn-with-icon icon-only help-button"
      onClickCapture={e => {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        set_enabled(!enabled);
      }}
      disabled={!!item}
    >
      {enabled ? (
        <i className="fas fa-times" />
      ) : (
        <i class="far fa-question-circle" />
      )}
    </button>
  );
};
