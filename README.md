# Amazon Tariff Appender

A simple Chrome extension that adds import tariff information to Amazon product pages.

## Features

- Automatically detects Amazon product pages
- Injects a tariff information field below the product price
- Currently displays a fixed 25% tariff rate (can be customized in future versions)

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" using the toggle in the top-right corner
3. Click "Load unpacked" and select this directory
4. Navigate to any Amazon product page to see the tariff information

## Files

- `manifest.json`: Extension configuration
- `content.js`: Script that injects the tariff field
- `images/`: Directory containing extension icons

## Future Improvements

- Add options page to customize tariff rate
- Improve detection of different Amazon page layouts
- Add support for more e-commerce websites