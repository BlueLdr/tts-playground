import * as Preact from "preact";
import { ImportExportModal } from "~/view/components";
import { useModal, useStateIfMounted } from "~/view/utils";

export const ImportExport: Preact.FunctionComponent = () => {
  const [open, set_open] = useStateIfMounted(false);

  return (
    <Preact.Fragment>
      <button
        className="header-button tts-export-button"
        onClick={() => set_open(true)}
        title="Import/Export"
        data-help="import-export-overview"
      >
        <i className="fas fa-share-square" />
      </button>
      {open && useModal(<ImportExportModal dismiss={() => set_open(false)} />)}
    </Preact.Fragment>
  );
};
