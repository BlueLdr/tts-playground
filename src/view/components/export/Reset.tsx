import * as Preact from "preact";
import { reset_all_storage } from "~/common";
import { useStateIfMounted } from "~/view/utils";

export const ResetStorage: Preact.FunctionComponent<{ onCancel: () => void }> =
  ({ onCancel }) => {
    const [clear_help, set_clear_help] = useStateIfMounted(false);
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
          <label className="checkbox">
            <input
              type="checkbox"
              className="checkbox-input"
              checked={clear_help}
              onInput={() => set_clear_help(!clear_help)}
            />
            <span className="checkbox-label">Reset Tutorials</span>
          </label>
        </div>
        <div className="modal-footer">
          <button className="btn btn-large" onClick={onCancel}>
            Cancel
          </button>
          <button
            className="btn btn-large btn-negative"
            onClick={() => reset_all_storage(clear_help)}
          >
            Continue
          </button>
        </div>
      </Preact.Fragment>
    );
  };
