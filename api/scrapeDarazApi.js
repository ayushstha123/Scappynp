import puppeteer from 'puppeteer';

export async function scrapeDarazProduct(productName) {
  try {
    const browser = await puppeteer.launch({
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--start-maximized'],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    // Modify the search term to include both singular and plural forms
    const singularForm = productName;
    const pluralForm = productName.endsWith('s') ? productName : productName + 's';
    const searchRegex = new RegExp(`(${singularForm}|${pluralForm})`, 'i');
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
      return productItems.slice(0, 5).map((productItem) => {
        const title = productItem.querySelector('.title--wFj93 a').textContent;
        const price = productItem.querySelector('.price--NVB62').textContent;
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

    await browser.close();

    if (relevantProducts.length === 0) {
      return JSON.stringify({ message: 'No relevant products found' });
    }

    return relevantProducts;
  } catch (error) {
    return JSON.stringify({ message: `An error occurred while scraping the product data: ${error.message}` });
  }
}
