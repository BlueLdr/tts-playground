import * as Preact from "preact";

export const LoadingApp: Preact.FunctionComponent = () => (
  <div className="tts-loading">
    <div className="tts-submit-status">
      <i className="fas fa-circle-notch" />
    </div>
    <h2>Setting things up...</h2>
  </div>
);
