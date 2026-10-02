// Ações do usuário e ligação de eventos.
import { state } from "./state.js";
import { scanAllChats } from "./scanner.js";
import { exportChatsAsCsv } from "./csv-export.js";
import { render, showStatus } from "./ui/render.js";
import { locateChat } from "./chat-locator.js";

let isBusy = false;

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
  if (isBusy) return;
  isBusy = true;
  ui.scanButton.disabled = true;
  try {
    const chats = await scanAllChats((count) => showStatus(ui, `Lendo conversas… ${count} encontradas`));
    applyScanResult(ui, chats);
  } catch (error) {
    showStatus(ui, error.message);
  } finally {
    ui.scanButton.disabled = false;
    isBusy = false;
  }
}

export function bindEvents(ui, toggleButton) {
  toggleButton.addEventListener("click", () => togglePanelVisibility(ui));
  ui.closeButton.addEventListener("click", () => hidePanel(ui));
  ui.scanButton.addEventListener("click", () => handleScanClick(ui));
  ui.exportButton.addEventListener("click", () => exportChatsAsCsv(state.chats));
  ui.chatList.addEventListener("click", (event) => handleChatClick(ui, event));
  ui.minimumDaysInput.addEventListener("input", () => render(ui));
  ui.nameSearchInput.addEventListener("input", () => render(ui));
}

async function handleChatClick(ui, event) {
  const button = event.target.closest(".wai-item-button");
  if (!button || isBusy) return;

  const chat = state.chats.find((item) => item.name === button.dataset.chatName);
  if (!chat) return;

  isBusy = true;
  showStatus(ui, `Localizando “${chat.name}”…`);
  try {
    const found = await locateChat(chat, (percent) =>
      showStatus(ui, `Procurando “${chat.name}”… ${percent}% da lista`)
    );
    showStatus(ui, found
      ? `Mostrando “${chat.name}”`
      : `“${chat.name}” não foi encontrada na lista.`);
  } catch (error) {
    showStatus(ui, error.message);
  } finally {
    isBusy = false;
  }
}