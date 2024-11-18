const Browser = require('../lib/Browser');
const Cache = require('../lib/Cache');
const ProductExtractor = require('./ProductScraper');
const { SCRAPER_CONFIG } = require('../config/config');
const logger = require('../utils/logger');

class YupooScraper {
  constructor() {
    this.browser = new Browser();
    this.cache = new Cache();
    this.stats = {
      processed: 0,
      cached: 0,
      skipped: 0
    };
  }

  async initialize() {
    await this.browser.initialize();
    await this.cache.load();
  }

  async scrapeAlbums(sellerUrl) {
    const page = await this.browser.createPage();
    await page.setDefaultNavigationTimeout(SCRAPER_CONFIG.navigationTimeout);
    
    const response = await page.goto(`https://${sellerUrl}`, { 
      waitUntil: 'domcontentloaded'
    });

    if (!response.ok()) {
      throw new Error(`Failed to load page: ${response.status()} ${response.statusText()}`);
    }

    const albums = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('a'))
        .map(a => a.href)
        .filter(href => href.includes('/albums/'));
    });

    await page.close();
    return albums;
  }

  async processAlbums(albums) {
    const pages = await Promise.all(
      Array(SCRAPER_CONFIG.chunkSize).fill().map(() => this.browser.createPage())
    );

    for (let i = 0; i < albums.length; i += SCRAPER_CONFIG.chunkSize) {
      const chunk = albums.slice(i, i + SCRAPER_CONFIG.chunkSize);
      await this.processChunk(chunk, pages);
      await this.cache.save();
    }

    await Promise.all(pages.map(page => page.close()));
  }

  async processChunk(chunk, pages) {
    const promises = chunk.map(async (albumUrl, index) => {
      try {
        this.stats.processed++;
        logger.info(`Processing album ${this.stats.processed}: ${albumUrl}`);
        
        if (this.cache.isValid(albumUrl)) {
          logger.info('Using cached data');
          this.stats.skipped++;
          return;
        }

        const productDetails = await ProductExtractor.fetchProductDetails(pages[index], albumUrl);
        
        if (productDetails) {
          this.cache.set(albumUrl, productDetails);
          logger.info(`Cached product:`, productDetails);
          this.stats.cached++;
        }
      } catch (error) {
        logger.error(`Error processing album ${albumUrl}:`, error);
      }
    });

    await Promise.all(promises);
  }

  async close() {
    await this.browser.close();
  }

  getStats() {
    return {
      ...this.stats,
      totalCacheSize: this.cache.size()
    };
  }
}

module.exports = YupooScraper; 