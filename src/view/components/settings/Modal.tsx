import * as Preact from "preact";
import { useCallback } from "preact/hooks";
import { EDITOR_SETTINGS } from "~/model";
import {
  Modal,
  ModalHeader,
  GeneralSettings,
  OptimizationSettings,
} from "~/view/components";
import { useContextState, useStateObject } from "~/view/utils";

export const SettingsModal: Preact.FunctionComponent<{ dismiss }> = ({
  dismiss,
}) => {
  const [settings, set_settings] = useContextState(EDITOR_SETTINGS);
  const [form, set_form] = useStateObject(settings);
  const on_change_settings = useCallback(
    <K extends keyof TTS.EditorSettings>(
      key: K,
      value: TTS.EditorSettings[K]
    ) =>
      set_form({
        [key]: value,
      }),
    []
  );

  return (
    <Modal className="tts-settings-modal" dismiss={dismiss}>
      <ModalHeader dismiss={dismiss}>Settings</ModalHeader>
      <div className="modal-body">
        <GeneralSettings onChangeSettings={on_change_settings} form={form} />
        <OptimizationSettings
          onChangeSettings={on_change_settings}
          form={form}
        />
      </div>
      <div className="modal-footer">
        <button className="btn btn-large" onClick={dismiss}>
          Cancel
        </button>
        <button
          className="btn btn-large btn-primary"
          onClick={() => {
            set_settings(form);
            dismiss();
          }}
        >
          Save
        </button>
      </div>
    </Modal>
  );
};
