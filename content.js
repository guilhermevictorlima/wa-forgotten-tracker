// Ponto de entrada declarado no manifest.
// Content scripts não aceitam "import" estático, então carregamos os módulos dinamicamente.
(async () => {
  const { initialize } = await import(chrome.runtime.getURL("src/main.js"));
  await initialize();
})();
