import { state } from "./state.js";
import { loadIgnoredNames, saveIgnoredNames } from "./storage.js";

export async function loadIgnoredIntoState() {
  state.ignoredNames = new Set(await loadIgnoredNames());
}

export function getActiveChats() {
  return state.chats.filter((chat) => !state.ignoredNames.has(chat.name));
}

async function updateIgnored(mutate) {
  const next = new Set(state.ignoredNames);
  mutate(next);
  await saveIgnoredNames(next);
  state.ignoredNames = next;
}

export const ignoreChat = (name) => updateIgnored((names) => names.add(name));
export const restoreChat = (name) => updateIgnored((names) => names.delete(name));