import * as Preact from "preact";
import { WithContextHooks, WithGlobalContexts, View } from "~/view/components";
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
