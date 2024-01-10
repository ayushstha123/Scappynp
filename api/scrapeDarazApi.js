import puppeteer from 'puppeteer';

export async function scrapeDarazProduct(productName) {
  try {
    const browser = await puppeteer.launch({ headless: false, args: ['--no-sandbox', '--disable-setuid-sandbox', '--start-maximized'] });
    const page = await browser.newPage();
    await page.setViewport({ width: 2020, height: 3080 });

    const encodedProductName = encodeURIComponent(productName);
    const url = `https://www.daraz.com.np/catalog/?q=${encodedProductName}`;

    await page.goto(url);

    const products = await page.$$eval('[data-qa-locator="product-item"]', (productItems) => {
      return productItems.slice(0, 10).map((productItem) => {
        const title = productItem.querySelector('.title-wrapper--IaQ0m').textContent.trim();
        const price = (productItem.querySelector('.current-price--Jklkc .currency--GVKjl') || {}).textContent || 'Price not found';
        const discount = (productItem.querySelector('.original-price--lHYOH .currency--GVKjl') || {}).textContent || 'No discount';
        const originalPrice = (productItem.querySelector('.original-price--lHYOH del.currency--GVKjl') || {}).textContent.trim() || '';
        const imgSrc = (productItem.querySelector('.image--Smuib') || {}).getAttribute('src') || 'Image not found';
        const url = productItem.querySelector('a.product-card--vHfY9').getAttribute('href') || 'URL not found';

        return { title, price, discount, originalPrice, img: imgSrc, url };
      });
    });

    const relevantProducts = products.filter((product) => {
      const titleLowerCase = product.title.toLowerCase();
      return titleLowerCase.includes(productName.toLowerCase()) && /[a-zA-Z].*[a-zA-Z]/.test(product.title);
    });

    relevantProducts.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));

    await browser.close();

    return relevantProducts.length === 0
      ? { message: 'No relevant products found' }
      : relevantProducts;
  } catch (error) {
    return { message: `An error occurred while scraping the product data: ${error.message}` };
  }
}

