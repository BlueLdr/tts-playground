import * as Preact from "preact";
import { createPortal } from "preact/compat";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from "preact/hooks";
import { do_confirm } from "~/common";
import { ImmutableContextValue, MODAL_DIRTY } from "~/model";
import {
  getFirstFocusable,
  maybeClassName,
  useStateRef,
  useValueRef,
} from "~/view/utils";

export const Modal: Preact.FunctionComponent<
  {
    dismiss?: () => void;
    closeOnClickBackdrop?: boolean;
    backdropData?: object;
  } & HTMLDivProps
> = ({
  className,
  id,
  dismiss,
  closeOnClickBackdrop = true,
  children,
  backdropData,
  ...props
}) => {
  const modal_ref = useRef<HTMLDivElement>();
  const mounted = useRef(false);
  const silent = useRef(false);
  const on_focus = useCallback(e => {
    if (
      mounted.current &&
      (!(e.target instanceof Node) || !modal_ref.current?.contains(e.target))
    ) {
      e.stopPropagation();
      if (!silent.current) {
        silent.current = true;
        getFirstFocusable(modal_ref.current)?.focus();
        silent.current = false;
      }
    }
  }, []);

  useLayoutEffect(() => {
    mounted.current = true;
    getFirstFocusable(modal_ref.current)?.focus();
    window.addEventListener("focus", on_focus, { capture: true });
    return () => {
      window.removeEventListener("focus", on_focus, { capture: true });
      mounted.current = false;
    };
  }, []);

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
      {...backdropData}
    >
      <div
        id={id}
        ref={modal_ref}
        className={`modal${maybeClassName(className)}`}
        onClick={e => {
          e.stopPropagation();
          e.stopImmediatePropagation();
        }}
        {...props}
      >
        {children}
      </div>
    </div>
  );
};

export const ModalHeader: Preact.FunctionComponent<{
  dismiss: () => void;
  showCloseButton?: boolean;
}> = ({ children, dismiss, showCloseButton = true }) => {
  const has_children = useMemo(
    () =>
      !!children &&
      (!Array.isArray(children) ||
        children.some(c => c != null && c !== false && c !== "")),
    [children]
  );
  if (!has_children && !showCloseButton) {
    return null;
  }
  return (
    <div className="modal-header">
      <div className="modal-title">{children}</div>
      {showCloseButton && (
        <button className="icon-button modal-close" onClick={dismiss}>
          <i className="fas fa-times" />
        </button>
      )}
    </div>
  );
};

export const useModal = (
  container_selector: string = "#modal-container",
  dismiss_message?: string
) => {
  const container = useValueRef(document.querySelector(container_selector));
  const [dirty, set_dirty, dirty_ref] = useStateRef<boolean>(false);
  const [open, set_open, open_ref] = useStateRef<boolean>(false);
  const modal_dirty_ctx = useMemo(
    () => new ImmutableContextValue(dirty, set_dirty),
    [dirty, set_dirty]
  );

  const toggle_modal = useCallback((should_open: boolean) => {
    if (should_open || !dirty_ref.current) {
      set_open(should_open);
      return true;
    } else if (do_confirm(dismiss_message ?? "Discard changes?")) {
      set_dirty(false);
      set_open(false);
      return true;
    }
    return false;
  }, []);

  const content = useCallback(
    (props: Preact.RenderableProps<{}>) =>
      open_ref.current && container.current
        ? createPortal(
            <MODAL_DIRTY.Provider value={modal_dirty_ctx}>
              {props.children}
            </MODAL_DIRTY.Provider>,
            container.current
          )
        : null,
    []
  );

  return [content, toggle_modal, open] as const;
};
