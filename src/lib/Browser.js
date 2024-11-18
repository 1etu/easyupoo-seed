const puppeteer = require('puppeteer');
const { BROWSER_CONFIG } = require('../config/config');

class Browser {
  constructor() {
    this.browser = null;
  }

  async initialize() {
    this.browser = await puppeteer.launch(BROWSER_CONFIG);
  }

  async createPage() {
    if (!this.browser) {
      throw new Error('Browser not initialized');
    }

    const page = await this.browser.newPage();
    await page.setRequestInterception(true);
    
    page.on('request', request => {
      const resourceType = request.resourceType();
      if (['image', 'media'].includes(resourceType)) {
        request.abort();
      } else {
        request.continue();
      }
    });

    return page;
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

module.exports = Browser; 