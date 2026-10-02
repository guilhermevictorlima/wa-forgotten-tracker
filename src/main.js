import { createToggleButton, createPanel, mapPanelElements } from "./ui/panel.js";
import { bindEvents } from "./actions.js";
import { watchOpenChat } from "./open-chat-watcher.js";

export async function initialize() {
  const toggleButton = createToggleButton();
  const panel = await createPanel();
  document.body.append(toggleButton, panel);
  bindEvents(mapPanelElements(panel), toggleButton);

  watchOpenChat((isChatOpen) => {
    toggleButton.hidden = isChatOpen;
    if (isChatOpen) panel.hidden = true;
  });
}