import * as Preact from "preact";

export const SnippetEffectDemo: Preact.FunctionComponent = () => {
  return (
    <div className="help-demo help-demo-snippet-effects">
      <div className="row tts-snippets-modal-text">
        <label className="tts-snippets-modal-prefix">
          <span>Prefix</span>
          <input value="y" readonly={true} />
        </label>
        <label className="tts-snippets-modal-input">
          <span>Main Text</span>
          <input value="PX" readonly={true} />
        </label>
        <label className="tts-snippets-modal-suffix">
          <span>Suffix</span>
          <input value="" readOnly={true} />
        </label>
      </div>
    </div>
  );
};
