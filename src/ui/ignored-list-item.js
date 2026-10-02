export function createIgnoredListItem(name) {
  const item = document.createElement("li");
  item.className = "wai-ignored-item";

  const label = document.createElement("span");
  label.className = "wai-name";
  label.textContent = name;

  const button = document.createElement("button");
  button.type = "button";
  button.className = "wai-restore-button";
  button.dataset.chatName = name;
  button.textContent = "Restaurar";
  button.setAttribute("aria-label", `Restaurar ${name}`);

  item.append(label, button);
  return item;
}