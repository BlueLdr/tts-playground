import * as Preact from "preact";
import { ExportForm, ImportForm, Modal } from "~/view/components";
import { useStateIfMounted } from "~/view/utils";

export const ImportExportModal: Preact.FunctionComponent<{
  dismiss: () => void;
  importData?: any;
  exportData?: any;
}> = ({ importData, dismiss }) => {
  const [tab, set_tab] = useStateIfMounted<"import" | "export">(
    importData ? "import" : "export"
  );

  return (
    <Modal className="tts-export-modal" dismiss={dismiss}>
      <div className="modal-header modal-header-tabs">
        <button
          className="modal-header-tab"
          data-active={`${tab === "import"}`}
          onClick={() => set_tab("import")}
        >
          Import
        </button>
        <button
          className="modal-header-tab"
          data-active={`${tab === "export"}`}
          onClick={() => set_tab("export")}
        >
          Export
        </button>
        <button className="icon-button modal-close" onClick={dismiss}>
          <i className="fas fa-times" />
        </button>
      </div>
      {tab === "export" ? (
        <ExportForm dismiss={dismiss} />
      ) : (
        <ImportForm dismiss={dismiss} />
      )}
    </Modal>
  );
};
