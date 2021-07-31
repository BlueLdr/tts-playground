import * as Preact from "preact";
import { useCallback, useEffect, useMemo } from "preact/hooks";
import { HELP_COMPLETED, HELP_ITEM } from "~/model";
import { Modal, ModalHeader } from "~/view/components";
import { IntroFooter } from "~/view/components/help/demos";
import { SkipTutorials } from "~/view/components/help/demos/SkipTutorials";
import { useContextState, useStateRef, useValueRef } from "~/view/utils";
import { HELP_DATA, HelpDataKey } from "./help-data";

export const HelpModal: Preact.FunctionComponent<{ isTutorial: boolean }> = ({
  isTutorial,
}) => {
  const [comp, set_comp] = useContextState(HELP_COMPLETED);
  const [key, set_key] = useContextState(HELP_ITEM);
  const [history, set_history, history_ref] = useStateRef<HelpDataKey[]>([]);
  const key_ref = useValueRef(key);

  const go_to_help = useCallback((new_key: HelpDataKey | null) => {
    console.log(`new_key: `, new_key);
    if (new_key === null) {
      set_key(null);
      set_history([]);
      return;
    }
    if (HELP_DATA[new_key]) {
      set_history(history_ref.current.concat(key_ref.current));
    }
    set_key(new_key);
  }, []);

  const go_back = useCallback(() => {
    const new_history = history_ref.current.slice(0);
    let new_key = new_history.pop();
    while (!HELP_DATA[new_key] && new_history.length > 0) {
      new_key = new_history.pop();
    }
    if (!HELP_DATA[new_key]) {
      set_key(null);
      set_history([]);
      return;
    }
    set_key(new_key);
    set_history(new_history);
  }, []);

  useEffect(() => {
    if (!key || (isTutorial && key !== history[0]) || comp[key]) {
      return;
    }
    set_comp({
      ...comp,
      [key]: true,
    });
  }, [key]);

  const is_intro = key?.startsWith("intro-");
  const backdrop_data = useMemo(
    () => (is_intro ? { ["data-intro-key"]: key } : undefined),
    [is_intro ? key : undefined]
  );

  if (!key) {
    return null;
  }

  const item: TTS.HelpItem = HELP_DATA[key] || HELP_DATA["not-found"];
  const dismiss = () => set_key(null);
  const { name, content: Content } = item;
  const body =
    typeof Content === "string" ? Content : <Content goToHelp={go_to_help} />;

  return (
    <Modal
      className="help-modal"
      dismiss={dismiss}
      closeOnClickBackdrop={!is_intro}
      backdropData={backdrop_data}
      data-item={key}
    >
      <ModalHeader dismiss={dismiss} showCloseButton={!is_intro}>
        {history.length > 0 && !is_intro ? (
          <button className="icon-button help-modal-back" onClick={go_back}>
            <i className="fas fa-chevron-left" />
          </button>
        ) : null}
        {name ? <h3>{name}</h3> : null}
      </ModalHeader>
      <div className="modal-body modal-scroll-content">{body}</div>
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
      {is_intro && (
        <IntroFooter item={key} setItem={go_to_help} back={go_back} />
      )}
    </Modal>
  );
};
