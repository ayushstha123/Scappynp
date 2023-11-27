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

    // Adjust waiting conditions as needed to ensure all relevant elements are loaded
    await page.waitForSelector('li.item.product', { visible: true, timeout: 10000 });

    const products = await page.$$eval('li.item.product', (productElements) => {
      return productElements
        .slice(0, 5)
        .map((product) => {
          const urlElement = product.querySelector('.product-item-name a');
          const url = urlElement.getAttribute('href');
          const title = product.querySelector('.product-item-link').textContent;

          const actualPriceElement = product.querySelector('.old-price .price');
          const actualPrice = actualPriceElement ? actualPriceElement.textContent.trim() : '';

       
      
          const price = parseFloat(product.querySelector('.price-wrapper .price ').textContent.replace(/[^\d.]/g, '')) || 0;
          const imgElement = product.querySelector('.product-image-wrapper img');
          const imgSrc = imgElement.getAttribute('src');

          return {
            title,
            price,
            img: imgSrc,
            originalPrice:actualPrice,
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
