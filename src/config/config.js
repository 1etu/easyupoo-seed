module.exports = {
  PLATFORM_CONFIG: {
    preferredPlatform: 'weidian',
    platforms: {
      taobao: {
        baseUrl: 'https://www.jadeship.com/item/taobao/',
        priority: 1
      },
      weidian: {
        baseUrl: 'https://www.jadeship.com/item/weidian/',
        priority: 2
      }
    }
  },

  CACHE_CONFIG: {
    version: '1.0.0',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    maxItems: 1000,
    filename: 'cache.json'
  },

  BROWSER_CONFIG: {
    headless: "new",
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--window-size=1920x1080'
    ]
  },

  SCRAPER_CONFIG: {
    chunkSize: 3,
    retries: 3,
    timeout: 10000,
    navigationTimeout: 15000
  }
}; 