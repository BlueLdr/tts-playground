import * as Preact from "preact";
import * as hooks from "preact/hooks";
import { add_item_to, replace_item_in } from "~/common";
import { useStateIfMounted, useStateRef, useValueRef } from "~/view/utils";

const reorder_disabled = (el: HTMLElement) =>
  el.getAttribute("data-disable-reorder") === "true" ||
  `${el.getAttribute("draggable")}` === "false";

export const move_organizer_item = <T extends any>(
  sections: OrganizerBaseProps<T>["sections"],
  grabbed: OrganizerGrabbedItem<T>,
  target: OrganizerIndex
) => {
  let result = sections;
  const cur_section = sections[grabbed.section_index];
  const new_section = { ...sections[target.section] };
  const old_data = cur_section.data.filter((_, i) => i !== grabbed.item_index);
  if (grabbed.section_index === target.section) {
    new_section.data = old_data;
  } else {
    result = replace_item_in(result, (_, i) => i === grabbed.section_index, {
      ...cur_section,
      data: old_data,
    });
  }

  new_section.data = add_item_to(new_section.data, grabbed.value, target.item);
  return replace_item_in(result, (_, i) => i === target.section, new_section);
};

export const move_organizer_section = <T extends any>(
  sections: OrganizerBaseProps<T>["sections"],
  grabbed: OrganizerGrabbedSection<T>,
  target: number
) => {
  if (grabbed.value && target > -1 && target !== grabbed.section_index) {
    const sects = sections.filter((_, i) => i !== grabbed.section_index);
    return add_item_to(sects, grabbed.value, target);
  }
};

export const useDragReorder = <T extends any>(
  sections: Preact.RefObject<OrganizerBaseProps<T>["sections"]>,
  callback: OrganizerBaseProps<T>["updateSections"]
) => {
  const [grabbed, set_grabbed, grabbed_ref] = useStateRef<OrganizerGrabbedItem<
    T | OrganizerSectionSpec<T>
  > | null>(null);
  const [target_index, set_target_index, target_index_ref] =
    useStateRef<OrganizerIndex | null>(null);
  const [all_closed, set_all_closed] = useStateIfMounted(false);

  const move_to_index = hooks.useCallback(
    <A extends T | OrganizerSectionSpec<T>>(
      target: OrganizerGrabbedItem<A>,
      new_index: OrganizerIndex
    ) => {
      let result;
      if (target.type === "section") {
        result = move_organizer_section(
          sections.current,
          target as OrganizerGrabbedSection<T>,
          new_index.section
        );
      } else if (target.type === "item") {
        result = move_organizer_item(
          sections.current,
          target as OrganizerGrabbedItem<T>,
          new_index
        );
      } else {
        return;
      }
      callback(result);
    },
    [callback]
  );

  const end_drag = hooks.useCallback(() => {
    set_grabbed(null);
    set_target_index(null);
    set_all_closed(false);
  }, []);

  const on_drag_over_section = hooks.useCallback(
    (section: number) => e => {
      e.preventDefault();
      if (grabbed_ref.current == null) {
        return;
      }
      if (
        grabbed_ref.current.type === "item" &&
        grabbed_ref.current.section_index === section
      ) {
        set_target_index(null);
        return;
      }
      set_target_index({ section, item: null });
    },
    []
  );
  const on_drag_over_item = hooks.useCallback(
    (section: number, item: number) => {
      if (grabbed_ref.current?.type !== "item") {
        return;
      }
      return e => {
        e.preventDefault();
        if (grabbed_ref.current == null) {
          return;
        }
        set_target_index({ section, item });
      };
    },
    []
  );

  const on_drop = hooks.useCallback(
    e => {
      e.preventDefault();
      e.stopPropagation();
      const grabbed_ = grabbed_ref.current;
      const target_index_ = target_index_ref.current;
      if (
        grabbed_ != null &&
        target_index_ != null &&
        (target_index_.section !== grabbed_.section_index ||
          target_index_.item !== grabbed_.item_index)
      ) {
        move_to_index(grabbed_, target_index_);
      }

      end_drag();
    },
    [move_to_index, target_index]
  );

  hooks.useEffect(() => {
    if (grabbed != null) {
      const listener = e => {
        if (grabbed_ref.current == null) {
          return;
        }
        if (target_index_ref.current != null) {
          on_drop(e);
          return;
        }
        e.preventDefault();
        e.stopPropagation();
        end_drag();
      };
      document.body.addEventListener("dragend", listener, { once: true });
      document.body.addEventListener("drop", listener, { once: true });
      document.body.addEventListener("mouseup", listener, { once: true });
      return () => {
        document.body.removeEventListener("dragend", listener);
        document.body.removeEventListener("mouseup", listener);
      };
    }
  }, [grabbed]);

  const get_section_props = (
    section: OrganizerSectionSpec<T>,
    index: number
  ): Omit<HTMLDivProps, "open"> => {
    const grabbed_ = grabbed_ref.current;
    const target = target_index_ref.current;
    return {
      onMouseDown: e => {
        e.stopPropagation();
      },
      onDragStartCapture: e => {
        if (reorder_disabled(e.currentTarget)) {
          e.preventDefault();
        } else {
          set_grabbed({
            type: "section",
            value: section,
            section_index: index,
            item_index: null,
          });
          setTimeout(() => {
            if (grabbed_ref.current?.type === "section") {
              set_all_closed(true);
            }
          }, 100);
        }
      },
      // @ts-expect-error:
      "data-grabbed": `${
        grabbed_?.type === "section" && grabbed_?.section_index === index
      }`,
      "data-drop-target": `${
        grabbed_?.type === "item" &&
        target?.section === index &&
        grabbed?.section_index !== index &&
        target.item === null
      }`,
    } as const;
  };

  return [
    grabbed,
    set_grabbed,
    target_index,
    get_section_props,
    all_closed,
    on_drag_over_section,
    on_drag_over_item,
    on_drop,
  ] as const;
};

