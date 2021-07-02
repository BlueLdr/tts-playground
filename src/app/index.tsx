import * as Preact from "preact";
import { App } from "../view";

const container = document.getElementById("app");
if (container) {
  Preact.render(<App />, container, container.lastElementChild || undefined);
}
