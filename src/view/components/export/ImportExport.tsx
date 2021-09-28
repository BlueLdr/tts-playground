import * as Preact from "preact";
import { useEffect } from "preact/hooks";
import { ImportExportModal, useModal } from "~/view/components";

export const ImportExport: Preact.FunctionComponent<{
  importData: TTS.AnyExportData;
  setImportData: (data: TTS.AnyExportData | null) => void;
}> = ({ importData, setImportData }) => {
  const [ModalContainer, toggle_modal] = useModal();

  useEffect(() => {
    if (importData) {
      toggle_modal(true);
    }
  }, [importData]);

  return (
    <Preact.Fragment>
      <button
        className="header-button tts-export-button"
        onClick={() => toggle_modal(true)}
        title="Import/Export"
        data-help="import-export-overview"
      >
        <i className="fas fa-share-square" />
      </button>
      <ModalContainer>
        <ImportExportModal
          importData={importData}
          setImportData={setImportData}
          dismiss={() => {
            if (toggle_modal(false)) {
              setImportData(null);
            }
          }}
        />
      </ModalContainer>
    </Preact.Fragment>
  );
};