const DRAG_HOVER_OPEN_SECTION_DELAY = 1000;
const clear_timer = t => {
  if (t?.current) {
    clearTimeout(t.current);
    t.current = null;
  }
};
export const useDragToOpen = <T extends any>(
  openSections: OrganizerBaseProps<T>["openSections"],
  setOpen: OrganizerBaseProps<T>["setOpen"],
  grabbed: OrganizerGrabbedItem<T | OrganizerSectionSpec<T>>
) => {
  const open_ref = useValueRef(openSections);
  const [, set_hovered, hovered_ref] = useStateRef<number | null>(null);
  const open_timer = hooks.useRef<any>(null);

  const set_open = hooks.useCallback(
    (index: number, section: OrganizerSectionSpec<T>) => {
      if (hovered_ref.current !== index) {
        return;
      }
      clear_timer(open_timer);
      setOpen(section.name, true);
    },
    [setOpen]
  );

  hooks.useEffect(() => {
    if (grabbed) {
      return () => {
        clear_timer(open_timer);
        set_hovered(null);
      };
    }
  }, [grabbed]);

  const onDragEnterSection = hooks.useCallback(
    (section: OrganizerSectionSpec<T>, index: number) => e => {
      if (
        !open_ref.current[section.name] &&
        e.target.classList.contains("organizer-reorder-area") &&
        e.target.getAttribute("data-type") === "section"
      ) {
        e.preventDefault();
        set_hovered(index);
        open_timer.current = setTimeout(() => {
          set_open(index, section);
        }, DRAG_HOVER_OPEN_SECTION_DELAY);
      }
    },
    [set_open]
  );
  const onDragExitSection = hooks.useCallback(
    (section: OrganizerSectionSpec<T>, index: number) => e => {
      if (
        !section.open &&
        !open_ref.current[section.name] &&
        e.target.classList.contains("organizer-reorder-area") &&
        e.target.getAttribute("data-type") === "section"
      ) {
        e.preventDefault();
        clear_timer(open_timer);
        set_hovered(null);
      }
    },
    [setOpen]
  );

  return [onDragEnterSection, onDragExitSection] as const;
};
