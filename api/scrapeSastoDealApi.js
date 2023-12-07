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
    const searchUrl = `https://www.sastodeal.com/default/catalogsearch/result/index/?product_list_order=ratings_summary&q="${formattedProductName}"`;

    await page.goto(searchUrl);
    const selector = '.product-item-name a'; // Replace this with the actual selector you want to wait for

    try {
      // Wait for the main content to be present
      await page.waitForSelector(selector, { visible: true, timeout: 2000 });

      const products = await page.$$eval('li.item.product', (productElements) => {
        return productElements
          .slice(0, 10)
          .map((product) => {
            const urlElement = product.querySelector('.product-item-name a');
            const url = urlElement ? urlElement.getAttribute('href') : '';

            const titleElement = product.querySelector('.product-item-link');
            const title = titleElement ? titleElement.textContent.trim() : '';

            const actualPriceElement = product.querySelector('.old-price .price');
            const actualPrice = actualPriceElement ? actualPriceElement.textContent.trim() : '';

            const priceElement = product.querySelector('.price-wrapper .price');
            const price = priceElement ? priceElement.textContent.replace(/[^0-9]/g, '') : 'Price not found';

            const imgElement = product.querySelector('.product-image-wrapper img');
            const imgSrc = imgElement ? imgElement.getAttribute('src') : '';

            return {
              title,
              price,
              img: imgSrc,
              originalPrice: actualPrice,
              url,
            };
          });
      });

      // Filter out irrelevant products based on an exact match
      const relevantProducts = products.filter((product) =>
        product.title.toLowerCase().includes(productName.toLowerCase())
      );
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
        return JSON.stringify({ message : 'No relevant products found' });
      }

      return relevantProducts;
    } catch (error) {
      // Handle timeout or other errors
      await browser.close();
      return JSON.stringify({ message: `An error occurred while scraping the product data: ${error.message}` });
    }
  } catch (error) {
    return JSON.stringify({ message: 'An error occurred while scraping the product data.' });
  }
}
