import { SELECTORS } from "./constants.js";

export function isChatOpen() {
  return document.querySelector(SELECTORS.openChat) !== null;
}

export function watchOpenChat(onChange) {
  let lastState = isChatOpen();
  let checkScheduled = false;

  onChange(lastState);

  const observer = new MutationObserver(() => {
    if (checkScheduled) return;
    checkScheduled = true;

    requestAnimationFrame(() => {
      checkScheduled = false;
      const currentState = isChatOpen();
      if (currentState === lastState) return;

      lastState = currentState;
      onChange(currentState);
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
  return () => observer.disconnect();
}