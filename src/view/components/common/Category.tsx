import * as Preact from "preact";
import { classNamesWithSuffix } from "~/view/utils";

export const Category: Preact.FunctionComponent<
  {
    title: string;
    controls?: Preact.ComponentChildren;
    open: boolean;
    setOpen: (value: boolean) => void;
    toggleOnClickTitle?: boolean;
  } & Omit<HTMLDivProps, "title" | "controls" | "open">
> = ({
  title,
  controls,
  open,
  setOpen,
  className,
  onClick,
  children,
  toggleOnClickTitle = true,
  ...props
}) => {
  const toggle = e => {
    setOpen(!open);
    // @ts-expect-error:
    onClick?.(e);
  };
  const class_names = (suffix: string) =>
    classNamesWithSuffix(suffix, "category", ...className.split(" "));
  return (
    <div className={class_names("")} data-open={`${open}`}>
      <div className={class_names("-header")} {...props}>
        <div
          className={class_names("-title")}
          data-toggle={`${toggleOnClickTitle}`}
          onClick={toggleOnClickTitle ? toggle : undefined}
        >
          <button
            className={`${class_names("-expand")} icon-button`}
            onClick={toggleOnClickTitle ? undefined : toggle}
            onMouseDown={
              toggleOnClickTitle
                ? undefined
                : e => {
                    e.stopPropagation();
                    e.preventDefault();
                  }
            }
          >
            {open ? (
              <i className="fas fa-chevron-down" />
            ) : (
              <i className="fas fa-chevron-right" />
            )}
          </button>
          <span>{title}</span>
        </div>
        {controls && <div className="category-header-controls">{controls}</div>}
      </div>
      <div className={class_names("-content")}>{children}</div>
    </div>
  );
};
