import puppeteer from 'puppeteer';

export async function scrapeHamroBazarProduct(productName) {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto('https://hamrobazaar.com');

    // Input and search for the product
    const searchInputSelector = 'input[name="searchValue"]';
    await page.type(searchInputSelector, productName.replace(/\W+/g, '-').toLowerCase());
    await page.keyboard.press('Enter');

    // Wait for the sorting dropdown to load
    await page.waitForSelector('select[name="sortParam"]');

    // Select the "Recent" option
    await page.select('select[name="sortParam"]', '5');

    // Scroll down to load more products
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

    // Wait for the product cards to load
    await page.waitForSelector('.product-list .card-product-linear', { visible: false });

    const products = [];
    const productItems = await page.$$('.product-list .card-product-linear');

    const maxProductCount = Math.min(5, productItems.length);

    for (let i = 0; i < maxProductCount; i++) {
      const productItem = productItems[i];

      // Extract product information from the selected product item
      const title = await productItem.$eval('.product-title', (element) => element.textContent);
      const price = await productItem.$eval('.regularPrice', (element) => element.textContent);
      const imgElement = await productItem.$('.linear-img');
      const imgSrc = await imgElement.evaluate(element => element.getAttribute('src'));
      const url = await page.evaluate(() => {
        const anchor = document.querySelector('a[target="_blank"]');
        return anchor ? anchor.getAttribute('href') : null;
      });
      const product = {
        title: title.trim(),
        price: price.trim(),
        img: imgSrc,
        url:'https://hamrobazaar.com'+url
      };

      // Push the product object into the products array
      products.push(product);
    }

    await browser.close();
    if (products.length === 0) {
      return [{ title: "No products found" }];
    }
    return products;
  } catch (error) {
    return { title: "cannot find product" };
  }
}
