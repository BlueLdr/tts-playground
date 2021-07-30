import * as Preact from "preact";
import { createPortal } from "preact/compat";
import * as hooks from "preact/hooks";
import { useStateRef, useValueRef } from "~/view/utils";

const window_listener_options = { once: true };
export const useHoldClick = (
  on_click: (e?: any) => void,
  on_end_click: (e?: any) => void,
  repeat_delay: number = 150,
  initial_delay: number = 750
) => {
  const [clicked, set_clicked, clicked_ref] = useStateRef<boolean>(false);
  const on_click_ref = useValueRef(on_click);
  const on_end_click_ref = useValueRef(on_end_click);
  const delay = useValueRef(repeat_delay);
  const timer = hooks.useRef<any>();

  const repeat_click = hooks.useCallback(() => {
    if (!clicked_ref.current) {
      return;
    }
    if (timer.current) {
      clearTimeout(timer.current);
    }
    on_click_ref.current?.();
    timer.current = setTimeout(repeat_click, delay.current);
  }, []);
  const cancel = hooks.useCallback(() => {
    set_clicked(false);
    clearTimeout(timer.current);
    timer.current = null;
  }, []);

  hooks.useEffect(() => {
    if (!clicked) {
      return;
    }
    timer.current = setTimeout(repeat_click, initial_delay);

    window.addEventListener("mouseup", cancel, window_listener_options);
    window.addEventListener("blur", cancel, window_listener_options);
    return () => {
      on_end_click_ref.current?.();
      window.removeEventListener("mouseup", cancel);
      window.removeEventListener("blur", cancel);
    };
  }, [clicked]);

  const onMouseDown = hooks.useCallback(e => {
    e.initialClick = true;
    on_click_ref.current?.(e);
    set_clicked(true);
  }, []);

  return hooks.useMemo(() => {
    const l: any = { onMouseDown };
    if (clicked) {
      l.onMouseLeave = cancel;
    }
    return l;
  }, [clicked]);
};

export const useModal = (
  content: Preact.VNode | null,
  container_selector: string = "#modal-container"
) => {
  const container = document.querySelector(container_selector);
  if (container && content) {
    return createPortal(content, container);
  }
  return null;
};

export const useTempAnimation = (duration: number, delay?: number) => {
  const timer = hooks.useRef<any>();
  const [active, set_active, active_ref] = useStateRef<boolean>(false);
  const reset = hooks.useCallback(() => {
    set_active(false);
    if (timer.current) {
      clearTimeout(timer.current);
    }
    timer.current = null;
  }, []);
  const trigger = hooks.useCallback(() => {
    if (active_ref.current) {
      reset();
    }
    if (timer.current) {
      clearTimeout(timer.current);
    }
    if (delay) {
      timer.current = setTimeout(() => {
        set_active(true);
        timer.current = setTimeout(reset, duration);
      }, delay);
    } else {
      set_active(true);
      timer.current = setTimeout(reset, duration);
    }
  }, [duration, delay]);

  hooks.useEffect(() => {
    if (active) {
      return () => {
        if (timer.current) {
          clearTimeout(timer.current);
        }
        timer.current = null;
      };
    }
  }, [active]);

  return [active, trigger, set_active] as const;
};

export const useCopyToClipboard = (text?: string) => {
  return hooks.useCallback(async () => {
    const elem = document.getElementById("clipboard-input");
    if (!text || !(elem instanceof HTMLTextAreaElement)) {
      return Promise.reject();
    }
    const active = document.activeElement as HTMLElement;
    elem.value = text;
    elem.focus();
    elem.select();
    elem.setSelectionRange(0, 99999);
    const success = document.execCommand("copy");
    elem.value = "";
    elem.blur();
    active?.focus();
    return success ? Promise.resolve() : Promise.reject();
  }, [text]);
};

export const useDebounce = <T extends any[]>(
  callback: (...args: T) => void,
  delay: number = 150
) => {
  const timer = hooks.useRef<any>(null);
  const cb = hooks.useCallback(
    (...args: T) => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
      timer.current = setTimeout(() => {
        callback(...args);
        clearTimeout(timer.current);
        timer.current = null;
      }, delay);
    },
    [callback]
  );

  const cancel = hooks.useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);

  hooks.useEffect(() => {
    return () => {
      clearTimeout(timer.current);
      timer.current = null;
    };
  }, [callback]);

  return [cb, cancel] as const;
};
