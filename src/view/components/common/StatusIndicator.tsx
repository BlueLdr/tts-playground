import * as Preact from "preact";

export const StatusIndicator: Preact.FunctionComponent<{
  status: TTS.RequestStatus;
}> = ({ status }) => (
  <div className="tts-submit-status">
    {status.pending ? (
      <i className="fas fa-circle-notch" />
    ) : status.success ? (
      <i className="fas fa-check-circle" />
    ) : status.error ? (
      <i className="fas fa-exclamation-circle" />
    ) : null}
  </div>
);
