// Construção do painel e do botão flutuante.
import { PANEL_TEMPLATE_PATH } from "../constants.js";

async function loadPanelTemplate() {
  const response = await fetch(chrome.runtime.getURL(PANEL_TEMPLATE_PATH));
  if (!response.ok) throw new Error(`Falha ao carregar ${PANEL_TEMPLATE_PATH}`);
  return response.text();
}

export function createToggleButton() {
  const button = document.createElement("button");
  button.className = "wai-toggle";
  button.title = "Conversas esquecidas";
  button.textContent = "⏳";
  return button;
}

export async function createPanel() {
  const panel = document.createElement("aside");
  panel.className = "wai-panel";
  panel.hidden = true;
  panel.innerHTML = await loadPanelTemplate();
  return panel;
}

export function mapPanelElements(panel) {
  const find = (selector) => panel.querySelector(selector);
  return {
    panel,
    closeButton: find(".wai-close"),
    scanButton: find(".wai-scan"),
    minimumDaysInput: find(".wai-min"),
    nameSearchInput: find(".wai-search"),
    statusText: find(".wai-status"),
    chatList: find(".wai-list"),
    exportButton: find(".wai-csv")
  };
}
