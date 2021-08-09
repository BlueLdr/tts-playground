import * as Preact from "preact";
import { forwardRef } from "preact/compat";
import { maybeClassName } from "~/view/utils";

export type CheckboxProps = { label?: Preact.ComponentChildren } & Omit<
  HTMLInputProps,
  "ref" | "type"
>;
export const Checkbox: Preact.FunctionComponent<CheckboxProps> = forwardRef<
  HTMLInputElement,
  CheckboxProps
>(({ label, className, children, ...props }, ref) => (
  <label className={`checkbox${maybeClassName(className)}`}>
    <input ref={ref} type="checkbox" className="checkbox-input" {...props} />
    {(label || children) && (
      <span className="checkbox-label">{label || children}</span>
    )}
  </label>
));
