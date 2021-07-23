import * as Preact from "preact";
import { useCallback, useEffect } from "preact/hooks";
import { maybeClassName } from "~/view/utils";

export const Modal: Preact.FunctionComponent<{
  className?: string;
  id?: string;
  dismiss: () => void;
}> = ({ className, id, dismiss, children }) => {
  const listener = useCallback(e => {
    if (e.key === "Escape") {
      dismiss();
    }
  }, []);
  useEffect(() => {
    window.addEventListener("keydown", listener);
    return () => {
      window.removeEventListener("keydown", listener);
    };
  }, [listener]);

  return (
    <div
      className="modal-backdrop"
      onClick={e => {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        dismiss();
      }}
    >
      <div
        id={id}
        className={`modal${maybeClassName(className)}`}
        onClick={e => {
          e.preventDefault();
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
    <h3>{children}</h3>
    <button className="icon-button modal-close" onClick={dismiss}>
      <i className="fas fa-times" />
    </button>
  </div>
);
