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
    (new_value) => {
      if (mounted.current) {
        setValue(new_value);
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
    (new_value) => {
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

export const useValueRef = <T>(value: T) => {
  const ref = hooks.useRef<T>(value);
  ref.current = value;
  return ref;
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
        .then((res) => {
          set_state({ pending: false, success: true, error: null });
          return res;
        })
        .catch((err) => {
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
