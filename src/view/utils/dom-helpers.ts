import { validate_import_data } from "~/view/components";

export const maybeClassName = (className?: string) =>
  className ? ` ${className}` : "";

export const classNamesWithSuffix = (suffix: string, ...names: string[]) =>
  names
    .filter(n => !!n)
    .map(n => `${n}${suffix}`)
    .join(" ");

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

export const upload_file = input_file =>
  new Promise<TTS.AnyExportData>((resolve, reject) => {
    if (input_file.type !== "application/json") {
      return reject("You must select a valid JSON file.");
    }
    const reader = new FileReader();

    reader.onload = ev => {
      if (ev.target) {
        try {
          const new_data = JSON.parse(ev.target["result"] as string);
          const validated = validate_import_data(new_data);
          if (validated) {
            resolve(validated);
          } else {
            reject(
              "That file did not contain any data that could be imported."
            );
          }
        } catch (err) {
          console.error(`Failed to parse import file:`, err);
          reject("You must select a valid JSON file.");
        }
      }
    };
    reader.readAsText(input_file);
  });
