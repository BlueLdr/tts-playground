import * as Preact from "preact";
import { EDITOR_SETTINGS } from "~/model";
import { useContextState } from "~/view/utils";

export const SkipTutorials: Preact.FunctionComponent<{ onFinish: () => void }> =
  ({ onFinish }) => {
    const [settings, set_settings] = useContextState(EDITOR_SETTINGS);
    return (
      <button
        className="btn btn-large btn-negative"
        onClick={() => {
          set_settings({ ...settings, skip_tutorials: true });
          onFinish();
        }}
      >
        Turn Off Tutorials
      </button>
    );
  };
