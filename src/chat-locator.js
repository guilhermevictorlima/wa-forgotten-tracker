import {
  MAX_SCROLL_ATTEMPTS_WITHOUT_PROGRESS,
  SCROLL_SETTLE_DELAY_MS,
  HIGHLIGHT_CLASS,
  HIGHLIGHT_DURATION_MS
} from "./constants.js";
import { wait } from "./utils.js";
import { findChatListPane, findChatRowByName } from "./chat-reader.js";
import { scrollToTop, scrollOneStepDown } from "./scanner.js";

function highlightRow(row) {
  row.classList.add(HIGHLIGHT_CLASS);
  setTimeout(() => row.classList.remove(HIGHLIGHT_CLASS), HIGHLIGHT_DURATION_MS);
}

function revealRow(row) {
  row.scrollIntoView({ block: "center" });
  highlightRow(row);
}

function reportProgress(pane, onProgress) {
  const scrollable = pane.scrollHeight - pane.clientHeight;
  const percent = scrollable > 0 ? Math.round((pane.scrollTop / scrollable) * 100) : 0;
  onProgress(percent);
}

async function jumpToSavedOffset(pane, chat) {
  if (typeof chat.scrollOffset !== "number") return null;

  pane.scrollTop = Math.max(0, chat.scrollOffset - pane.clientHeight / 2);
  await wait(SCROLL_SETTLE_DELAY_MS);
  return findChatRowByName(pane, chat.name);
}

async function searchByScrolling(pane, name, onProgress) {
  let attemptsWithoutProgress = 0;

  await scrollToTop(pane);
  while (attemptsWithoutProgress < MAX_SCROLL_ATTEMPTS_WITHOUT_PROGRESS) {
    const row = findChatRowByName(pane, name);
    if (row) return row;

    reportProgress(pane, onProgress);
    const moved = await scrollOneStepDown(pane);
    attemptsWithoutProgress = moved ? 0 : attemptsWithoutProgress + 1;
  }
  return null;
}

export async function locateChat(chat, onProgress = () => {}) {
  const pane = findChatListPane();
  if (!pane) throw new Error("Abra o WhatsApp Web e aguarde a lista de conversas carregar.");

  const alreadyVisible = findChatRowByName(pane, chat.name);
  if (alreadyVisible) {
    revealRow(alreadyVisible);
    return true;
  }

  const originalScrollPosition = pane.scrollTop;
  const row =
    (await jumpToSavedOffset(pane, chat)) ??
    (await searchByScrolling(pane, chat.name, onProgress));

  if (!row) {
    pane.scrollTop = originalScrollPosition;
    return false;
  }

  revealRow(row);
  return true;
}