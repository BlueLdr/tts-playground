import * as Preact from "preact";
import { useCallback } from "preact/hooks";
import { HELP_ITEM } from "~/model";
import { Modal, ModalHeader } from "~/view/components";
import { useContextState } from "~/view/utils";
import { HELP_DATA, HelpDataKey } from "./help-data";

export const HelpModal: Preact.FunctionComponent = () => {
  const [item, set_item] = useContextState(HELP_ITEM);

  const go_to_help = useCallback((key: HelpDataKey) => {
    const new_item = HELP_DATA[key];
    if (new_item) {
      set_item(new_item);
    }
  }, []);

  if (!item) {
    return null;
  }
  const dismiss = () => set_item(null);
  const { key, name, content: Content } = item;
  const body =
    typeof Content === "string" ? Content : <Content goToHelp={go_to_help} />;

  return (
    <Modal className="help-modal" dismiss={dismiss}>
      <ModalHeader dismiss={dismiss}>
        <h3>{name}</h3>
      </ModalHeader>
      <div className="modal-body modal-scroll-content" data-item={key}>
        {body}
      </div>
    </Modal>
  );
};
