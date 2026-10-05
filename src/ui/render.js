import { state } from "../state.js";
import { normalizeText } from "../utils.js";
import { filterChats } from "../filters.js";
import { findMaxDaysAgo } from "../formatting.js";
import { getActiveChats } from "../ignored.js";
import { createChatListItem } from "./chat-list-item.js";
import { createIgnoredListItem } from "./ignored-list-item.js";

function readMaximumDays(ui) {
  const raw = ui.maximumDaysInput.value;
  return raw === "" ? Infinity : Number(raw);
}

function readFilters(ui) {
  return {
    minimumDays: Number(ui.minimumDaysInput.value) || 0,
    maximumDays: readMaximumDays(ui),
    nameQuery: normalizeText(ui.nameSearchInput.value)
  };
}

export function showStatus(ui, message) {
  ui.statusText.textContent = message;
}

function renderChatList(ui, visibleChats, activeChats) {
  const maxDaysAgo = findMaxDaysAgo(activeChats);
  ui.chatList.replaceChildren(
    ...visibleChats.map((chat) => createChatListItem(chat, maxDaysAgo))
  );
}

function renderSummary(ui, visibleCount, activeCount) {
  if (state.chats.length) showStatus(ui, `${visibleCount} de ${activeCount} conversas`);
}

function renderIgnoredList(ui) {
  const names = [...state.ignoredNames].sort((a, b) => a.localeCompare(b, "pt-BR"));
  ui.ignoredList.replaceChildren(...names.map(createIgnoredListItem));
  ui.ignoredEmpty.hidden = names.length > 0;
  ui.ignoredTab.textContent = names.length ? `Ignoradas (${names.length})` : "Ignoradas";
}

export function render(ui) {
  const activeChats = getActiveChats();
  const visibleChats = getVisibleChats(ui);

  ui.exportButton.disabled = visibleChats.length === 0;
  renderChatList(ui, visibleChats, activeChats);
  renderSummary(ui, visibleChats.length, activeChats.length);
  renderIgnoredList(ui);
}

export function refreshSummary(ui) {
  renderSummary(ui, getVisibleChats(ui).length, getActiveChats().length);
}

export function getVisibleChats(ui) {
  return filterChats(getActiveChats(), readFilters(ui));
}