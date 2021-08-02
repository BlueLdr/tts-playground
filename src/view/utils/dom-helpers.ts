export const maybeClassName = (className?: string) =>
  className ? ` ${className}` : "";

export const silence_event: EventListener = e => {
  e.preventDefault();
  e.stopPropagation();
};

// potentially focusable = would be focusable if the element
// doesn't have [tabindex="-1"]
// https://stackoverflow.com/a/38865836
export const POTENTIAL_FOCUSABLE_SELECTORS = [
  "a[href]",
  "area[href]",
  'input:not([disabled]):not([type="hidden"])',
  "select:not([disabled])",
  "textarea:not([disabled])",
  "button:not([disabled])",
  "iframe",
  "object",
  "embed",
  "*[tabindex]:not([tabindex='-1'])",
  "*[contenteditable]",
];
export const FOCUSABLE_SELECTORS = POTENTIAL_FOCUSABLE_SELECTORS.map(s => {
  const extra = ":not([tabindex='-1'])";
  return s.endsWith(extra) ? s : `${s}:not([tabindex='-1'])`;
});

// get first focusable element in a container
export const getFirstFocusable = (
  container: HTMLElement,
  prefix?: string
): HTMLElement => {
  if (!prefix) {
    return container.querySelector(FOCUSABLE_SELECTORS.join(", "));
  }
  return container.querySelector(
    FOCUSABLE_SELECTORS.map(s => `${prefix} ${s}`).join(", ")
  );
};
