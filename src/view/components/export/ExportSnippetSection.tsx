import * as Preact from "preact";
import { useMemo } from "preact/hooks";
import { export_snippets_section, generate_file } from "~/view/components";

export const ExportSnippetsSection: Preact.FunctionComponent<{
  section: TTS.SnippetsSection;
}> = ({ section }) => {
  const filename = useMemo(
    () =>
      `tts-snippets-section-${section.name
        ?.split(" ")
        .map(p =>
          p.length > 0 ? `${p[0].toUpperCase()}${p.slice(1).toLowerCase()}` : ""
        )
        .join("")
        .replace(/\W/gi, "")}.json`,
    [section]
  );
  const data = useMemo(
    () => generate_file(export_snippets_section(section)),
    [section]
  );

  return (
    <a
      className="btn btn-with-icon"
      href={`data:application/json;charset=utf-8,${encodeURIComponent(data)}`}
      download={filename}
      data-help="export-snippet"
    >
      <i class="fas fa-share-square" />
      Export
    </a>
  );
};
