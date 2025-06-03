## Sample

![2025_06_02_14_29_19_Window](https://github.com/user-attachments/assets/adc96699-9791-4b0e-a912-3601a3f1d97b)

# Settings
![image](https://github.com/user-attachments/assets/01618416-4d87-4c9e-83fa-fcaf654b7cb2)



# Email Collector Extension

A Chrome extension that collects email addresses from web pages, including dynamic content like Excel-like columns(some issues with that but soon to be fixed), with features for filtering, exporting, and analytics.

## Features
- **Email Collection**: Automatically gathers emails from text, tables, and dynamic elements.
- **Filtering**: Filter emails by domain using a search bar.
- **Export Options**: Export collected emails as CSV, JSON, or copy to clipboard.
- **Analytics Dashboard**: Displays total emails and unique domains.
- **Settings Panel**: Configure scan interval and include/exclude domains.
- **Performance Optimization**: Limits storage to 1000 emails.
- **Professional UI**: Consistent color scheme and placeholder for logo.

## Installation
1. Clone the repository: `git clone https://github.com/Jexasa/MailCollector.git`
2. Open Chrome and go to `chrome://extensions/`.
3. Enable "Developer mode" in the top right.
4. Click "Load unpacked" and select the cloned repository folder.
5. The extension should appear in your toolbar.

## Usage
1. Click the extension icon to open the popup.
2. Visit any webpage with emails to start collection.
3. Use the domain filter to narrow down results.
4. Clear emails or export them as needed.
5. Access settings via the settings button to adjust preferences.

## Development
- **Files**:
  - `popup.html`: Main UI.
  - `settings.html`: Settings page.
  - `popup.js`: Popup logic.
  - `settings.js`: Settings logic.
  - `content.js`: Email collection script.
  - `background.js`: Background service worker.
  - `styles.css`: Styling with Tailwind CSS.
  - `manifest.json`: Extension manifest.
- **Dependencies**: Tailwind CSS (included in `styles.css`).
- **Debugging**: Check console logs for collection status.

## Contributing
Feel free to submit issues or pull requests. Ensure code follows security best practices.


## Version
0.1.0 - Released on June, 2025.
