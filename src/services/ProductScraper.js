const { PLATFORM_CONFIG } = require('../config/config');
const logger = require('../utils/logger');
const ProductModel = require('../models/ProductModel');

class ProductExtractor {
  static extractWeidianId(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.searchParams.get('itemID') || null;
    } catch (error) {
      logger.error('Error extracting Weidian ID:', error);
      return null;
    }
  }

  static extractTaobaoId(url) {
    try {
      if (url.includes('?')) {
        const urlObj = new URL(url);
        const idParam = urlObj.searchParams.get('id');
        if (idParam) return idParam;
      }
      
      const pathParts = url.split('/');
      return pathParts[pathParts.length - 1];
    } catch (error) {
      logger.error('Error extracting Taobao ID:', error);
      return null;
    }
  }

  static async fetchPrice(page, url, retries = 3) {
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        logger.info(`Fetching price from: ${url}`);
        const response = await page.goto(url, { 
          waitUntil: 'domcontentloaded',
          timeout: 10000 
        });
        
        if (!response.ok()) {
          logger.warn(`Price page returned status: ${response.status()}`);
        }

        const priceElement = await page.$('.rounded-sm.bg-muted.p-1.text-right.text-3xl span');
        if (!priceElement) {
          logger.warn('Price element not found on page');
          return 'N/A';
        }

        const price = await page.$eval(
          '.rounded-sm.bg-muted.p-1.text-right.text-3xl span', 
          el => el.textContent
        ).catch(() => 'N/A');
        
        logger.info(`Extracted price: ${price}`);
        return price;
      } catch (error) {
        if (attempt === retries - 1) {
          logger.error('Price fetch error:', error);
          return 'N/A';
        }
        logger.warn(`Retry ${attempt + 1} for price fetch`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }

  static async fetchProductDetails(page, url, retries = 3) {
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        await page.goto(url, { 
          waitUntil: 'domcontentloaded',
          timeout: 10000 
        });
        
        const details = await page.evaluate(() => {
          const subtitleDiv = document.querySelector('.showalbumheader__gallerysubtitle.htmlwrap__main');
          const content = subtitleDiv?.textContent || '';
          
          const taobaoMatch = content.match(/item\.taobao\.com[^\s"]*/);
          const weidianMatch = content.match(/(?:shop\d+\.v\.weidian\.com|weidian\.com)\/item\.html\?[^\s"]*/);
          
          return {
            taobaoLink: taobaoMatch ? taobaoMatch[0] : null,
            weidianLink: weidianMatch ? weidianMatch[0] : null
          };
        });

        if (!details.taobaoLink && !details.weidianLink) {
          return null;
        }

        const platform = details.weidianLink ? 'weidian' : 'taobao';
        const link = details.weidianLink || details.taobaoLink;
        
        const productId = platform === 'weidian' 
          ? this.extractWeidianId(`https://${link}`)
          : this.extractTaobaoId(`https://${link}`);

        if (!productId) {
          logger.error('Failed to extract product ID from:', link);
          return null;
        }

        const price = await this.fetchPrice(
          page,
          `${PLATFORM_CONFIG.platforms[platform].baseUrl}${productId}`
        );

        try {
          return ProductModel.createFromDetails({ platform, link, price });
        } catch (error) {
          logger.error('Product validation failed:', error);
          return null;
        }

      } catch (error) {
        if (attempt === retries - 1) {
          logger.error('Error fetching product details:', error);
          return null;
        }
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }

  static async extractPrice(page) {
    try {
      const priceElement = await page.$('.album__content .text-price');
      if (!priceElement) {
        console.log('Price element not found, trying alternative selector...');
        const altPriceElement = await page.$('[data-price]');
        if (!altPriceElement) {
          console.log('No price element found with any selector');
          return 'N/A';
        }
        const price = await page.evaluate(el => el.getAttribute('data-price'), altPriceElement);
        return price.trim();
      }
      
      const price = await page.evaluate(el => el.textContent, priceElement);
      const cleanPrice = price.trim().replace(/[^\d.]/g, '');
      
      return cleanPrice || 'N/A';
    } catch (error) {
      console.error('Error extracting price:', error);
      return 'N/A';
    }
  }
}

module.exports = ProductExtractor; 