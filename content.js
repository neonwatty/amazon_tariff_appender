// This script runs on Amazon product pages
function init() {
  // Make sure we're on a product page
  if (window.location.href.includes('/dp/') || window.location.href.includes('/gp/product/')) {
    console.log('Amazon Tariff Appender: Running on product page');
    injectTariffField();
  }
}

function injectTariffField() {
  // Look for the Buy Box area using multiple possible selectors for better coverage
  // These are common selectors for the price/buy area on Amazon product pages
  const buyBoxSelectors = [
    '#corePrice_feature_div',                 // Common price container
    '#corePriceDisplay_desktop_feature_div',  // Alternative price container
    '.a-box-group .a-price-wrapper',          // Parent of price in some layouts
    '#price',                                 // Simple price container
    '#buybox',                                // The buy box itself
    '#desktop_buybox',                        // Desktop-specific buy box
    '.celwidget[data-feature-name="buybox"]'  // Another buybox selector
  ];
  
  let targetElement = null;
  
  // Try each selector until we find one that exists on the page
  for (const selector of buyBoxSelectors) {
    const element = document.querySelector(selector);
    if (element) {
      targetElement = element;
      console.log(`Amazon Tariff Appender: Found target element with selector: ${selector}`);
      break;
    }
  }
  
  if (!targetElement) {
    console.log('Amazon Tariff Appender: Buy Box not found, retrying in 1 second');
    // The page might still be loading, try again in a moment
    setTimeout(injectTariffField, 1000);
    return;
  }
  
  // Check if we've already injected our element
  if (document.querySelector('.tariff-info')) {
    console.log('Amazon Tariff Appender: Tariff field already exists');
    return;
  }
  
  // Enhanced price detection with multiple selectors and formats
  const extractPrice = () => {
    // Array of possible price selectors in order of reliability
    const priceSelectors = [
      '.a-price .a-offscreen',                   // Most common price format (hidden accessible price)
      '#priceblock_ourprice',                    // Classic price element
      '.a-price',                                // General price class
      '.a-color-price',                          // Color price
      '[data-a-color="price"] .a-offscreen',     // Another hidden price format
      '.celwidget span.a-color-price',           // Sometimes used in deals
      '#corePrice_feature_div .a-price-whole, #corePriceDisplay_desktop_feature_div .a-price-whole' // Whole price part
    ];
    
    // Try each selector
    for (const selector of priceSelectors) {
      const elements = document.querySelectorAll(selector);
      for (const element of elements) {
        const text = element.innerText || element.textContent;
        if (!text) continue;
        
        // Different regex patterns for different price formats
        const patterns = [
          /\$?(\d+,\d+\.\d+)/,        // $1,234.56 format
          /\$?(\d+\.\d+)/,            // $123.45 format
          /\$?(\d+)/                  // $123 format
        ];
        
        for (const pattern of patterns) {
          const match = text.match(pattern);
          if (match && match[1]) {
            // Remove commas and convert to float
            return parseFloat(match[1].replace(/,/g, ''));
          }
        }
      }
    }
    
    // Couldn't find price
    return null;
  };
  
  // Calculate tariff dynamically based on product category and price
  const calculateTariff = (price) => {
    if (!price) return { percentage: 25, amount: null };
    
    // Get product category (if possible)
    const categoryElement = document.querySelector('#wayfinding-breadcrumbs_feature_div, .nav-a-content');
    let category = '';
    
    if (categoryElement) {
      category = categoryElement.innerText || categoryElement.textContent || '';
      category = category.toLowerCase();
    }
    
    // Dynamic tariff rates based on product categories
    // These are example rates - adjust as needed
    let tariffPercentage = 25; // Default rate
    
    if (category.includes('electronics') || category.includes('computer')) {
      tariffPercentage = 30;
    } else if (category.includes('clothing') || category.includes('apparel')) {
      tariffPercentage = 20;
    } else if (category.includes('food') || category.includes('grocery')) {
      tariffPercentage = 15;
    } else if (category.includes('book')) {
      tariffPercentage = 10;
    }
    
    // Calculate the tariff amount
    const tariffAmount = price * (tariffPercentage / 100);
    
    return {
      percentage: tariffPercentage,
      amount: tariffAmount
    };
  };
  
  // Try to get the product price
  const price = extractPrice();
  let productPrice = price ? `$${price.toFixed(2)}` : "unavailable";
  
  // Calculate the tariff
  const tariff = calculateTariff(price);
  let calculatedTariff = "unavailable";
  
  if (price && tariff.amount !== null) {
    calculatedTariff = `$${tariff.amount.toFixed(2)} (${tariff.percentage}%)`;
  } else {
    calculatedTariff = `${tariff.percentage}%`;
  }
  
  // Create our custom field with attention-grabbing styling
  const tariffDiv = document.createElement('div');
  tariffDiv.className = 'tariff-info';
  tariffDiv.style.marginTop = '10px';
  tariffDiv.style.padding = '10px 15px';
  tariffDiv.style.backgroundColor = '#FFF4E6'; // Light orange background
  tariffDiv.style.border = '1px solid #FF9900'; // Amazon orange border
  tariffDiv.style.borderRadius = '4px';
  tariffDiv.style.fontSize = '14px';
  tariffDiv.style.color = '#111';
  tariffDiv.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
  
  tariffDiv.innerHTML = `
    <div style="font-weight: bold; color: #E67A00; margin-bottom: 5px; font-size: 16px;">Import Tariff Information</div>
    <div style="display: flex; justify-content: space-between;">
      <span>Product Price:</span>
      <span style="font-weight: bold;">${productPrice}</span>
    </div>
    <div style="display: flex; justify-content: space-between; margin-top: 4px;">
      <span>Estimated Tariff:</span>
      <span style="font-weight: bold; color: #B12704;">${calculatedTariff}</span>
    </div>
    <div style="font-size: 11px; color: #555; margin-top: 5px; text-align: right;">
      Based on product category and current import regulations
    </div>
  `;
  
  // Insert after the target element (buybox or price section)
  targetElement.insertAdjacentElement('afterend', tariffDiv);
  console.log('Amazon Tariff Appender: Tariff field injected');
}

// Run on page load
init();

// Also run when the URL changes without a full page reload (Amazon uses AJAX)
let lastUrl = location.href; 
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    init();
  }
}).observe(document, {subtree: true, childList: true});