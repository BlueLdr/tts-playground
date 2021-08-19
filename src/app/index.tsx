import "preact/debug";
import * as Preact from "preact";
import { App, LoadingApp } from "~/view/components";

import { perform_startup_updates } from "./updates";

const container = document.getElementById("app");
if (container) {
  if (perform_startup_updates()) {
    Preact.render(
      <LoadingApp />,
      container,
      container.lastElementChild || undefined
    );
  } else {
    Preact.render(<App />, container, container.lastElementChild || undefined);
  }
}
