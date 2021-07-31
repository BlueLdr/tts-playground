import * as Preact from "preact";

export const SnippetEffectDemo: Preact.FunctionComponent = () => {
  return (
    <div className="help-demo help-demo-snippet-effects">
      <div className="row tts-snippets-modal-text">
        <label
          className="tts-snippets-modal-prefix"
          title="Some snippets need to start with a different string than the repeated characters (e.g. the 'y' in yDRDRDR)."
        >
          <span>Prefix</span>
          <input value="y" readonly={true} />
        </label>
        <label className="tts-snippets-modal-input">
          <span>Main Text</span>
          <input value="PX" readonly={true} />
        </label>
        <label
          className="tts-snippets-modal-suffix"
          title="Text to insert after all repetitions of the snippet (e.g. punctuation)"
        >
          <span>Suffix</span>
          <input value="" readOnly={true} />
        </label>
      </div>
    </div>
  );
};
