import * as Preact from "preact";
import { useCallback, useEffect } from "preact/hooks";
import { HelpModal, useModal } from "~/view/components";
import { HELP_DATA } from "~/view/components/help/help-data";
import { silence_event, useHelpItem, useStateRef } from "~/view/utils";

const options: EventListenerOptions = { capture: true };
export const HelpButton: Preact.FunctionComponent = () => {
  const [enabled, set_enabled, enabled_ref] = useStateRef<boolean>(false);
  const [key, on_click_item, is_tutorial] = useHelpItem(enabled);
  const item = key ? HELP_DATA[key] || HELP_DATA["not-found"] : null;

  const click_listener = useCallback(e => {
    if (enabled_ref.current) {
      silence_event(e);
    }
    if (enabled_ref.current && e.target.id === "help-button") {
      set_enabled(false);
      return;
    }
    on_click_item(e);
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
    window.addEventListener("keydown", esc_listener);
    return () => {
      window.removeEventListener("mousedown", silence_event, options);
      window.removeEventListener("mouseup", silence_event, options);
      window.removeEventListener("keydown", esc_listener);
      root.removeAttribute("data-help-active");
    };
  }, [enabled]);

  useEffect(() => {
    if (!item) {
      window.addEventListener("click", click_listener, options);
      return () => {
        window.removeEventListener("click", click_listener, options);
      };
    }
  }, [item]);

  const [ModalContainer, toggle_modal] = useModal();

  useEffect(() => {
    set_enabled(false);
    toggle_modal(!!item);
  }, [item]);

  return (
    <Preact.Fragment>
      <button
        id="help-button"
        data-help-intro-highlight={key === "intro-help"}
        className="header-button help-button"
        onClickCapture={e => {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          set_enabled(!enabled);
        }}
        disabled={!!key}
      >
        {enabled ? (
          <i className="fas fa-times" />
        ) : (
          <i class="far fa-question-circle" />
        )}
      </button>
      <ModalContainer>
        <HelpModal isTutorial={is_tutorial} />
      </ModalContainer>
    </Preact.Fragment>
  );
};
