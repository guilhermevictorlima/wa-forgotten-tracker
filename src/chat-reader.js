// Leitura das linhas da lista de conversas do WhatsApp Web.
import { SELECTORS } from "./constants.js";
import { convertTimeLabelToDaysAgo } from "./time-label.js";

export function findChatListPane() {
  return document.querySelector(SELECTORS.chatListPane);
}

function findVisibleChatRows(pane) {
  const primaryRows = pane.querySelectorAll(SELECTORS.chatRowsPrimary);
  return primaryRows.length ? primaryRows : pane.querySelectorAll(SELECTORS.chatRowsFallback);
}

function readContactName(titleElement) {
  return titleElement?.getAttribute("title")?.trim() || null;
}

function isLeafElementOutsideTitle(element, titleElement) {
  return element.children.length === 0 && !titleElement.contains(element);
}

function findLastMessageTime(row, titleElement) {
  for (const element of row.querySelectorAll(SELECTORS.rowTextElements)) {
    if (!isLeafElementOutsideTitle(element, titleElement)) continue;

    const daysAgo = convertTimeLabelToDaysAgo(element.textContent);
    if (daysAgo !== null) return { daysAgo, label: element.textContent.trim() };
  }
  return null;
}

function readChatRow(row) {
  const titleElement = row.querySelector(SELECTORS.contactTitle);
  const name = readContactName(titleElement);
  if (!name) return null;

  const lastMessage = findLastMessageTime(row, titleElement);
  return lastMessage ? { name, ...lastMessage } : null;
}

export function collectVisibleChats(pane, chatsByName) {
  for (const row of findVisibleChatRows(pane)) {
    const chat = readChatRow(row);
    if (chat && !chatsByName.has(chat.name)) chatsByName.set(chat.name, chat);
  }
}

export function findChatRowByName(pane, name) {
  for (const row of findVisibleChatRows(pane)) {
    const titleElement = row.querySelector(SELECTORS.contactTitle);
    if (readContactName(titleElement) === name) return row;
  }
  return null;
}