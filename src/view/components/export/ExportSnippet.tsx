import * as Preact from "preact";
import { useMemo } from "preact/hooks";
import { export_snippet, generate_file } from "~/view/components";

export const ExportSnippet: Preact.FunctionComponent<{ snippet: TTS.Snippet }> =
  ({ snippet }) => {
    const filename = useMemo(
      () =>
        `tts-snippet-${`${snippet.options.prefix}${snippet.text}${snippet.options.suffix}`.replace(
          /\W/gi,
          ""
        )}.json`,
      [snippet]
    );

    const data = useMemo(
      () => generate_file(export_snippet(snippet)),
      [snippet]
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
