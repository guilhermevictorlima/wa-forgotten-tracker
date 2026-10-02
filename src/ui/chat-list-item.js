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

export function createChatListItem(chat, maxDaysAgo) {
  const item = document.createElement("li");
  item.className = `wai-item wai-${classifyForgetfulness(chat.daysAgo)}`;
  item.title = `última Conversa: ${chat.label}`;
  item.style.setProperty("--w", `${calculateBarWidthPercent(chat.daysAgo, maxDaysAgo)}%`);

  const button = document.createElement("button");
  button.type = "button";
  button.className = "wai-item-button";
  button.dataset.chatName = chat.name;
  button.append(
    createTextSpan("wai-name", chat.name),
    createTextSpan("wai-days", formatDaysAgo(chat.daysAgo))
  );

  item.append(button);
  return item;
}