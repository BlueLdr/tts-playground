import "preact/debug";
import * as Preact from "preact";
import { App } from "~/view/components";

const container = document.getElementById("app");
if (container) {
  Preact.render(<App />, container, container.lastElementChild || undefined);
}
