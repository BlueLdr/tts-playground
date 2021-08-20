import * as Preact from "preact";
import { useContext, useMemo } from "preact/hooks";
import { MESSAGES } from "~/model";
import {
  export_message_category,
  export_messages,
  generate_file,
} from "~/view/components";

export const ExportMessageCategory: Preact.FunctionComponent<{
  category: TTS.MessageCategory;
}> = ({ category }) => {
  const messages = useContext(MESSAGES).value;
  const filename = useMemo(
    () =>
      `tts-message-category-${category.name
        ?.split(" ")
        .map(p =>
          p.length > 0 ? `${p[0].toUpperCase()}${p.slice(1).toLowerCase()}` : ""
        )
        .join("")
        .replace(/\W/gi, "")}.json`,
    [category]
  );
  const data = useMemo(() => {
    const cat: TTS.ExportedMessageCategory = {
      ...export_message_category(category),
      data: export_messages(messages.filter(m => category.data.includes(m.id))),
    };
    return generate_file(cat);
  }, [category, messages]);

  return (
    <a
      className="btn btn-with-icon"
      href={`data:application/json;charset=utf-8,${encodeURIComponent(data)}`}
      download={filename}
      data-help="export-message-category"
    >
      <i class="fas fa-share-square" />
      Export
    </a>
  );
};
