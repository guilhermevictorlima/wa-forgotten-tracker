// Interpretação do rótulo de horário exibido em cada conversa.
import {
  MAX_TIME_LABEL_LENGTH,
  WEEKDAY_INDEX_BY_NAME,
  YESTERDAY_LABELS,
  CLOCK_TIME_PATTERN,
  NUMERIC_DATE_PATTERN
} from "./constants.js";
import { countWholeDaysSince, normalizeText } from "./utils.js";

function isLocaleDayFirst() {
  const locale = document.documentElement.lang || navigator.language;
  return !/^en-us/i.test(locale);
}

function isClockTime(label) {
  return CLOCK_TIME_PATTERN.test(label);
}

function isYesterday(label) {
  return YESTERDAY_LABELS.includes(label);
}

function isWeekdayName(label) {
  return label in WEEKDAY_INDEX_BY_NAME;
}

function countDaysSinceWeekday(weekdayName) {
  const todayIndex = new Date().getDay();
  const targetIndex = WEEKDAY_INDEX_BY_NAME[weekdayName];
  const difference = (todayIndex - targetIndex + 7) % 7;
  return difference === 0 ? 7 : difference;
}

function expandTwoDigitYear(year) {
  return year < 100 ? year + 2000 : year;
}

function resolveDayAndMonth(first, second) {
  if (first > 12) return { day: first, month: second };
  if (second > 12) return { day: second, month: first };
  return isLocaleDayFirst()
    ? { day: first, month: second }
    : { day: second, month: first };
}

function parseNumericDate(label) {
  const match = label.match(NUMERIC_DATE_PATTERN);
  if (!match) return null;

  const [, first, second, year] = match.map(Number);
  const { day, month } = resolveDayAndMonth(first, second);
  return new Date(expandTwoDigitYear(year), month - 1, day);
}

export function convertTimeLabelToDaysAgo(rawLabel) {
  const label = normalizeText(rawLabel);
  if (!label || label.length > MAX_TIME_LABEL_LENGTH) return null;

  if (isClockTime(label)) return 0;
  if (isYesterday(label)) return 1;
  if (isWeekdayName(label)) return countDaysSinceWeekday(label);

  const date = parseNumericDate(label);
  return date ? countWholeDaysSince(date) : null;
}
