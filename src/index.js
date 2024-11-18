const readline = require('readline');
const YupooScraper = require('./services/YupooScraper');
const logger = require('./utils/logger');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function main() {
  const scraper = new YupooScraper();
  
  try {
    await scraper.initialize();
    
    const sellerUrl = await new Promise(resolve => {
      rl.question('[*] Enter seller Yupoo URL (e.g. seller.x.yupoo.com): ', resolve);
    });

    logger.info(`Starting cache seeding for ${sellerUrl}...`);
    
    const albums = await scraper.scrapeAlbums(sellerUrl);
    
    if (!albums || albums.length === 0) {
      throw new Error('No albums found on the page');
    }

    logger.info(`Found ${albums.length} albums to process`);
    
    await scraper.processAlbums(albums);
    
    const stats = scraper.getStats();
    logger.info(`Processed: ${stats.processed} albums`);
    logger.info(`Cached: ${stats.cached} new products`);
    logger.info(`Skipped: ${stats.skipped} cached products`);
    logger.info(`Total cache size: ${stats.totalCacheSize} items`);

  } catch (error) {
    logger.error('Error during cache seeding:', error);
  } finally {
    await scraper.close();
    rl.close();
  }
}

main(); 