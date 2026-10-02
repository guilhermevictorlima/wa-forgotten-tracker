// Varredura da lista de conversas com rolagem automática.
import {
  SCROLL_STEP_RATIO,
  SCROLL_SETTLE_DELAY_MS,
  INITIAL_SCROLL_DELAY_MS,
  MAX_SCROLL_ATTEMPTS_WITHOUT_PROGRESS
} from "./constants.js";
import { wait } from "./utils.js";
import { findChatListPane, collectVisibleChats } from "./chat-reader.js";

function sortByMostForgotten(chats) {
  return [...chats].sort((a, b) => b.daysAgo - a.daysAgo);
}

export async function scanAllChats(onProgress) {
  const pane = findChatListPane();
  if (!pane) throw new Error("Abra o WhatsApp Web e aguarde a lista de conversas carregar.");

  const originalScrollPosition = pane.scrollTop;
  const chatsByName = new Map();
  let attemptsWithoutProgress = 0;

  await scrollToTop(pane);
  while (attemptsWithoutProgress < MAX_SCROLL_ATTEMPTS_WITHOUT_PROGRESS) {
    collectVisibleChats(pane, chatsByName);
    onProgress(chatsByName.size);
    const moved = await scrollOneStepDown(pane);
    attemptsWithoutProgress = moved ? 0 : attemptsWithoutProgress + 1;
  }

  pane.scrollTop = originalScrollPosition;
  return sortByMostForgotten(chatsByName.values());
}

export async function scrollToTop(pane) {
  pane.scrollTop = 0;
  await wait(INITIAL_SCROLL_DELAY_MS);
}

export async function scrollOneStepDown(pane) {
  const previousPosition = pane.scrollTop;
  pane.scrollTop += pane.clientHeight * SCROLL_STEP_RATIO;
  await wait(SCROLL_SETTLE_DELAY_MS);
  return pane.scrollTop !== previousPosition;
}