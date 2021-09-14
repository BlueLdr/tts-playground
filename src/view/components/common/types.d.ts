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
  selected: T extends { data: (infer F)[] }
    ? ExpandableChecklistItem<F>[]
    : T extends (infer F)[]
    ? ExpandableChecklistItem<F>[]
    : boolean;
  Render: preact.ComponentType<{ data: T }>;
}

interface MaybeClass {
  className?: string;
}

interface OrganizerSectionSpec<T> {
  name: string;
  open: boolean;
  data: T[];
}

interface OrganizerHeaderProps {
  className: string;
  buttons: preact.ComponentChildren;
  reorderEnabled: boolean;
}

interface OrganizerSectionHeaderControlsProps<T> {
  section: OrganizerSectionSpec<T>;
  index: number;
}

interface OrganizerSectionExtrasProps<T> {
  section: OrganizerSectionSpec<T>;
  id: string | number;
}

interface OrganizerItemProps<T> {
  data: T;
  buttons: preact.ComponentChildren;
  reorderEnabled: boolean;
}

interface OrganizerProps<T> extends MaybeClass {
  RenderHeader: preact.ComponentType<OrganizerHeaderProps>;
  RenderSectionHeaderControls: preact.ComponentType<
    OrganizerSectionHeaderControlsProps<T>
  >;
  RenderSectionExtras?: preact.ComponentType<OrganizerSectionExtrasProps<T>>;
  RenderItem: preact.ComponentType<OrganizerItemProps<T>>;
  getSectionHeaderProps: (section: OrganizerSectionSpec<T>) => HTMLDivProps;
  getItemKey: (
    section: OrganizerSectionSpec<T>,
    item: T,
    index: number
  ) => string | number;
  sections: OrganizerSectionSpec<T>[];
  reorderEnabled: boolean;
  setReorderEnabled: (val: boolean) => void;
  updateSections: (val: OrganizerSectionSpec<T>[]) => void;
}

interface OrganizerBaseProps<T> extends MaybeClass, OrganizerProps<T> {
  openSections: { [key: string]: boolean };
  setOpen: (name: string, open: boolean) => void;
}

interface OrganizerGrabbedItem<T> {
  type: "item" | "section";
  value: T;
  item_index: number | null;
  section_index: number;
}

type OrganizerGrabbedSection<T> = OrganizerGrabbedItem<OrganizerSectionSpec<T>>;

interface OrganizerIndex {
  section: number;
  item: number;
}
