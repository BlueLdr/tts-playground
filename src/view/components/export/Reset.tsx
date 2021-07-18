import * as Preact from "preact";
import { reset_all_storage } from "~/common";

export const ResetStorage: Preact.FunctionComponent<{ onCancel: () => void }> =
  ({ onCancel }) => {
    return (
      <Preact.Fragment>
        <div className="modal-body tts-reset">
          <div className="tts-reset-icon">
            <i className="fas fa-exclamation-circle" />
          </div>
          <h1>WARNING</h1>
          <p>
            This operation cannot be reversed. Resetting storage will clear all
            saved messages, snippets, and settings, and restore the default
            sample data. If there's anything you might want to keep, go back and
            export the data before resetting.
          </p>
        </div>
        <div className="modal-footer">
          <button className="btn btn-large" onClick={onCancel}>
            Cancel
          </button>
          <button
            className="btn btn-large btn-negative"
            onClick={reset_all_storage}
          >
            Continue
          </button>
        </div>
      </Preact.Fragment>
    );
  };
