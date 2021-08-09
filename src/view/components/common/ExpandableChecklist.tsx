import * as Preact from "preact";
import { useCallback, useEffect, useRef } from "preact/hooks";
import { replace_item_in } from "~/common";
import { Checkbox } from "~/view/components";
import { useMemoRef, useValueRef } from "~/view/utils";

export const ExpandableChecklist = <T extends any>({
  items,
  onChange,
  label,
  allowCheckAll = true,
  parent,
}: Preact.RenderableProps<ExpandableChecklistProps<T>>) => {
  const parent_ref = useValueRef(parent);
  const on_change = useCallback(
    (n_items: ExpandableChecklistItem<T>[]) =>
      onChange(n_items, parent_ref.current),
    [onChange]
  );

  const [
    check_all_ref,
    all_selected,
    on_check,
    on_check_all,
    on_change_nested,
  ] = useChecklist(items, on_change, allowCheckAll);

  return (
    <details className="expandable-checklist">
      <summary className="expandable-checklist-label">
        {allowCheckAll && (
          <Checkbox
            ref={check_all_ref}
            checked={all_selected}
            onInput={() => on_check_all()}
            onClick={e => {
              e.stopPropagation();
            }}
          />
        )}
        <span className="checkbox-label">{label}</span>
      </summary>
      <ul className="expandable-checklist-items">
        {items.map(item => {
          const { Render, key, selected, data } = item;
          return (
            <li key={key} className="expandable-checklist-item">
              {Array.isArray(selected) ? (
                <ExpandableChecklist
                  key={key}
                  items={selected}
                  label={<Render data={data} />}
                  onChange={on_change_nested}
                  parent={item}
                />
              ) : (
                <Checkbox checked={selected} onInput={() => on_check(item)}>
                  {<Render data={data} />}
                </Checkbox>
              )}
            </li>
          );
        })}
      </ul>
    </details>
  );
};

const all_are_selected = <T extends any>(
  items: ExpandableChecklistItem<T>[]
): boolean =>
  items.every(i =>
    Array.isArray(i.selected) ? all_are_selected(i.selected) : i.selected
  );

const none_are_selected = <T extends any>(
  items: ExpandableChecklistItem<T>[]
): boolean =>
  items.every(i =>
    Array.isArray(i.selected) ? none_are_selected(i.selected) : !i.selected
  );

const check_all_recursive = <T extends any>(
  items: ExpandableChecklistItem<T>[],
  checked: boolean
): ExpandableChecklistItem<T>[] =>
  // @ts-expect-error:
  items.map(i => ({
    ...i,
    selected: Array.isArray(i.selected)
      ? check_all_recursive(
          i.selected as ExpandableChecklistItem<any>[],
          checked
        )
      : checked,
  }));

const useChecklist = <T extends any, N extends T[]>(
  items: ExpandableChecklistItem<T>[],
  onChange: (items: ExpandableChecklistItem<T>[]) => void,
  allowCheckAll: boolean
) => {
  const check_all_ref = useRef<HTMLInputElement>();
  const items_ref = useValueRef(items);

  const all_selected = useMemoRef(
    () => (allowCheckAll ? all_are_selected(items) : false),
    [items, allowCheckAll]
  );

  const none_selected = useMemoRef(
    () => (allowCheckAll ? none_are_selected(items) : false),
    [items, allowCheckAll]
  );

  useEffect(() => {
    if (check_all_ref.current) {
      check_all_ref.current.indeterminate =
        !all_selected.current && !none_selected.current;
    }
  }, [all_selected.current, none_selected.current]);

  const on_check = useCallback(
    (item: ExpandableChecklistItem<T>) =>
      !Array.isArray(item.selected)
        ? onChange(
            // @ts-expect-error:
            replace_item_in(items_ref.current, i => i.key === item.key, {
              ...item,
              selected: !item.selected,
            })
          )
        : undefined,
    [onChange]
  );

  const on_check_all = useCallback(
    () =>
      onChange(
        check_all_recursive(
          items_ref.current,
          !none_selected.current ? !all_selected.current : true
        )
      ),
    [onChange]
  );

  const on_change_nested = useCallback(
    (
      n_items: ExpandableChecklistItem<any>[],
      parent: ExpandableChecklistItem<T>
    ) => {
      return parent
        ? onChange(
            replace_item_in(items_ref.current, i => i.key === parent.key, {
              ...parent,
              // @ts-expect-error:
              selected: n_items,
            })
          )
        : onChange(n_items);
    },

    [onChange]
  );

  return [
    check_all_ref,
    !none_selected.current,
    on_check,
    on_check_all,
    on_change_nested,
  ] as const;
};
