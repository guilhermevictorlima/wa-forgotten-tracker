import {
  classifyForgetfulness,
  calculateBarWidthPercent,
  formatDaysAgo
} from "../formatting.js";

function createTextSpan(className, text) {
  const span = document.createElement("span");
  span.className = className;
  span.textContent = text;
  return span;
}

function createIgnoreButton(name) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "wai-ignore-button";
  button.dataset.chatName = name;
  button.title = "Ignorar esta conversa";
  button.setAttribute("aria-label", `Ignorar ${name}`);
  button.textContent = "🚫";
  return button;
}

export function createChatListItem(chat, maxDaysAgo) {
  const item = document.createElement("li");
  item.className = `wai-item wai-${classifyForgetfulness(chat.daysAgo)}`;
  item.title = `Última interação: ${chat.label}`;
  item.style.setProperty("--w", `${calculateBarWidthPercent(chat.daysAgo, maxDaysAgo)}%`);

  const openButton = document.createElement("button");
  openButton.type = "button";
  openButton.className = "wai-item-button";
  openButton.dataset.chatName = chat.name;
  openButton.append(
    createTextSpan("wai-name", chat.name),
    createTextSpan("wai-days", formatDaysAgo(chat.daysAgo))
  );

  item.append(openButton, createIgnoreButton(chat.name));
  return item;
}