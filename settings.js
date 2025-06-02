document.addEventListener('DOMContentLoaded', () => {
  const saveSettings = document.getElementById('saveSettings');
  const closeSettings = document.getElementById('closeSettings');
  const scanInterval = document.getElementById('scanInterval');
  const includeDomains = document.getElementById('includeDomains');
  const excludeDomains = document.getElementById('excludeDomains');

  function updateSettings() {
    chrome.storage.local.get(['settings'], ({ settings = { interval: 5000, include: [], exclude: [] } }) => {
      scanInterval.value = settings.interval;
      includeDomains.value = settings.include.join(',');
      excludeDomains.value = settings.exclude.join(',');
    });
  }

  updateSettings();

  saveSettings.addEventListener('click', () => {
    const newSettings = {
      interval: parseInt(scanInterval.value) || 5000,
      include: includeDomains.value.split(',').map(d => d.trim()).filter(d => d),
      exclude: excludeDomains.value.split(',').map(d => d.trim()).filter(d => d)
    };
    chrome.storage.local.set({ settings: newSettings }, () => {
      chrome.runtime.sendMessage({ action: 'restartCollection' }, (response) => {
        console.log('Restart collection from settings:', response);
      });
      window.close();
    });
  });

  closeSettings.addEventListener('click', () => {
    window.close();
  });
});