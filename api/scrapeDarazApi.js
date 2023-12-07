import puppeteer from 'puppeteer';

export async function scrapeDarazProduct(productName) {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--start-maximized'],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 2020, height: 3080 });
    
    const formattedProductName = productName.replace(/[:,_]/g, '');
    const singularForm = formattedProductName;
    const pluralForm = formattedProductName.endsWith('s') ? formattedProductName : formattedProductName + 's';
    
// Create a case-insensitive regular expression with a requirement of at least two common letters
const searchRegex = new RegExp(`(?=.*[a-zA-Z].*[a-zA-Z])(${singularForm}|${pluralForm})`, 'i');

    const encodedProductName = encodeURIComponent(productName);
    const url = `https://www.daraz.com.np/catalog/?q=${encodedProductName}`;

    await page.goto(url);

    const areElementsPresent = await page.waitForSelector('.gridItem--Yd0sa', { visible: true, timeout: 4000 })
      .then(() => true)
      .catch(() => false);

    if (!areElementsPresent) {
      await browser.close();
      return JSON.stringify({ message: 'An error occurred while scraping the product data. Required elements not found.' });
    }

    await page.waitForSelector('.gridItem--Yd0sa', { visible: true });

    const products = await page.$$eval('.gridItem--Yd0sa', (productItems) => {
      return productItems.slice(0, 10).map((productItem) => {
        const title = productItem.querySelector('.title--wFj93 a').textContent;
        const priceElement = productItem.querySelector('.price--NVB62');
        const price = priceElement ? priceElement.textContent.replace(/[^0-9]/g, '') : 'Price not found';     
        const discountElement = productItem.querySelector('.discount--HADrg');
        const discount = discountElement ? discountElement.textContent : 'No discount';

        const originalPriceElement = productItem.querySelector('.origPrice--AJxRs');
        const actualPrice = originalPriceElement ? originalPriceElement.textContent.trim() : '';

        const imgElement = productItem.querySelector('.image--Smuib');
        const imgSrc = imgElement ? imgElement.getAttribute('src') : 'Image not found';

        const urlElement = productItem.querySelector('.title--wFj93 a');
        const url = urlElement ? urlElement.getAttribute('href') : 'URL not found';

        return {
          title,
          price,
          discount,
          originalPrice: actualPrice,
          img: imgSrc,
          url,
        };
      });
    });

    // Filter out irrelevant products based on a case-insensitive match
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
