import * as Preact from "preact";
import { useCallback, useEffect } from "preact/hooks";
import { maybeClassName } from "~/view/utils";

export const Modal: Preact.FunctionComponent<{
  className?: string;
  id?: string;
  dismiss: () => void;
  closeOnClickBackdrop?: boolean;
}> = ({ className, id, dismiss, closeOnClickBackdrop = true, children }) => {
  const listener = useCallback(e => {
    if (e.key === "Escape") {
      e.stopPropagation();
      e.preventDefault();
      dismiss();
    }
  }, []);
  useEffect(() => {
    const root = document.getElementById("app");
    root?.setAttribute("data-modal-open", "true");
    const capture = document.querySelectorAll(".modal-backdrop").length > 1;
    if (closeOnClickBackdrop) {
      window.addEventListener("keydown", listener, { capture });
    }
    return () => {
      window.removeEventListener("keydown", listener, { capture });
      if (document.querySelectorAll(".modal-backdrop").length === 1) {
        root?.removeAttribute("data-modal-open");
      }
    };
  }, [listener]);

  return (
    <div
      className="modal-backdrop"
      onClick={e => {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        if (closeOnClickBackdrop) {
          dismiss();
        }
      }}
    >
      <div
        id={id}
        className={`modal${maybeClassName(className)}`}
        onClick={e => {
          e.stopPropagation();
          e.stopImmediatePropagation();
        }}
      >
        {children}
      </div>
    </div>
  );
};

export const ModalHeader: Preact.FunctionComponent<{ dismiss: () => void }> = ({
  children,
  dismiss,
}) => (
  <div className="modal-header">
    <div className="modal-title">{children}</div>
    <button className="icon-button modal-close" onClick={dismiss}>
      <i className="fas fa-times" />
    </button>
  </div>
);
