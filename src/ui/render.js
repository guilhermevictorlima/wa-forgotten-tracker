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

function isDayRangeInvalid({ minimumDays, maximumDays }) {
  return minimumDays > maximumDays;
}

export function showStatus(ui, message, { isError = false } = {}) {
  ui.statusText.textContent = message;
  ui.statusText.classList.toggle("is-error", isError);
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
  const filters = readFilters(ui);
  const activeChats = getActiveChats();
  const visibleChats = filterChats(activeChats, filters);

  ui.exportButton.disabled = visibleChats.length === 0;
  renderChatList(ui, visibleChats, activeChats);
  renderStatus(ui, filters, visibleChats.length, activeChats.length);
  renderIgnoredList(ui);
}

function renderStatus(ui, filters, visibleCount, activeCount) {
  if (isDayRangeInvalid(filters)) {
    showStatus(ui, "O mínimo de dias não pode ser maior que o máximo.", { isError: true });
    return;
  }

  showStatus(ui, "Acompanhe suas conversas e o tempo de ociosidade com seus contatos");
  renderSummary(ui, visibleCount, activeCount);
}

export function refreshSummary(ui) {
  const filters = readFilters(ui);
  const activeChats = getActiveChats();
  const visibleChats = filterChats(activeChats, filters);
  renderStatus(ui, filters, visibleChats.length, activeChats.length);
}

export function getVisibleChats(ui) {
  return filterChats(getActiveChats(), readFilters(ui));
}