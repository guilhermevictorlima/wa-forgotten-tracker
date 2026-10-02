// Construção do painel e do botão flutuante.
import { PANEL_TEMPLATE_PATH } from "../constants.js";

const templateUrl = chrome.runtime.getURL(PANEL_TEMPLATE_PATH);

async function loadPanelTemplate() {
  const response = await fetch(templateUrl);
  if (!response.ok) throw new Error(`Falha ao carregar ${PANEL_TEMPLATE_PATH}`);

  // <template> é inerte: nada é baixado até decidirmos inserir no documento.
  const template = document.createElement("template");
  template.innerHTML = await response.text();
  return template.content;
}

function resolveStylesheetUrl(link) {
  return new URL(link.getAttribute("href"), templateUrl).href;
}

function waitForStylesheet(link) {
  return new Promise((resolve) => {
    link.addEventListener("load", resolve, { once: true });
    link.addEventListener("error", () => {
      console.warn(`[wai] CSS não carregou: ${link.href}`);
      resolve();
    }, { once: true });
  });
}

// Move os <link> do template para o <head> (eles também estilizam o botão,
// que fica fora do painel) e aguarda o carregamento para evitar "piscar" sem estilo.
async function installStylesheets(fragment) {
  const links = [...fragment.querySelectorAll('link[rel="stylesheet"]')];
  const loaded = links.map((link) => {
    link.href = resolveStylesheetUrl(link);
    const done = waitForStylesheet(link);
    document.head.append(link);
    return done;
  });
  await Promise.all(loaded);
}

export function createToggleButton() {
  const button = document.createElement("button");
  button.className = "wai-toggle";
  button.title = "Conversas esquecidas";
  button.textContent = "⏳";
  return button;
}

export async function createPanel() {
  const fragment = await loadPanelTemplate();
  await installStylesheets(fragment);

  const panel = document.createElement("aside");
  panel.className = "wai-panel";
  panel.hidden = true;
  panel.append(fragment);
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
