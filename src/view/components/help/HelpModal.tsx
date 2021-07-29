import * as Preact from "preact";
import { useCallback } from "preact/hooks";
import { HELP_ITEM } from "~/model";
import { Modal, ModalHeader } from "~/view/components";
import { SkipTutorials } from "~/view/components/help/demos/SkipTutorials";
import { useContextState, useStateRef, useValueRef } from "~/view/utils";
import { HELP_DATA, HelpDataKey } from "./help-data";

export const HelpModal: Preact.FunctionComponent<{ isTutorial: boolean }> = ({
  isTutorial,
}) => {
  const [key, set_key] = useContextState(HELP_ITEM);
  const [history, set_history, history_ref] = useStateRef<HelpDataKey[]>([]);
  const key_ref = useValueRef(key);

  const go_to_help = useCallback((new_key: HelpDataKey | null) => {
    if (new_key === null) {
      set_key(null);
      set_history([]);
    }
    set_history(history_ref.current.concat(key_ref.current));
    if (HELP_DATA[new_key]) {
      set_key(new_key);
    } else {
      set_key("not-found");
    }
  }, []);

  const go_back = useCallback(() => {
    const new_history = history_ref.current.slice(0);
    let new_key = new_history.pop();
    console.log(`new_key: `, new_key);
    while (!HELP_DATA[new_key] && new_history.length > 0) {
      new_key = new_history.pop();
      console.log(`new_key: `, new_key);
    }
    if (!HELP_DATA[new_key]) {
      set_key(null);
      set_history([]);
      return;
    }
    set_key(new_key);
    set_history(new_history);
  }, []);

  if (!key || !HELP_DATA[key]) {
    return null;
  }
  const item: TTS.HelpItem = HELP_DATA[key];
  const dismiss = () => set_key(null);
  const { name, content: Content } = item;
  const body =
    typeof Content === "string" ? Content : <Content goToHelp={go_to_help} />;

  return (
    <Modal className="help-modal" dismiss={dismiss}>
      <ModalHeader dismiss={dismiss}>
        {history.length > 0 && (
          <button className="icon-button help-modal-back" onClick={go_back}>
            <i className="fas fa-chevron-left" />
          </button>
        )}
        <h3>{name}</h3>
      </ModalHeader>
      <div className="modal-body modal-scroll-content" data-item={key}>
        {body}
      </div>
      {isTutorial && history.length === 0 && (
        <div className="modal-footer">
          <div />
          <button
            className="link help-modal-skip"
            onClick={() => go_to_help("skip-tutorials")}
          >
            Don't show me these one-time tutorials.
          </button>
        </div>
      )}
      {key === "skip-tutorials" && (
        <div className="modal-footer">
          <button className="btn btn-large btn-primary" onClick={go_back}>
            Back
          </button>
          <SkipTutorials onFinish={() => set_key(null)} />
        </div>
      )}
    </Modal>
  );
};
