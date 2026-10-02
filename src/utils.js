import { ONE_DAY_IN_MS } from "./constants.js";

export function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export function getStartOfToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

export function countWholeDaysSince(date) {
  const elapsedMs = getStartOfToday() - date;
  return Math.max(0, Math.round(elapsedMs / ONE_DAY_IN_MS));
}

export function normalizeText(text) {
  return (text || "").trim().toLowerCase();
}
