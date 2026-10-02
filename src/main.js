import { createToggleButton, createPanel, mapPanelElements } from "./ui/panel.js";
import { bindEvents } from "./actions.js";
import { watchOpenChat } from "./open-chat-watcher.js";
import { loadIgnoredIntoState } from "./ignored.js";
import { render } from "./ui/render.js";

export async function initialize() {
  const toggleButton = createToggleButton();
  const panel = await createPanel();
  const ui = mapPanelElements(panel);
  document.body.append(toggleButton, panel);
  bindEvents(ui, toggleButton);

  try {
    await loadIgnoredIntoState();
  } catch (error) {
    console.warn("[wai] Não foi possível carregar as conversas ignoradas:", error);
  }
  render(ui);

  watchOpenChat((isChatOpen) => {
    toggleButton.hidden = isChatOpen;
    if (isChatOpen) panel.hidden = true;
  });
}