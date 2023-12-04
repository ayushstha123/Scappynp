import puppeteer from 'puppeteer';

export async function scrapeSastoDealProduct(productName) {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    // Modify the search term
    const formattedProductName = productName.replace(/\W+/g, '-').toLowerCase();
    const searchUrl = `https://www.sastodeal.com/default/catalogsearch/result/index/?product_list_order=ratings_summary&q=${formattedProductName}`;

    await page.goto(searchUrl);
    const selector = '.product-item-name a'; // Replace this with the actual selector you want to wait for
    const areElementsPresent = await page.waitForSelector(selector, { visible: true, timeout: 2000 }).then(() => true).catch(() => false);

    if (!areElementsPresent) {
      await browser.close();
      return JSON.stringify({ message: 'An error occurred while scraping the product data.' });;
    }

    const products = await page.$$eval('li.item.product', (productElements) => {
      return productElements
        .slice(0, 5)
        .map((product) => {
          const urlElement = product.querySelector('.product-item-name a');
          const url = urlElement.getAttribute('href');
          const title = product.querySelector('.product-item-link').textContent;

          const actualPriceElement = product.querySelector('.old-price .price');
          const actualPrice = actualPriceElement ? actualPriceElement.textContent.trim() : '';

          const price = parseFloat(product.querySelector('.price-wrapper .price').textContent.replace(/[^\d.]/g, '')) || 0;
          const imgElement = product.querySelector('.product-image-wrapper img');
          const imgSrc = imgElement.getAttribute('src');

          return {
            title,
            price,
            img: imgSrc,
            originalPrice: actualPrice,
            url,
          };
        })
        .sort((a, b) => a.price - b.price); // Sort products based on price (ascending order)
    });

    await browser.close();
    if (products.length === 0) {
      return [{ title: 'No products found' }];
    }
    return products;
  } catch (error) {
    return JSON.stringify({ message: 'An error occurred while scraping the product data.' });
  }
}
