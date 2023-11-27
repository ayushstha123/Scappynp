import express from 'express';
import puppeteer from 'puppeteer';
import cors from 'cors';
import { scrapeDarazProduct } from './api/scrapeDarazApi.js';
import { scrapeHamroBazarProduct } from './api/scrapeHamroBazarApi.js';
import { scrapeSastoDealProduct } from './api/scrapeSastoDealApi.js';
import { scrapeGyapuProduct } from './api/scrapeGyapuApi.js';


const app = express();
app.use(cors());

// Define a route to scrape product data from both Daraz and OkDam
app.get('/api/:product_name', async (req, res) => {
  try {
    const { product_name } = req.params;

    if (!product_name) {
      return res.status(400).json({ error: 'Product name is missing' });
    }

    // Use Promise.all to await both scraping functions concurrently
    const [hamrobazarData, darazData,gyapuData, SastoDealData] = await Promise.all([
      scrapeHamroBazarProduct(product_name),
      scrapeDarazProduct(product_name),
      scrapeGyapuProduct(product_name),
      scrapeSastoDealProduct(product_name)
    ]);

    // Create an object to encapsulate both results
    const productData = {
      hamrobazar: hamrobazarData,
      daraz: darazData,
      gyapu: gyapuData,
      SastoDeal: SastoDealData
    };

    res.status(200).json(productData);
  } catch (error) {
    res.status(500).json({ error: `Failed to scrape product data: ${error.message}` });
  }
});
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
