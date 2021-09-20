import * as Preact from "preact";
import { useCallback, useEffect, useMemo } from "preact/hooks";
import { replace_item_in } from "~/common";
import { Category } from "~/view/components";
import {
  classNamesWithSuffix,
  useDragReorder,
  useDragToOpen,
  useStateIfMounted,
  useStateRef,
  useValueRef,
} from "~/view/utils";

const prevent_default = e => e.preventDefault();

const OrganizerSectionControls = <T extends any>({
  index,
  target,
  grabbed,
  onDragEnter,
  disabled,
}: Preact.RenderableProps<{
  index: number;
  grabbed: OrganizerGrabbedItem<T | OrganizerSectionSpec<T>> | null;
  target: OrganizerIndex | null;
  onDragEnter: (section: number) => (e) => void;
  disabled?: boolean;
}>) => {
  const drag_index =
    grabbed?.type !== "section" || index >= grabbed.section_index
      ? index
      : index + 1;
  return disabled ? null : (
    <Preact.Fragment>
      {index === 0 && grabbed?.type === "section" && (
        <div
          data-type="section"
          data-before="true"
          data-active={`${
            target?.section === 0 && grabbed?.section_index !== 0
          }`}
          className="organizer-reorder-area"
          onDragOver={prevent_default}
          onDragEnter={onDragEnter(0)}
        />
      )}
      <div className="icon-button organizer-section-reorder-button">
        <i className="fas fa-grip-lines" />
      </div>
      <div
        data-type="section"
        data-active={`${
          target?.section === drag_index &&
          grabbed?.section_index !== drag_index
        }`}
        className="organizer-reorder-area"
        onDragEnter={onDragEnter(drag_index)}
        onDragOver={prevent_default}
      />
    </Preact.Fragment>
  );
};

const OrganizerItem = <T extends any>({
  className,
  reorderEnabled,
  index,
  item,
  sectionIndex,
  grabbed,
  setGrabbed,
  target,
  onDragEnter,
  children,
}: Preact.RenderableProps<{
  className: string;
  reorderEnabled: boolean;
  item: T;
  index: number;
  sectionIndex: number;
  grabbed: OrganizerGrabbedItem<T | OrganizerSectionSpec<T>> | null;
  setGrabbed: (item: OrganizerGrabbedItem<T> | null) => void;
  target: OrganizerIndex | null;
  onDragEnter: (section: number, item: number) => (e) => void;
}>) => {
  const grabbed_is_item = grabbed?.type === "item";
  const drag_index =
    grabbed_is_item &&
    sectionIndex === grabbed.section_index &&
    index >= grabbed.item_index
      ? index
      : index + 1;
  const will_move =
    grabbed_is_item &&
    (sectionIndex !== grabbed.section_index ||
      (index !== grabbed.item_index && drag_index !== grabbed.item_index));
  return (
    <div
      className={className}
      draggable={reorderEnabled}
      {...(reorderEnabled
        ? {
            onMouseDown: e => {
              e.stopPropagation();
              setGrabbed({
                type: "item",
                value: item,
                item_index: index,
                section_index: sectionIndex,
              });
            },
            "data-grabbed": `${
              grabbed_is_item &&
              grabbed.section_index === sectionIndex &&
              grabbed.item_index == index
            }`,
          }
        : {})}
    >
      {reorderEnabled && index === 0 && grabbed?.type === "item" && (
        <div
          data-type="item"
          data-before="true"
          data-active={`${
            grabbed_is_item &&
            (sectionIndex !== grabbed.section_index ||
              grabbed.item_index !== 0) &&
            target?.section === sectionIndex &&
            target?.item === 0
          }`}
          className="organizer-reorder-area"
          onDragEnter={onDragEnter(sectionIndex, 0)}
          onDragOver={prevent_default}
        />
      )}
      {children}
      {reorderEnabled && (
        <div
          data-type="item"
          data-active={`${
            will_move &&
            target?.section === sectionIndex &&
            target?.item === drag_index
          }`}
          className="organizer-reorder-area"
          onDragEnter={onDragEnter(sectionIndex, drag_index)}
          onDragOver={prevent_default}
        />
      )}
    </div>
  );
};

