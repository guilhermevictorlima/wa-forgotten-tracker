import { STORAGE_KEY } from "./constants.js";

export async function loadIgnoredNames() {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  return result[STORAGE_KEY] ?? [];
}

export async function saveIgnoredNames(names) {
  await chrome.storage.local.set({ [STORAGE_KEY]: [...names] });
}