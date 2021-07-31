import * as Preact from "preact";
import { useMemo } from "preact/hooks";
import { export_messages, generate_file } from "~/view/components";

export const ExportMessage: Preact.FunctionComponent<{ message: TTS.Message }> =
  ({ message }) => {
    const filename = useMemo(
      () =>
        `tts-message-${message.name
          .split(" ")
          .map(p =>
            p.length > 0
              ? `${p[0].toUpperCase()}${p.slice(1).toLowerCase()}`
              : ""
          )
          .join("")
          .replace(/\W/gi, "")}.json`,
      [message]
    );

    const data = useMemo(
      () => generate_file(export_messages([message])[0]),
      [message]
    );

    return (
      <a
        className="btn btn-large btn-with-icon"
        href={`data:application/json;charset=utf-8,${encodeURIComponent(data)}`}
        download={filename}
        data-help="export-message"
      >
        <i class="fas fa-share-square" />
        Export
      </a>
    );
  };
