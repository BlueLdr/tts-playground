import * as Preact from "preact";
import { createPortal } from "preact/compat";
import { useCallback, useMemo } from "preact/hooks";
import * as hooks from "preact/hooks";
import { import_multiple_files } from "~/view/components";
import {
  upload_file,
  useStateIfMounted,
  useStateRef,
  useValueRef,
} from "~/view/utils";

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

export const useRenderPropsFunc = <T extends object>(
  render: (props: Preact.RenderableProps<T>) => Preact.VNode | null,
  inputs: any[],
  name: string
): Preact.ComponentType<T> => {
  const comp = useCallback(render, inputs);
  // @ts-expect-error:
  comp.displayName = name;
  return comp;
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

export const useCopyToClipboard = (text?: string, id?: string) => {
  return hooks.useCallback(async () => {
    const elem = document.getElementById(
      `clipboard-input${id ? `-${id}` : ""}`
    );
    if (!text || !(elem instanceof HTMLTextAreaElement)) {
      return Promise.reject();
    }
    const active = document.activeElement as HTMLElement;
    elem.value = text;
    elem.select();
    elem.setSelectionRange(0, 99999);
    elem.focus();
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

export const useDragAndDrop = (on_drop: (files: FileList) => Promise<void>) => {
  const [dragged, set_dragged] = useStateIfMounted(false);
  const on_start = useCallback(e => {
    e.preventDefault();
    e.stopPropagation();
    set_dragged(true);
  }, []);
  const on_finish = useCallback(() => set_dragged(false), []);
  const on_drop_ = useCallback(
    e => {
      e.preventDefault();
      e.stopPropagation();
      set_dragged(false);
      on_drop(e.dataTransfer.files);
      e.dataTransfer.clearData();
    },
    [on_drop]
  );

  return [
    dragged,
    useMemo(
      () => ({
        onDragOver: on_start,
        onDragEnter: on_start,
        onDrop: on_drop_,
        onDragLeave: on_finish,
        onDragExit: on_finish,
        onDragEnd: on_finish,
      }),
      [on_start, on_finish, on_drop_]
    ),
  ] as const;
};

export const useUploadFiles = (
  on_finish: (data: TTS.AnyExportData) => void,
  on_error?: (err: string) => void,
  form_ref?: Preact.RefObject<HTMLFormElement>
) => {
  return useCallback(
    (files: FileList) =>
      (() => {
        if (files.length > 1) {
          const loaded: Promise<TTS.AnyExportData>[] = [];
          for (let i = 0; i < files.length; i++) {
            loaded.push(upload_file(files.item(i)));
          }
          return Promise.all(loaded).then(data => {
            return import_multiple_files(...data);
          });
        }
        const input_file = files[0];
        if (!input_file) {
          return Promise.resolve();
        }
        return upload_file(input_file);
      })()
        .catch(err => {
          if (typeof err === "string") {
            on_error?.(err);
          } else {
            console.error(err);
          }
          return null;
        })
        .then(data => {
          form_ref?.current?.reset();
          if (data) {
            return on_finish(data);
          }
        }),
    [on_finish, on_error]
  );
};