const OrganizerBase = <T extends any>({
  RenderHeader,
  RenderSectionHeaderControls,
  RenderSectionExtras,
  RenderItem,
  getSectionHeaderProps,
  getItemKey,
  sections,
  updateSections,
  reorderEnabled,
  setReorderEnabled,
  cancel,
  save,
  openSections,
  setOpen,
  className,
}: Preact.RenderableProps<OrganizerBaseProps<T>>): Preact.VNode | null => {
  const sections_ref = useValueRef(sections);
  const update_section = useCallback(
    (name: string, value: OrganizerSectionSpec<T>) => {
      updateSections(
        replace_item_in(sections_ref.current, c => c.name === name, value)
      );
      setOpen(name, value.open);
    },
    [updateSections]
  );

  const class_names = useCallback(
    (suffix: string) => classNamesWithSuffix(suffix, "organizer", className),
    [className]
  );

  const [
    grabbed,
    set_grabbed,
    target_index,
    get_section_props,
    all_closed,
    on_drag_over_section,
    on_drag_over_item,
    on_drop,
  ] = useDragReorder(sections_ref, updateSections);

  const [on_drag_enter_section, on_drag_leave_section] = useDragToOpen(
    openSections,
    setOpen,
    grabbed
  );

  return (
    <div className={class_names("")} onDropCapture={on_drop}>
      <RenderHeader
        className={class_names("-header")}
        buttons={
          reorderEnabled ? (
            <Preact.Fragment>
              <button className="btn" onClick={cancel}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={save}>
                Save
              </button>
            </Preact.Fragment>
          ) : (
            <button
              className="icon-button organizer-reorder-button"
              onClick={() => setReorderEnabled(true)}
              title="Organize this list"
              data-help="organize"
            >
              <i class="fas fa-sort" />
            </button>
          )
        }
        reorderEnabled={reorderEnabled}
      />
      <div
        className={class_names("-list")}
        data-reorder={`${reorderEnabled}`}
        data-item-grabbed={`${!!grabbed}`}
        data-grabbed-type={grabbed?.type}
        data-target-is-section={`${
          grabbed?.type === "item" && target_index?.item == null
        }`}
      >
        {sections.map((s, i) => {
          const force_open = reorderEnabled
            ? openSections[s.name] && !s.open
            : false;
          const ext_props = getSectionHeaderProps(s);
          return (
            <div
              key={s.name}
              className={class_names("-section-container")}
              {...(grabbed?.type === "item"
                ? {
                    onDragEnterCapture: on_drag_enter_section(s, i),
                    onDragLeaveCapture: on_drag_leave_section(s, i),
                    onDragOverCapture: prevent_default,
                  }
                : {})}
            >
              <Category
                className={class_names("-section")}
                title={s.name}
                open={
                  (grabbed?.type === "section" &&
                    grabbed?.section_index === i) ||
                  all_closed
                    ? false
                    : force_open || s.open
                }
                setOpen={
                  grabbed
                    ? () => {}
                    : force_open
                    ? () => setOpen(s.name, false)
                    : () => update_section(s.name, { ...s, open: !s.open })
                }
                toggleOnClickTitle={!reorderEnabled}
                controls={
                  reorderEnabled ? (
                    <OrganizerSectionControls
                      index={i}
                      target={target_index}
                      grabbed={grabbed}
                      onDragEnter={on_drag_over_section}
                      disabled={
                        grabbed?.type === "section" &&
                        ext_props?.draggable === false
                      }
                    />
                  ) : (
                    <RenderSectionHeaderControls section={s} index={i} />
                  )
                }
                {...(reorderEnabled ? get_section_props(s, i) : {})}
                draggable={reorderEnabled}
                {...ext_props}
              >
                {s.data.map((item, j) => {
                  const key = getItemKey(s, item, j);
                  return (
                    <OrganizerItem
                      className={class_names("-section-item")}
                      reorderEnabled={reorderEnabled}
                      item={item}
                      index={j}
                      sectionIndex={i}
                      grabbed={grabbed}
                      setGrabbed={set_grabbed}
                      target={target_index}
                      onDragEnter={on_drag_over_item}
                    >
                      <RenderItem
                        key={key}
                        data={item}
                        reorderEnabled={reorderEnabled}
                        buttons={
                          reorderEnabled ? (
                            <button className="btn icon-button">
                              <i class="fas fa-grip-lines" />
                            </button>
                          ) : null
                        }
                      />
                    </OrganizerItem>
                  );
                })}
                {RenderSectionExtras && (
                  <RenderSectionExtras section={s} id={s.name} />
                )}
              </Category>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const Organizer = <T extends any>(
  props: Preact.RenderableProps<OrganizerProps<T>>
): Preact.VNode | null => {
  const { sections, updateSections, reorderEnabled, setReorderEnabled } = props;
  const [state, set_state] = useStateIfMounted(sections);
  const opened = useMemo(() => {
    let opened_: { [key: string]: boolean } = {};
    sections.forEach(s => {
      opened_[s.name] = s.open;
    });
    return opened_;
  }, [sections]);
  const [vis_open, set_vis_open, vis_open_ref] = useStateRef(opened);
  const set_section_open = useCallback((name: string, open: boolean) => {
    set_vis_open({ ...vis_open_ref.current, [name]: open });
  }, []);

  const cancel = useCallback(() => {
    set_state(sections);
    setReorderEnabled(false);
  }, [sections]);

  const save = useCallback(() => {
    updateSections(state);
    setReorderEnabled(false);
  }, [state, updateSections]);

  useEffect(() => {
    set_state(sections);
    set_vis_open(opened);
  }, [sections]);

  return (
    <OrganizerBase
      {...props}
      sections={reorderEnabled ? state : sections}
      updateSections={reorderEnabled ? set_state : updateSections}
      setOpen={set_section_open}
      openSections={vis_open}
      cancel={cancel}
      save={save}
    />
  );
};
