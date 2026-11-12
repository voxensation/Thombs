// A local file gets only an opening button; hosted pages start the game directly.
(() => {
  const errorPanel = document.getElementById('startup-error');
  if (window.location.protocol === 'file:') {
    errorPanel.hidden = false;
    document.getElementById('game-content').inert = true;
    return;
  }
  let retryLabel = 'Попробовать снова / Try again';
  import('./i18n.js').then(({ message, loadLanguage }) => {
    const language = loadLanguage();
    retryLabel = message('retry', language);
    return import('./main.js');
  }).catch(error => {
    const retry = errorPanel.querySelector('a');
    retry.href = window.location.href;
    retry.textContent = retryLabel;
    errorPanel.hidden = false;
    document.getElementById('game-content').inert = true;
    console.error('Не удалось загрузить игру:', error);
  });
})();
