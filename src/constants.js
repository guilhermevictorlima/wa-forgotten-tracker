export const ONE_DAY_IN_MS = 86_400_000;
export const MAX_TIME_LABEL_LENGTH = 20;
export const SCROLL_STEP_RATIO = 0.8;
export const SCROLL_SETTLE_DELAY_MS = 350;
export const INITIAL_SCROLL_DELAY_MS = 500;
export const MAX_SCROLL_ATTEMPTS_WITHOUT_PROGRESS = 3;
export const DAYS_TO_BE_COOL = 7;
export const DAYS_TO_BE_COLD = 30;
export const MIN_BAR_WIDTH_PERCENT = 4;

export const WEEKDAY_INDEX_BY_NAME = {
  "domingo": 0, "segunda-feira": 1, "terça-feira": 2, "quarta-feira": 3,
  "quinta-feira": 4, "sexta-feira": 5, "sábado": 6,
  "sunday": 0, "monday": 1, "tuesday": 2, "wednesday": 3,
  "thursday": 4, "friday": 5, "saturday": 6
};

export const YESTERDAY_LABELS = ["ontem", "yesterday"];
export const CLOCK_TIME_PATTERN = /^\d{1,2}:\d{2}(\s?[ap]\.?\s?m\.?)?$/;
export const NUMERIC_DATE_PATTERN = /^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{2,4})$/;

export const SELECTORS = {
  chatListPane: "#pane-side",
  chatRowsPrimary: '[role="listitem"]',
  chatRowsFallback: '[role="row"]',
  contactTitle: "span[title]",
  rowTextElements: "div, span",
  openChat: "#main"
};

export const PANEL_TEMPLATE_PATH = "src/ui/panel.html";

export const HIGHLIGHT_CLASS = "wai-highlight";
export const HIGHLIGHT_DURATION_MS = 2500;