// Troca de abas do painel, com suporte a teclado (setas esquerda/direita).
const ACTIVE_CLASS = "is-active";

export function selectTab(ui, name) {
  for (const tab of ui.tabButtons) {
    const isActive = tab.dataset.tab === name;
    tab.classList.toggle(ACTIVE_CLASS, isActive);
    tab.setAttribute("aria-selected", String(isActive));
    tab.tabIndex = isActive ? 0 : -1;
  }
  for (const pane of ui.tabPanes) {
    pane.hidden = pane.dataset.pane !== name;
  }
}

function moveToNeighborTab(ui, currentTab, step) {
  const tabs = ui.tabButtons;
  const nextTab = tabs[(tabs.indexOf(currentTab) + step + tabs.length) % tabs.length];
  selectTab(ui, nextTab.dataset.tab);
  nextTab.focus();
}

export function bindTabs(ui) {
  for (const tab of ui.tabButtons) {
    tab.addEventListener("click", () => selectTab(ui, tab.dataset.tab));
    tab.addEventListener("keydown", (event) => {
      if (event.key === "ArrowRight") moveToNeighborTab(ui, tab, 1);
      else if (event.key === "ArrowLeft") moveToNeighborTab(ui, tab, -1);
      else return;
      event.preventDefault();
    });
  }
}