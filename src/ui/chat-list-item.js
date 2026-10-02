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
  item.title = `Rótulo original: ${chat.label}`;
  item.style.setProperty("--w", `${calculateBarWidthPercent(chat.daysAgo, maxDaysAgo)}%`);
  item.append(
    createTextSpan("wai-name", chat.name),
    createTextSpan("wai-days", formatDaysAgo(chat.daysAgo))
  );
  return item;
}
