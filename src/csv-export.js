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

export function exportChatsAsCsv(chats) {
  downloadTextFile(buildCsvContent(chats), buildCsvFileName(), "text/csv");
}
