const emailRegex = /(?:[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+)@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(?![^<]*>|[^[]*\])(?!\.[a-zA-Z0-9]+$)/g;

let observer = null;
let intervalId = null;

function collectEmails() {
  console.log('Collecting emails at:', new Date().toLocaleTimeString());
  let text = '';

  // Collect from text nodes
  try {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    while (walker.nextNode()) {
      text += walker.currentNode.nodeValue + ' ';
    }
  } catch (e) {
    console.error('Text node collection error:', e);
  }

  // Collect from table cells, shadow DOM, and iframes
  const collectFromNode = (node) => {
    try {
      const cells = node.querySelectorAll('td, th');
      for (let cell of cells) {
        text += (cell.textContent || cell.innerText || '') + ' ';
        if (cell.focus) {
          cell.focus();
          console.log('Focused cell:', cell.textContent);
        }
      }
      const shadowRoots = node.querySelectorAll('*');
      for (let element of shadowRoots) {
        const shadow = element.shadowRoot;
        if (shadow) collectFromNode(shadow);
      }
      const iframes = node.getElementsByTagName('iframe');
      for (let iframe of iframes) {
        try {
          const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
          if (iframeDoc) collectFromNode(iframeDoc.body);
        } catch (e) {
          console.error('Iframe access error:', e);
        }
      }
    } catch (e) {
      console.error('Node collection error:', e);
    }
  };
  collectFromNode(document.body);

  // Collect from inputs, contenteditable, and other elements
  try {
    const elements = document.querySelectorAll('div, span, p, input, [contenteditable]');
    for (let element of elements) {
      if (element.tagName === 'INPUT') {
        text += (element.value || '') + ' ';
      } else if (element.isContentEditable) {
        text += (element.textContent || element.innerText || '') + ' ';
      } else {
        text += (element.textContent || element.innerText || '') + ' ';
      }
    }
  } catch (e) {
    console.error('Element collection error:', e);
  }

  let emails = [...new Set(text.match(emailRegex) || [])];
  console.log('Found emails:', emails);

  // Apply settings filters
  chrome.storage.local.get(['settings'], ({ settings = { interval: 5000, include: [], exclude: [] } }) => {
    if (settings.include.length) {
      emails = emails.filter(email => settings.include.some(domain => email.includes(domain)));
    }
    if (settings.exclude.length) {
      emails = emails.filter(email => !settings.exclude.some(domain => email.includes(domain)));
    }
    if (emails.length > 0) {
      chrome.storage.local.get(['collectedEmails'], ({ collectedEmails = [] }) => {
        const newEmails = emails.filter(email => !collectedEmails.includes(email));
        if (newEmails.length) {
          const updatedEmails = [...collectedEmails, ...newEmails].slice(0, 1000);
          chrome.storage.local.set({ collectedEmails: updatedEmails }, () => {
            console.log('Emails updated:', updatedEmails.length);
          });
        }
      });
    }
  });
}

function debounce(fn, wait) {
  let timeout;
  return () => {
    clearTimeout(timeout);
    timeout = setTimeout(fn, wait);
  };
}

function startCollection(interval = 5000) {
  if (observer) {
    observer.disconnect();
    console.log('Observer disconnected');
  }
  if (intervalId) {
    clearInterval(intervalId);
    console.log('Interval cleared');
  }

  collectEmails(); // Run immediately
  const debouncedCollect = debounce(collectEmails, 500);
  observer = new MutationObserver((mutations) => {
    debouncedCollect();
    console.log('Mutation detected:', mutations.length);
  });
  try {
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['value', 'contenteditable']
    });
    console.log('Observer started');
  } catch (e) {
    console.error('Observer error:', e);
  }

  document.addEventListener('input', debouncedCollect, { capture: true });
  document.addEventListener('focus', debouncedCollect, { capture: true });

  intervalId = setInterval(() => {
    collectEmails();
    console.log('Interval scan at:', new Date().toLocaleTimeString());
  }, interval);
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'restartCollection') {
    chrome.storage.local.get(['settings'], ({ settings = { interval: 5000 } }) => {
      startCollection(settings.interval);
      sendResponse({ status: 'Collection restarted' });
    });
  } else if (message.action === 'openSettings') {
    chrome.runtime.openOptionsPage();
    sendResponse({ status: 'Settings opened' });
  }
  return true; // Indicate async response
});

// Start collection on script load
startCollection(5000);