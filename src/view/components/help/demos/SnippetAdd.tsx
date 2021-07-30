import * as Preact from "preact";
import { useCallback, useEffect, useRef } from "preact/hooks";
import { SnippetsRow } from "~/view/components";
import { useInsertSnippet, useStateIfMounted } from "~/view/utils";

const snippet: TTS.Snippet = {
  text: "TEXT",
  options: {
    prefix: "pre",
    suffix: "post",
    space_before: true,
    space_after: true,
    default_count: 1,
  },
};
const noop = () => {};
const noop_async = () => new Promise<void>(() => {});
export const SnippetAddDemo: Preact.FunctionComponent = ({}) => {
  const input_ref = useRef<HTMLTextAreaElement>();
  const [text, set_text] = useStateIfMounted(
    "This is a sample message. Blablabla."
  );
  const insert_snippet = useInsertSnippet(text, 400, input_ref);
  const add_to_message = useCallback(
    (str: string, flag?: "start" | "end") => {
      const new_text = insert_snippet(str, flag);
      set_text(new_text);
      return new_text;
    },
    [insert_snippet]
  );

  useEffect(() => {
    if (!input_ref.current) {
      return;
    }
    input_ref.current?.focus();
    input_ref.current.selectionStart = 25;
    input_ref.current.selectionEnd = 25;
  }, []);

  return (
    <div className="help-demo help-demo-snippet-add">
      <h4 className="help-demo-prompt">Try it out:</h4>
      <div className="help-demo-snippet-add-content">
        <textarea
          ref={input_ref}
          className="tts-textarea-input"
          value={text}
          rows={4}
          cols={40}
          onInput={e => {
            set_text((e.target as HTMLTextAreaElement).value);
          }}
        />
        <SnippetsRow
          row={snippet}
          updateRow={noop}
          onClickDelete={noop}
          onClickEdit={noop}
          previewText={noop_async}
          addToMessage={add_to_message}
        />
      </div>
    </div>
  );
};
