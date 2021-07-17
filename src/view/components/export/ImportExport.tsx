import * as Preact from "preact";
import { ImportExportModal } from "~/view/components";
import { useModal, useStateIfMounted } from "~/view/utils";

export const ImportExport: Preact.FunctionComponent = () => {
  const [open, set_open] = useStateIfMounted(false);

  return (
    <Preact.Fragment>
      <button
        className="icon-button tts-export-button"
        onClick={() => set_open(true)}
        title="Import/Export"
      >
        <i className="fas fa-exchange-alt" />
        <i className="fas fa-file" />
      </button>
      {open && useModal(<ImportExportModal dismiss={() => set_open(false)} />)}
    </Preact.Fragment>
  );
};
