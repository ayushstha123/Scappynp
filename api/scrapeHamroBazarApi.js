import puppeteer from 'puppeteer';

export async function scrapeHamroBazarProduct(productName) {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // Encode the search query
    const encodedProductName = encodeURIComponent(productName);

    await page.goto(`https://hamrobazaar.com/search/product?q=${encodedProductName}`);

    await page.waitForSelector('select[name="sortParam"]');
    await autoScroll(page);

    const areElementsPresent = await page
      .waitForSelector('.product-title', { visible: true, timeout: 3000 })
      .then(() => true)
      .catch(() => false);

      const singularForm = productName;
      const pluralForm = productName.endsWith('s') ? productName : productName + 's';
      
      // Create a case-insensitive regular expression with a requirement of at least two common letters
      const searchRegex = new RegExp(`(?=.*[a-zA-Z].*[a-zA-Z])(${singularForm}|${pluralForm})`, 'i');
    
    if (!areElementsPresent) {
      await browser.close();
      return JSON.stringify({ message: 'An error occurred while scraping the product data. Required elements not found.' });
    }

    await page.waitForSelector('.product-list .card-product-linear', { visible: true });

    const productItems = await page.$$('.product-list .card-product-linear');

    const maxProductCount = Math.min(5, productItems.length);

    const products = await Promise.all(
      productItems.slice(0, maxProductCount).map(async (productItem) => {
        const title = await productItem.$eval('.product-title', (element) => element.textContent);
        const priceElement = await productItem.$('.regularPrice');
        const price = priceElement ? await priceElement.evaluate((element) => element.textContent.replace(/[^0-9]/g, '')) : 'Price not found';
        
        const imgElement = await productItem.$('.linear-img');
        const imgSrc = await imgElement.evaluate((element) => element.getAttribute('src'));
        const url = await productItem.$eval('a[target="_blank"]', (element) => element.getAttribute('href'));

        return {
          title: title.trim(),
          price: price.trim(),
          img: imgSrc,
          url: 'https://hamrobazaar.com' + url,
        };
      })
    );

    const relevantProducts = products.filter((product) =>
    searchRegex.test(product.title.toLowerCase())
  );
// Sort the relevant products by price in ascending order
relevantProducts.sort((a, b) => {
const priceA = parseFloat(a.price);
const priceB = parseFloat(b.price);

// Check if prices are valid numbers before comparison
if (!isNaN(priceA) && !isNaN(priceB)) {
  return priceA - priceB;
} else {
  // If either price is not a valid number, keep the current order
  return 0;
}
});

  await browser.close();

  if (relevantProducts.length === 0) {
    return JSON.stringify({ message: 'No relevant products found' });
  }

  return relevantProducts;
} catch (error) {
  return JSON.stringify({ message: `An error occurred while scraping the product data: ${error.message}` });
}
}

async function autoScroll(page) {
  await page.evaluate(async () => {
    while (true) {
      const initialHeight = document.body.scrollHeight;
      window.scrollBy(0, window.innerHeight);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const newHeight = document.body.scrollHeight;
      if (newHeight === initialHeight) {
        break;
      }
    }
  });
}
