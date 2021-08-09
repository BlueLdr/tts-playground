type PropsOfElem<T extends HTMLElement> = preact.JSX.HTMLAttributes<T>;
type HTMLInputProps = PropsOfElem<HTMLInputElement> & {
  defaultValue?: string | number | undefined;
};

type HTMLButtonProps = PropsOfElem<HTMLButtonElement>;
type HTMLTextAreaProps = PropsOfElem<HTMLTextAreaElement> & {
  defaultValue?: string | number | undefined;
};
type HTMLDivProps = PropsOfElem<HTMLDivElement>;

type EventListenerKeysOf<
  E extends HTMLElement,
  A = Omit<
    Required<preact.JSX.HTMLAttributes<E>>,
    "download" | "inlist" | "key"
  >
> = {
  [K in keyof A]: A[K] extends preact.JSX.EventHandler<
    preact.JSX.TargetedEvent<E>
  >
    ? A[K] extends Function
      ? K
      : never
    : never;
}[keyof A];

type EventListenersOf<
  E extends HTMLElement,
  A = preact.JSX.HTMLAttributes<E>
> = Partial<Pick<preact.JSX.HTMLAttributes<E>, EventListenerKeysOf<E>>>;

interface ExpandableChecklistProps<T> {
  items: ExpandableChecklistItem<T>[];
  label: preact.ComponentChildren;
  onChange: (
    items: ExpandableChecklistItem<T>[],
    parent?: ExpandableChecklistItem<any>
  ) => void;
  allowCheckAll?: boolean;
  parent?: ExpandableChecklistItem<any>;
}

interface ExpandableChecklistItem<T> {
  data: T;
  key: string | number;
  selected: T extends (infer F)[]
    ? ExpandableChecklistItem<F>[]
    : T extends { data: (infer F)[] }
    ? ExpandableChecklistItem<F>[]
    : boolean;
  Render: preact.ComponentType<{ data: T }>;
}
