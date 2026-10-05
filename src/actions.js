// Ações do usuário e ligação de eventos.
import { state } from "./state.js";
import { scanAllChats } from "./scanner.js";
import { exportChatsAsCsv } from "./csv-export.js";
import { render, showStatus, refreshSummary, getVisibleChats } from "./ui/render.js";
import { locateChat } from "./chat-locator.js";
import { bindTabs, selectTab } from "./ui/tabs.js";
import { ignoreChat, restoreChat } from "./ignored.js";
import { hasPositiveValue } from "./utils.js";


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
  if (chats.length === 0) showEmptyResultWarning(ui);
  render(ui);
  if (chats.length > 0) selectTab(ui, "list");
}

function syncDayRangeFields(ui) {
  const { minimumDaysInput, maximumDaysInput } = ui;

  if (!hasPositiveValue(minimumDaysInput)) {
    minimumDaysInput.value = "";
    maximumDaysInput.value = "1";
  }
  if (!hasPositiveValue(maximumDaysInput)) {
    maximumDaysInput.value = "";
  }

  ui.minimumDaysLabel.classList.toggle("wai-min-label-hide", minimumDaysInput.value === "");
  ui.maximumDaysLabel.classList.toggle("wai-max-label-hide", maximumDaysInput.value === "");
}

function handleDayRangeInput(ui) {
  syncDayRangeFields(ui);
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

  ui.exportButton.addEventListener("click", () => exportChatsAsCsv(getVisibleChats(ui)));
  ui.chatList.addEventListener("click", (event) => handleIgnoreClick(ui, event));
  ui.ignoredList.addEventListener("click", (event) => handleRestoreClick(ui, event));
  ui.chatList.addEventListener("click", (event) => handleChatClick(ui, event));
  
  ui.minimumDaysInput.addEventListener("input", () => handleDayRangeInput(ui));
  ui.maximumDaysInput.addEventListener("input", () => handleDayRangeInput(ui));

  ui.nameSearchInput.addEventListener("input", () => render(ui));

  bindTabs(ui);
}

async function handleChatClick(ui, event) {
  const button = event.target.closest(".wai-item-button");
  if (!button || isBusy) return;

  const chat = state.chats.find((item) => item.name === button.dataset.chatName);
  if (!chat) return;

  const foundMessage = `Mostrando “${chat.name}”`;

  isBusy = true;
  showStatus(ui, `Localizando “${chat.name}”…`);
  try {
    const found = await locateChat(
      chat,
      (percent) => showStatus(ui, `Procurando “${chat.name}”… ${percent}% da lista`),
      () => {
        if (ui.statusText.textContent === foundMessage) refreshSummary(ui);
      }
    );
    showStatus(ui, found
      ? foundMessage
      : `“${chat.name}” não foi encontrada na lista.`);
  } catch (error) {
    showStatus(ui, error.message);
  } finally {
    isBusy = false;
  }
}

async function handleIgnoreClick(ui, event) {
  const button = event.target.closest(".wai-ignore-button");
  if (!button) return;

  const name = button.dataset.chatName;
  try {
    await ignoreChat(name);
    render(ui);
    showStatus(ui, `“${name}” foi ignorada. Para desfazer, use a aba Ignoradas.`);
  } catch (error) {
    showStatus(ui, `Não foi possível salvar: ${error.message}`);
  }
}

async function handleRestoreClick(ui, event) {
  const button = event.target.closest(".wai-restore-button");
  if (!button) return;

  const name = button.dataset.chatName;
  const appearsInLastScan = state.chats.some((chat) => chat.name === name);
  try {
    await restoreChat(name);
    render(ui);
    showStatus(ui, appearsInLastScan
      ? `“${name}” restaurada.`
      : `“${name}” restaurada. Faça uma nova varredura para ela aparecer na lista.`);
  } catch (error) {
    showStatus(ui, `Não foi possível salvar: ${error.message}`);
  }
}