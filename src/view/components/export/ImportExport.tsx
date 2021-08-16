import * as Preact from "preact";
import { useEffect } from "preact/hooks";
import { ImportExportModal } from "~/view/components";
import { useModal, useStateIfMounted } from "~/view/utils";

export const ImportExport: Preact.FunctionComponent<{
  importData: TTS.AnyExportData;
  setImportData: (data: TTS.AnyExportData | null) => void;
}> = ({ importData, setImportData }) => {
  const [open, set_open] = useStateIfMounted(false);

  useEffect(() => {
    if (importData) {
      set_open(true);
    }
  }, [importData]);

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
      {open &&
        useModal(
          <ImportExportModal
            importData={importData}
            setImportData={setImportData}
            dismiss={() => {
              set_open(false);
              setImportData(null);
            }}
          />
        )}
    </Preact.Fragment>
  );
};
