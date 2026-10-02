import { state } from "../state.js";
import { normalizeText } from "../utils.js";
import { filterChats } from "../filters.js";
import { findMaxDaysAgo } from "../formatting.js";
import { createChatListItem } from "./chat-list-item.js";

function readFilters(ui) {
  return {
    minimumDays: Number(ui.minimumDaysInput.value) || 0,
    nameQuery: normalizeText(ui.nameSearchInput.value)
  };
}

export function showStatus(ui, message) {
  ui.statusText.textContent = message;
}

function renderChatList(ui, visibleChats) {
  const maxDaysAgo = findMaxDaysAgo(state.chats);
  ui.chatList.replaceChildren(
    ...visibleChats.map((chat) => createChatListItem(chat, maxDaysAgo))
  );
}

function renderSummary(ui, visibleCount) {
  if (state.chats.length) showStatus(ui, `${visibleCount} de ${state.chats.length} conversas`);
}

export function render(ui) {
  const visibleChats = filterChats(state.chats, readFilters(ui));
  renderChatList(ui, visibleChats);
  renderSummary(ui, visibleChats.length);
}
