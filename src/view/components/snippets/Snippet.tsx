import * as Preact from "preact";
import { maybeClassName } from "~/view/utils";

export const Snippet: Preact.FunctionComponent<{
  data: TTS.Snippet;
  className?: string;
  showRepeats?: boolean;
}> = ({ data, className, showRepeats }) => {
  return (
    <div className={`snippet tts-text${maybeClassName(className)}`}>
      <div
        className="snippet-space-before"
        data-show={`${data.options.space_before}`}
      />
      {data.options.prefix && (
        <div className="snippet-prefix">{data.options.prefix}</div>
      )}
      <div className="snippet-text">{data.text}</div>
      {showRepeats && data.options.default_count > 1 && (
        <div
          className="snippet-text-repeats"
          title={`Repeat Count: ${data.options.default_count}`}
        >
          {data.text.repeat(data.options.default_count - 1)}
        </div>
      )}
      {data.options.suffix && (
        <div className="snippet-suffix">{data.options.suffix}</div>
      )}
      <div
        className="snippet-space-after"
        data-show={`${data.options.space_after}`}
      />
    </div>
  );
};
