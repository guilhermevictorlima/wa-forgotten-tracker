import { DAYS_TO_BE_COOL, DAYS_TO_BE_COLD, MIN_BAR_WIDTH_PERCENT } from "./constants.js";

export function formatDaysAgo(daysAgo) {
  if (daysAgo === 0) return "hoje";
  if (daysAgo === 1) return "ontem";
  return `há ${daysAgo} dias`;
}

export function classifyForgetfulness(daysAgo) {
  if (daysAgo >= DAYS_TO_BE_COLD) return "cold";
  if (daysAgo >= DAYS_TO_BE_COOL) return "cool";
  return "warm";
}

export function calculateBarWidthPercent(daysAgo, maxDaysAgo) {
  return Math.max(MIN_BAR_WIDTH_PERCENT, (daysAgo / maxDaysAgo) * 100);
}

export function findMaxDaysAgo(chats) {
  return Math.max(1, ...chats.map((chat) => chat.daysAgo));
}
