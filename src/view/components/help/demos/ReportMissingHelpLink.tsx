import * as Preact from "preact";
import { useContext, useMemo } from "preact/hooks";
import { REPOSITORY_URL } from "~/common";
import { HELP_ITEM } from "~/model";

const MISSING_HELP_ISSUE_TITLE = (key: string) =>
  `Missing Help Data for "${key}"`;
const MISSING_HELP_ISSUE_BODY = (elem: string) =>
  `Found on element "${elem || "unknown"}"`;

export const ReportMissingHelpLink: Preact.FunctionComponent = () => {
  const help_item = useContext(HELP_ITEM).value;
  const url = useMemo(() => {
    const source_elem =
      document.querySelector(`[data-help="${help_item}"]`) ||
      document.querySelector(`[data-tutorial="${help_item}"]`);

    let selector = "";
    let el = source_elem;
    while (el instanceof HTMLElement) {
      let classes = "";
      el.classList.forEach(c => {
        classes += `.${c}`;
      });
      const this_selector = `${el.nodeName.toLowerCase()}${
        el.id ? `#${el.id}` : ""
      }${classes}`;
      selector = selector ? `${this_selector} ${selector}` : this_selector;
      el = el.parentElement;
    }

    const query: any = {
      title: MISSING_HELP_ISSUE_TITLE(help_item),
      body: MISSING_HELP_ISSUE_BODY(selector),
      labels: "bug",
    };

    return `${REPOSITORY_URL}/issues/new?${Object.entries(query)
      .map(([key, value]) => `${key}=${encodeURIComponent(value as any)}`)
      .join("&")}`;
  }, [help_item]);

  if (!help_item) {
    return null;
  }
  return (
    <a href={url} target="_blank">
      Report this issue
    </a>
  );
};
