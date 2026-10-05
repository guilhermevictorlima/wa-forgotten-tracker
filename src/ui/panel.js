import { PANEL_TEMPLATE_PATH, LOGO_PATH } from "../constants.js";

const templateUrl = chrome.runtime.getURL(PANEL_TEMPLATE_PATH);

function setupLogo(panel) {
  const logo = panel.querySelector(".wai-logo");
  if (!logo) return;

  logo.addEventListener("error", () => logo.remove(), { once: true });
  logo.src = chrome.runtime.getURL(LOGO_PATH);
}


async function loadPanelTemplate() {
  const response = await fetch(templateUrl);
  if (!response.ok) throw new Error(`Falha ao carregar ${PANEL_TEMPLATE_PATH}`);

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
  setupLogo(panel);
  return panel;
}

export function mapPanelElements(panel) {
  const find = (selector) => panel.querySelector(selector);
  return {
    panel,
    closeButton: find(".wai-close"),
    scanButton: find(".wai-scan"),
    minimumDaysInput: find(".wai-min"),
    maximumDaysInput: find(".wai-max"),
    minimumDaysLabel: find(".wai-min-label"),
    maximumDaysLabel: find(".wai-max-label"),
    nameSearchInput: find(".wai-search"),
    statusText: find(".wai-status"),
    chatList: find(".wai-list"),
    exportButton: find(".wai-csv"),
    tabButtons: [...panel.querySelectorAll(".wai-tab")],
    tabPanes: [...panel.querySelectorAll(".wai-pane")],
    ignoredTab: find("#wai-tab-ignored"),
    ignoredList: find(".wai-ignored-list"),
    ignoredEmpty: find(".wai-empty"),
  };
}
