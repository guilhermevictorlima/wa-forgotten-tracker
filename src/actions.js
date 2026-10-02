// Ações do usuário e ligação de eventos.
import { state } from "./state.js";
import { scanAllChats } from "./scanner.js";
import { exportChatsAsCsv } from "./csv-export.js";
import { render, showStatus } from "./ui/render.js";

function togglePanelVisibility(ui) {
  ui.panel.hidden = !ui.panel.hidden;
}

function hidePanel(ui) {
  ui.panel.hidden = true;
}

function showEmptyResultWarning(ui) {
  showStatus(ui, "Nenhuma conversa reconhecida. O layout do WhatsApp pode ter mudado.");
}

function applyScanResult(ui, chats) {
  state.chats = chats;
  ui.exportButton.disabled = chats.length === 0;
  if (chats.length === 0) showEmptyResultWarning(ui);
  render(ui);
}

async function handleScanClick(ui) {
  ui.scanButton.disabled = true;
  try {
    const chats = await scanAllChats((count) => showStatus(ui, `Lendo conversas… ${count} encontradas`));
    applyScanResult(ui, chats);
  } catch (error) {
    showStatus(ui, error.message);
  } finally {
    ui.scanButton.disabled = false;
  }
}

export function bindEvents(ui, toggleButton) {
  toggleButton.addEventListener("click", () => togglePanelVisibility(ui));
  ui.closeButton.addEventListener("click", () => hidePanel(ui));
  ui.scanButton.addEventListener("click", () => handleScanClick(ui));
  ui.exportButton.addEventListener("click", () => exportChatsAsCsv(state.chats));
  ui.minimumDaysInput.addEventListener("input", () => render(ui));
  ui.nameSearchInput.addEventListener("input", () => render(ui));
}
