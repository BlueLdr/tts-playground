import * as Preact from "preact";
import {
  WithContextHooks,
  WithGlobalContexts,
} from "~/view/components/context";
import { View } from "~/view/components/View";

export const App: Preact.FunctionComponent = () => {
  return (
    <WithGlobalContexts>
      <WithContextHooks>
        <View />
        <textarea
          id="clipboard-input"
          className="clipboard-input invisible"
          tabIndex={-1}
        />
        <div id="modal-container" className="modal-container" />
      </WithContextHooks>
    </WithGlobalContexts>
  );
};
