import * as Preact from "preact";

const data: TTS.Snippet = {
  text: "Main",
  options: {
    space_after: true,
    space_before: true,
    prefix: "pre",
    suffix: "?^",
    default_count: 1,
  },
};

export const SnippetTextDemo: Preact.FunctionComponent = () => {
  return (
    <div className="help-demo help-demo-snippet-text">
      <div className="snippet">
        <div
          className="snippet-space-before"
          data-show={`${data.options.space_before}`}
        >
          <div className="help-demo-snippet-text-label">Space Before</div>
        </div>
        {data.options.prefix && (
          <div className="snippet-prefix">
            <span>{data.options.prefix}</span>
            <div className="help-demo-snippet-text-label">Prefix</div>
          </div>
        )}
        <div className="snippet-text">
          <span>{data.text}</span>
          <div className="help-demo-snippet-text-label">Main Text</div>
        </div>
        {data.options.suffix && (
          <div className="snippet-suffix">
            <span>{data.options.suffix}</span>
            <div className="help-demo-snippet-text-label">Suffix</div>
          </div>
        )}
        <div
          className="snippet-space-after"
          data-show={`${data.options.space_after}`}
        >
          <div className="help-demo-snippet-text-label">Space After</div>
        </div>
      </div>
    </div>
  );
};
