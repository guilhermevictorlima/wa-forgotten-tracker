(() => {
  "use strict";

  // ===================== Constantes =====================

  const ONE_DAY_IN_MS = 86_400_000;
  const MAX_TIME_LABEL_LENGTH = 20;
  const SCROLL_STEP_RATIO = 0.8;
  const SCROLL_SETTLE_DELAY_MS = 350;
  const INITIAL_SCROLL_DELAY_MS = 500;
  const MAX_SCROLL_ATTEMPTS_WITHOUT_PROGRESS = 3;
  const DAYS_TO_BE_COOL = 7;
  const DAYS_TO_BE_COLD = 30;
  const MIN_BAR_WIDTH_PERCENT = 4;

  const WEEKDAY_INDEX_BY_NAME = {
    "domingo": 0, "segunda-feira": 1, "terça-feira": 2, "quarta-feira": 3,
    "quinta-feira": 4, "sexta-feira": 5, "sábado": 6,
    "sunday": 0, "monday": 1, "tuesday": 2, "wednesday": 3,
    "thursday": 4, "friday": 5, "saturday": 6
  };

  const YESTERDAY_LABELS = ["ontem", "yesterday"];
  const CLOCK_TIME_PATTERN = /^\d{1,2}:\d{2}(\s?[ap]\.?\s?m\.?)?$/;
  const NUMERIC_DATE_PATTERN = /^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{2,4})$/;

  const SELECTORS = {
    chatListPane: "#pane-side",
    chatRowsPrimary: '[role="listitem"]',
    chatRowsFallback: '[role="row"]',
    contactTitle: "span[title]",
    rowTextElements: "div, span"
  };

  // ===================== Utilidades =====================

  function wait(milliseconds) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  }

  function getStartOfToday() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }

  function countWholeDaysSince(date) {
    const elapsedMs = getStartOfToday() - date;
    return Math.max(0, Math.round(elapsedMs / ONE_DAY_IN_MS));
  }

  function normalizeText(text) {
    return (text || "").trim().toLowerCase();
  }

  // ===================== Interpretação do rótulo de horário =====================

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

  function convertTimeLabelToDaysAgo(rawLabel) {
    const label = normalizeText(rawLabel);
    if (!label || label.length > MAX_TIME_LABEL_LENGTH) return null;

    if (isClockTime(label)) return 0;
    if (isYesterday(label)) return 1;
    if (isWeekdayName(label)) return countDaysSinceWeekday(label);

    const date = parseNumericDate(label);
    return date ? countWholeDaysSince(date) : null;
  }

  // ===================== Leitura das linhas da lista de conversas =====================

  function findChatListPane() {
    return document.querySelector(SELECTORS.chatListPane);
  }

  function findVisibleChatRows(pane) {
    const primaryRows = pane.querySelectorAll(SELECTORS.chatRowsPrimary);
    return primaryRows.length ? primaryRows : pane.querySelectorAll(SELECTORS.chatRowsFallback);
  }

  function readContactName(titleElement) {
    return titleElement?.getAttribute("title")?.trim() || null;
  }

  function isLeafElementOutsideTitle(element, titleElement) {
    return element.children.length === 0 && !titleElement.contains(element);
  }

  function findLastMessageTime(row, titleElement) {
    for (const element of row.querySelectorAll(SELECTORS.rowTextElements)) {
      if (!isLeafElementOutsideTitle(element, titleElement)) continue;

      const daysAgo = convertTimeLabelToDaysAgo(element.textContent);
      if (daysAgo !== null) return { daysAgo, label: element.textContent.trim() };
    }
    return null;
  }

  function readChatRow(row) {
    const titleElement = row.querySelector(SELECTORS.contactTitle);
    const name = readContactName(titleElement);
    if (!name) return null;

    const lastMessage = findLastMessageTime(row, titleElement);
    return lastMessage ? { name, ...lastMessage } : null;
  }

  function collectVisibleChats(pane, chatsByName) {
    for (const row of findVisibleChatRows(pane)) {
      const chat = readChatRow(row);
      if (chat && !chatsByName.has(chat.name)) chatsByName.set(chat.name, chat);
    }
  }

  // ===================== Varredura com rolagem =====================

  async function scrollToTop(pane) {
    pane.scrollTop = 0;
    await wait(INITIAL_SCROLL_DELAY_MS);
  }

  async function scrollOneStepDown(pane) {
    const previousPosition = pane.scrollTop;
    pane.scrollTop += pane.clientHeight * SCROLL_STEP_RATIO;
    await wait(SCROLL_SETTLE_DELAY_MS);
    return pane.scrollTop !== previousPosition;
  }

  function sortByMostForgotten(chats) {
    return [...chats].sort((a, b) => b.daysAgo - a.daysAgo);
  }

  async function scanAllChats(onProgress) {
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

  // ===================== Formatação =====================

  function formatDaysAgo(daysAgo) {
    if (daysAgo === 0) return "hoje";
    if (daysAgo === 1) return "ontem";
    return `há ${daysAgo} dias`;
  }

  function classifyForgetfulness(daysAgo) {
    if (daysAgo >= DAYS_TO_BE_COLD) return "cold";
    if (daysAgo >= DAYS_TO_BE_COOL) return "cool";
    return "warm";
  }

  function calculateBarWidthPercent(daysAgo, maxDaysAgo) {
    return Math.max(MIN_BAR_WIDTH_PERCENT, (daysAgo / maxDaysAgo) * 100);
  }

  function findMaxDaysAgo(chats) {
    return Math.max(1, ...chats.map((chat) => chat.daysAgo));
  }

  // ===================== Filtros =====================

  function matchesMinimumDays(chat, minimumDays) {
    return chat.daysAgo >= minimumDays;
  }

  function matchesNameQuery(chat, query) {
    return chat.name.toLowerCase().includes(query);
  }

  function filterChats(chats, { minimumDays, nameQuery }) {
    return chats.filter((chat) =>
      matchesMinimumDays(chat, minimumDays) && matchesNameQuery(chat, nameQuery)
    );
  }

  // ===================== Exportação CSV =====================

  function escapeCsvValue(value) {
    return `"${String(value).replace(/"/g, '""')}"`;
  }

  function buildCsvContent(chats) {
    const header = "nome;dias_desde_ultima_conversa";
    const lines = chats.map((chat) => `${escapeCsvValue(chat.name)};${chat.daysAgo}`);
    return [header, ...lines].join("\n");
  }

  function buildCsvFileName() {
    const isoDate = new Date().toISOString().slice(0, 10);
    return `conversas-${isoDate}.csv`;
  }

  function downloadTextFile(content, fileName, mimeType) {
    const utf8Bom = "\ufeff";
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([utf8Bom + content], { type: mimeType }));
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  function exportChatsAsCsv(chats) {
    downloadTextFile(buildCsvContent(chats), buildCsvFileName(), "text/csv");
  }

  // ===================== Construção da interface =====================

  const PANEL_TEMPLATE = `
    <header class="wai-head">
      <h2>Conversas esquecidas</h2>
      <button class="wai-close" aria-label="Fechar">×</button>
    </header>
    <div class="wai-controls">
      <button class="wai-scan">Varrer conversas</button>
      <label>Mostrar a partir de
        <input class="wai-min" type="number" min="0" value="0"> dias
      </label>
      <input class="wai-search" type="search" placeholder="Filtrar por nome">
    </div>
    <p class="wai-status">Clique em “Varrer conversas” para montar a lista.</p>
    <ol class="wai-list"></ol>
    <footer class="wai-foot">
      <button class="wai-csv" disabled>Exportar CSV</button>
    </footer>`;

  function createToggleButton() {
    const button = document.createElement("button");
    button.className = "wai-toggle";
    button.title = "Conversas esquecidas";
    button.textContent = "⏳";
    return button;
  }

  function createPanel() {
    const panel = document.createElement("aside");
    panel.className = "wai-panel";
    panel.hidden = true;
    panel.innerHTML = PANEL_TEMPLATE;
    return panel;
  }

  function mapPanelElements(panel) {
    const find = (selector) => panel.querySelector(selector);
    return {
      panel,
      closeButton: find(".wai-close"),
      scanButton: find(".wai-scan"),
      minimumDaysInput: find(".wai-min"),
      nameSearchInput: find(".wai-search"),
      statusText: find(".wai-status"),
      chatList: find(".wai-list"),
      exportButton: find(".wai-csv")
    };
  }

  function createTextSpan(className, text) {
    const span = document.createElement("span");
    span.className = className;
    span.textContent = text;
    return span;
  }

  function createChatListItem(chat, maxDaysAgo) {
    const item = document.createElement("li");
    item.className = `wai-item wai-${classifyForgetfulness(chat.daysAgo)}`;
    item.title = `Rótulo original: ${chat.label}`;
    item.style.setProperty("--w", `${calculateBarWidthPercent(chat.daysAgo, maxDaysAgo)}%`);
    item.append(
      createTextSpan("wai-name", chat.name),
      createTextSpan("wai-days", formatDaysAgo(chat.daysAgo))
    );
    return item;
  }

  // ===================== Estado e renderização =====================

  const state = { chats: [] };

  function readFilters(ui) {
    return {
      minimumDays: Number(ui.minimumDaysInput.value) || 0,
      nameQuery: normalizeText(ui.nameSearchInput.value)
    };
  }

  function showStatus(ui, message) {
    ui.statusText.textContent = message;
  }

  function renderChatList(ui, visibleChats) {
    const maxDaysAgo = findMaxDaysAgo(state.chats);
    ui.chatList.replaceChildren(
      ...visibleChats.map((chat) => createChatListItem(chat, maxDaysAgo))
    );
  }

  function renderSummary(ui, visibleCount) {
    if (state.chats.length) showStatus(ui, `${visibleCount} de ${state.chats.length} conversas`);
  }

  function render(ui) {
    const visibleChats = filterChats(state.chats, readFilters(ui));
    renderChatList(ui, visibleChats);
    renderSummary(ui, visibleChats.length);
  }

  // ===================== Ações do usuário =====================

  function togglePanelVisibility(ui) {
    ui.panel.hidden = !ui.panel.hidden;
  }

  function hidePanel(ui) {
    ui.panel.hidden = true;
  }

  function showEmptyResultWarning(ui) {
    showStatus(ui, "Nenhuma conversa reconhecida. O layout do WhatsApp pode ter mudado.");
  }

  function applyScanResult(ui, chats) {
    state.chats = chats;
    ui.exportButton.disabled = chats.length === 0;
    if (chats.length === 0) showEmptyResultWarning(ui);
    render(ui);
  }

  async function handleScanClick(ui) {
    ui.scanButton.disabled = true;
    try {
      const chats = await scanAllChats((count) => showStatus(ui, `Lendo conversas… ${count} encontradas`));
      applyScanResult(ui, chats);
    } catch (error) {
      showStatus(ui, error.message);
    } finally {
      ui.scanButton.disabled = false;
    }
  }

  function bindEvents(ui, toggleButton) {
    toggleButton.addEventListener("click", () => togglePanelVisibility(ui));
    ui.closeButton.addEventListener("click", () => hidePanel(ui));
    ui.scanButton.addEventListener("click", () => handleScanClick(ui));
    ui.exportButton.addEventListener("click", () => exportChatsAsCsv(state.chats));
    ui.minimumDaysInput.addEventListener("input", () => render(ui));
    ui.nameSearchInput.addEventListener("input", () => render(ui));
  }

  // ===================== Inicialização =====================

  function initialize() {
    const toggleButton = createToggleButton();
    const panel = createPanel();
    document.body.append(toggleButton, panel);
    bindEvents(mapPanelElements(panel), toggleButton);
  }

  initialize();
})();