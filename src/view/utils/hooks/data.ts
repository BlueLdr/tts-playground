import * as hooks from "preact/hooks";

const useMounted = () => {
  const mounted = hooks.useRef<boolean>(true);
  hooks.useEffect(
    () => () => {
      mounted.current = false;
    },
    []
  );
  return mounted;
};

// useState, but prevents setState from being called after the component unmounts
export const useStateIfMounted = <T>(initial_value: T) => {
  const mounted = useMounted();
  const [value, setValue] = hooks.useState<T>(initial_value);
  const setter: hooks.StateUpdater<T> = hooks.useCallback(
    new_value => {
      if (mounted.current) {
        setValue(new_value);
      }
    },
    [setValue, mounted]
  );
  return [value, setter] as const;
};

// useState, but emulates the functionality of state/setState in a class component
export const useStateObject = <T extends object>(initial_value: T) => {
  const mounted = useMounted();
  const [value, setValue] = hooks.useState<T>(initial_value);
  const setter = hooks.useCallback(
    (new_state: Partial<T> | ((prev_state: T) => T)) => {
      if (!mounted.current) {
        return;
      }
      if (typeof new_state === "function") {
        setValue(new_state);
      } else {
        setValue(prev_state => ({
          ...prev_state,
          ...new_state,
        }));
      }
    },
    [setValue, mounted]
  );
  return [value, setter] as const;
};

export const useStateRef = <
  T extends string | number | boolean | object | null
>(
  initial_value: T
) => {
  const mounted = useMounted();
  const value_ref = hooks.useRef<T>(initial_value);
  const [value, setValue] = hooks.useState<T>(initial_value);
  const setter: hooks.StateUpdater<T> = hooks.useCallback(
    new_value => {
      if (mounted.current) {
        value_ref.current =
          typeof new_value === "function"
            ? new_value(value_ref.current)
            : new_value;
        setValue(new_value);
      }
    },
    [setValue, mounted]
  );
  return [value, setter, value_ref] as const;
};

export const useStateWithRef = <
  T extends string | number | boolean | object | null
>(
  initial_value: T,
  value_ref: preact.RefObject<T>
) => {
  const mounted = useMounted();
  const [value, setValue] = hooks.useState<T>(initial_value);
  hooks.useEffect(() => {
    value_ref.current = initial_value;
  }, []);
  const setter: hooks.StateUpdater<T> = hooks.useCallback(
    new_value => {
      if (mounted.current) {
        value_ref.current =
          typeof new_value === "function"
            ? new_value(value_ref.current)
            : new_value;
        setValue(new_value);
      }
    },
    [setValue, mounted]
  );
  return [value, setter] as const;
};

export const useValueRef = <T>(value: T) => {
  const ref = hooks.useRef<T>(value);
  ref.current = value;
  return ref;
};

export const useMemoRef = <T>(factory: () => T, inputs: any[]) => {
  const value = hooks.useMemo(factory, inputs);
  return useValueRef(value);
};

export const useRequestStatus = <T extends any[], R>(
  send_request: (...args: T) => Promise<R>
) => {
  const [state, set_state] = useStateIfMounted({
    pending: false,
    success: false,
    error: null,
  });
  const make_request = hooks.useCallback(
    (...args: T) => {
      set_state({ pending: true, success: false, error: null });
      return send_request(...args)
        .then(res => {
          set_state({ pending: false, success: true, error: null });
          return res;
        })
        .catch(err => {
          set_state({ pending: false, success: false, error: err });
          return err;
        });
    },
    [send_request]
  );

  return [state, make_request] as const;
};

export const useContextState = <V, S>(
  ctx: preact.Context<{ value: V; setValue: S }>
) => {
  const { value, setValue } = hooks.useContext(ctx);
  return [value, setValue] as const;
};

export const useCallbackAfterUpdate = <Args extends any[]>(
  do_update: (...args: Args) => void,
  callback: preact.RefObject<() => void>,
  inputs: any[]
) => {
  const invoke_callback = hooks.useRef(false);
  hooks.useEffect(() => {
    if (invoke_callback.current && callback.current) {
      callback.current?.();
      invoke_callback.current = false;
    }
  }, inputs);
  const call_do_update = hooks.useCallback(
    (...args: Args) => {
      invoke_callback.current = true;
      do_update(...args);
    },
    [do_update]
  );
  const call_manual_callback = hooks.useCallback(() => {
    invoke_callback.current = false;
    callback.current?.();
  }, []);

  return [call_do_update, call_manual_callback];
};
