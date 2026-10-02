import { createToggleButton, createPanel, mapPanelElements } from "./ui/panel.js";
import { bindEvents } from "./actions.js";

export async function initialize() {
  const toggleButton = createToggleButton();
  const panel = await createPanel();
  document.body.append(toggleButton, panel);
  bindEvents(mapPanelElements(panel), toggleButton);
}
