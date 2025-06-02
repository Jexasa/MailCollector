document.addEventListener('DOMContentLoaded', () => {
  const emailList = document.getElementById('emailList');
  const exportCSVBtn = document.getElementById('exportCSVBtn');
  const exportJSONBtn = document.getElementById('exportJSONBtn');
  const copyBtn = document.getElementById('copyBtn');
  const clearBtn = document.getElementById('clearBtn');
  const domainFilter = document.getElementById('domainFilter');
  const status = document.getElementById('status');
  const totalEmails = document.getElementById('totalEmails');
  const uniqueDomains = document.getElementById('uniqueDomains');
  const settingsBtn = document.getElementById('settingsBtn');
  let allEmails = [];
  const MAX_EMAILS = 1000;

  function updateEmailList(emails = []) {
    emailList.innerHTML = emails.length
      ? emails.map((email, index) => {
          const isValid = email.includes('@') && email.split('@')[1].includes('.');
          return `
            <tr class="border-b border-gray-600">
              <td class="p-2 text-sm !text-gray-300">${index + 1}</td>
              <td class="p-2 text-sm truncate ${!isValid ? 'text-red-500' : 'text-gray-300'}">${email}</td>
              <td class="p-2 text-sm ${!isValid ? 'text-red-500' : 'text-green-500'}">${isValid ? 'Valid' : 'Invalid'}</td>
            </tr>
          `;
        }).join('')
      : '<tr><td colspan="3" class="text-gray-400 text-center text-sm py-2">No emails collected yet.</td></tr>';
    status.textContent = emails.length ? 'Idle' : 'Collecting...';
    totalEmails.textContent = emails.length;
    uniqueDomains.textContent = new Set(emails.map(e => e.split('@')[1].split('.')[0])).size;
  }

  chrome.storage.local.get(['collectedEmails'], ({ collectedEmails = [] }) => {
    allEmails = collectedEmails.slice(0, MAX_EMAILS);
    updateEmailList(allEmails);
  });

  domainFilter.addEventListener('input', () => {
    const filterText = domainFilter.value.trim().toLowerCase();
    const filteredEmails = filterText
      ? allEmails.filter(email => email.toLowerCase().includes(filterText))
      : allEmails;
    updateEmailList(filteredEmails);
  });

  exportCSVBtn.addEventListener('click', () => {
    if (allEmails.length) {
      const csv = 'Email\n' + allEmails.join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      chrome.downloads.download({ url, filename: `emails_${new Date().toISOString().split('T')[0]}.csv` });
    }
  });

  exportJSONBtn.addEventListener('click', () => {
    if (allEmails.length) {
      const json = JSON.stringify(allEmails, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      chrome.downloads.download({ url, filename: `emails_${new Date().toISOString().split('T')[0]}.json` });
    }
  });

  copyBtn.addEventListener('click', () => {
    if (allEmails.length) {
      navigator.clipboard.writeText(allEmails.join('\n')).then(() => {
        copyBtn.textContent = 'Copied!';
        setTimeout(() => (copyBtn.textContent = 'Copy'), 2000);
      });
    }
  });

  clearBtn.addEventListener('click', () => {
    chrome.storage.local.set({ collectedEmails: [] }, () => {
      allEmails = [];
      updateEmailList([]);
      chrome.runtime.sendMessage({ action: 'restartCollection' }, (response) => {
        console.log('Restart collection response:', response);
      });
    });
  });

  settingsBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'openSettings' }, (response) => {
      console.log('Settings open response:', response);
    });
  });

  chrome.storage.onChanged.addListener(changes => {
    if (changes.collectedEmails) {
      allEmails = changes.collectedEmails.newValue.slice(0, MAX_EMAILS) || [];
      const filterText = domainFilter.value.trim().toLowerCase();
      const filteredEmails = filterText
        ? allEmails.filter(email => email.toLowerCase().includes(filterText))
        : allEmails;
      updateEmailList(filteredEmails);
    }
  });
});