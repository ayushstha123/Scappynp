import puppeteer from "puppeteer";

export async function scrapeDarazProduct(productName) {
  try {
       const browser = await puppeteer.launch({
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.goto(`https://www.daraz.com.np/catalog/?q=${productName}`);

    await page.waitForSelector('.gridItem--Yd0sa', { visible: true });
    const products = await page.$$eval('.gridItem--Yd0sa', (productItems) => {
      return productItems.slice(0, 5).map((productItem) => {
        const title = productItem.querySelector('.title--wFj93 a').textContent;
        const price = productItem.querySelector('.price--NVB62').textContent;
        const discountElement = productItem.querySelector('.discount--HADrg');
        const discount = discountElement ? discountElement.textContent : 'No discount';
        

        const originalPriceElement = productItem.querySelector('.origPrice--AJxRs');
        const actualPrice = originalPriceElement ? originalPriceElement.textContent.trim() : '';

        
        const imgElement = productItem.querySelector('.image--WOyuZ');
        const imgSrc = imgElement ? imgElement.getAttribute('src') : 'Image not found';

        const urlElement = productItem.querySelector('.title--wFj93 a');
        const url = urlElement ? urlElement.getAttribute('href') : 'URL not found';

        return {
          title: title,
          price: price,
          discount: discount,
          originalPrice:actualPrice,
          img: imgSrc,
          url: url,
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
