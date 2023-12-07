import puppeteer from 'puppeteer';

export async function scrapeGyapuProduct(productName) {
  try {
    const browser = await puppeteer.launch({
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    // Modify the search query for an exact match
    await page.goto(`https://gyapu.com/search/${productName}`);

    await page.waitForSelector('.SrchRightTop');

    const areElementsPresent = await page.waitForSelector('.product-image', { visible: true, timeout: 4000 }).then(() => true).catch(() => false);
 if (!areElementsPresent) {
   await browser.close();
   return JSON.stringify({ message: 'An error occurred while scraping the product data.' });
 }
    

    const products = await page.evaluate(() => {
      const productItems = Array.from(document.querySelectorAll('.SrchRightTop .fscont')).slice(0, 5);
      return productItems.map((productItem) => {
        const titleElement = productItem.querySelector('.fsdet_title');
        const priceElement = productItem.querySelector('.price.text__price');
        const discountElement = productItem.querySelector('.discount-badge-wrapper .bg-green-500');
        const imgElement = productItem.querySelector('img');

        const actualPriceElement = productItem.querySelector('div[class*="price"][class*="text-center"]');
        const actualPrice = actualPriceElement ? actualPriceElement.textContent.trim() : '';

        const imgSrc = imgElement ? imgElement.getAttribute('src') : 'Image not found';
        const anchor = productItem.querySelector('a[target="_blank"]');
        const url = anchor ? anchor.getAttribute('href') : 'URL not found';

        // Check if elements exist before accessing 'textContent'
        const title = titleElement ? titleElement.textContent : 'Title not found';
        const price = priceElement ? priceElement.textContent : 'Price not found';
        const discount = discountElement ? discountElement.textContent : 'No discount';

        return {
          title: title,
          price: price,
          discount: discount,
          originalPrice: actualPrice,
          img: imgSrc,
          url: 'https://gyapu.com' + url,
        };
      });
    });

    // Filter out irrelevant products based on an exact match
    const relevantProducts = products.filter((product) =>
      product.title.toLowerCase().includes(productName.toLowerCase())
    );

    await browser.close();


    await browser.close();
    if (relevantProducts.length === 0) {
      return JSON.stringify({ message : 'No relevant products found' });
    }
    return products;
  } catch (error) {
    return JSON.stringify({ message: 'An error occurred while scraping the product data.' });
  }
}