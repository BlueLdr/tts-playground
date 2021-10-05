import * as Preact from "preact";
import { useRef } from "preact/hooks";
import {
  WithContextHooks,
  WithGlobalContexts,
  View,
  useCtrlZListener,
  AudioPlayer,
} from "~/view/components";

export const App: Preact.FunctionComponent = () => {
  const modal_container = useRef<HTMLDivElement>();
  useCtrlZListener(modal_container);
  return (
    <WithGlobalContexts>
      <WithContextHooks>
        <View />
        <textarea
          id="clipboard-input"
          className="clipboard-input invisible"
          tabIndex={-1}
        />
        <AudioPlayer data="" className="invisible" id="measure-duration" />
        <div
          ref={modal_container}
          id="modal-container"
          className="modal-container"
        />
      </WithContextHooks>
    </WithGlobalContexts>
  );
};
