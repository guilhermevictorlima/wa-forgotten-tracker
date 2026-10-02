// Localiza uma conversa na lista do WhatsApp, rola até ela e a destaca.
import {
  MAX_SCROLL_ATTEMPTS_WITHOUT_PROGRESS,
  HIGHLIGHT_CLASS,
  HIGHLIGHT_DURATION_MS
} from "./constants.js";
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

export async function locateChat(name, onProgress = () => {}) {
  const pane = findChatListPane();
  if (!pane) throw new Error("Abra o WhatsApp Web e aguarde a lista de conversas carregar.");

  const alreadyVisible = findChatRowByName(pane, name);
  if (alreadyVisible) {
    revealRow(alreadyVisible);
    return true;
  }

  const originalScrollPosition = pane.scrollTop;
  const row = await searchByScrolling(pane, name, onProgress);
  if (!row) {
    pane.scrollTop = originalScrollPosition;
    return false;
  }

  revealRow(row);
  return true;
}