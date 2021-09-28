import * as Preact from "preact";
import { useCallback, useContext, useEffect } from "preact/hooks";
import { deep_equals } from "~/common";
import { EDITOR_SETTINGS, MODAL_DIRTY } from "~/model";
import {
  Modal,
  ModalHeader,
  GeneralSettings,
  OptimizationSettings,
  HelpSettings,
} from "~/view/components";
import { useContextState, useStateObject } from "~/view/utils";

export const SettingsModal: Preact.FunctionComponent<{ dismiss }> = ({
  dismiss,
}) => {
  const set_dirty = useContext(MODAL_DIRTY).setValue;
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

  useEffect(() => {
    set_dirty(!deep_equals(form, settings));
  }, [form, settings]);

  return (
    <Modal className="tts-settings-modal" dismiss={dismiss}>
      <ModalHeader dismiss={dismiss}>
        <h3>Settings</h3>
      </ModalHeader>
      <div className="modal-body modal-scroll-content">
        <GeneralSettings onChangeSettings={on_change_settings} form={form} />
        <OptimizationSettings
          onChangeSettings={on_change_settings}
          form={form}
        />
        <HelpSettings onChangeSettings={on_change_settings} form={form} />
        <div className="modal-footer">
          <button className="btn btn-large" onClick={dismiss}>
            Cancel
          </button>
          <button
            className="btn btn-large btn-primary"
            onClick={() => {
              set_settings(form);
              set_dirty(false);
              dismiss();
            }}
          >
            Save
          </button>
        </div>
      </div>
    </Modal>
  );
};
