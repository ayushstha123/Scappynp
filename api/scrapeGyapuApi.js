import puppeteer from 'puppeteer';

export async function scrapeGyapuProduct(productName) {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.goto(`https://gyapu.com/search/${productName}`);

    await page.waitForSelector('.product-image');

    const products = await page.evaluate(() => {
      const productItems = Array.from(document.querySelectorAll('.SrchRightTop .fscont')).slice(0,5);
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
          originalPrice:actualPrice,
          img: imgSrc,
          url:'https://gyapu.com'+ url,
        };
      });
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