import * as Preact from "preact";
import { classNamesWithSuffix } from "~/view/utils";

export const Category: Preact.FunctionComponent<
  {
    title: string;
    controls?: Preact.ComponentChildren;
    open: boolean;
    setOpen: (value: boolean) => void;
  } & Omit<HTMLDivProps, "title" | "controls" | "open">
> = ({
  title,
  controls,
  open,
  setOpen,
  className,
  onClick,
  children,
  ...props
}) => {
  const class_names = (suffix: string) =>
    classNamesWithSuffix(suffix, "category", className);
  return (
    <div className={class_names("")} data-open={`${open}`}>
      <div className={class_names("-header")} {...props}>
        <div
          className={class_names("-title")}
          onClick={e => {
            setOpen(!open);
            // @ts-expect-error:
            onClick?.(e);
          }}
        >
          <div className={class_names("-expand")}>
            {open ? (
              <i className="fas fa-chevron-down" />
            ) : (
              <i className="fas fa-chevron-right" />
            )}
          </div>
          <span>{title}</span>
        </div>
        {controls && <div className="category-header-controls">{controls}</div>}
      </div>
      <div className={class_names("-content")}>{children}</div>
    </div>
  );
};
