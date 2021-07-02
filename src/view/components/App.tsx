import * as Preact from "preact";
import {
  WithContextHooks,
  WithGlobalContexts,
} from "~/view/components/context";

export const App: Preact.FunctionComponent = () => {
  return (
    <WithGlobalContexts>
      <WithContextHooks>
        <div>hello</div>
      </WithContextHooks>
    </WithGlobalContexts>
  );
};
