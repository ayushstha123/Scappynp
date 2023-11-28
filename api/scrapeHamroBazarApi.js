import puppeteer from 'puppeteer';

export async function scrapeHamroBazarProduct(productName) {
  try {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    await page.goto(`https://hamrobazaar.com/search/product?q=${productName}`);
    await page.waitForSelector('select[name="sortParam"]');

    await page.select('select[name="sortParam"]', '5');

    // Scroll down to load more products
    await autoScroll(page);

    // Wait for the product cards to load
    await page.waitForSelector('.product-list .card-product-linear', { visible: false });

    const productItems = await page.$$('.product-list .card-product-linear');

    const maxProductCount = Math.min(5, productItems.length);

    const products = await Promise.all(
      productItems.slice(0, maxProductCount).map(async (productItem) => {
        const title = await productItem.$eval('.product-title', (element) => element.textContent);
        const price = await productItem.$eval('.regularPrice', (element) => element.textContent);
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

    await browser.close();

    if (products.length === 0) {
      return [{ title: 'No products found' }];
    }

    return products;
  } catch (error) {
    return JSON.stringify({ message: 'An error occurred while scraping the product data.' });
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
