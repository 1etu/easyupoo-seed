const fs = require('fs').promises;
const { CACHE_CONFIG } = require('../config/config');
const logger = require('../utils/logger');
const ProductModel = require('../models/ProductModel');

class Cache {
  constructor() {
    this.data = {};
    this.filename = CACHE_CONFIG.filename;
  }

  async load() {
    try {
      const existingCache = await fs.readFile(this.filename, 'utf8');
      const rawData = JSON.parse(existingCache);
      
      this.data = Object.entries(rawData).reduce((acc, [key, value]) => {
        try {
          new ProductModel(value.data);
          acc[key] = value;
        } catch (error) {
          logger.warn(`Invalid cache entry for ${key}:`, error);
        }
        return acc;
      }, {});

      logger.info(`Loaded existing cache with ${Object.keys(this.data).length} items`);
    } catch (error) {
      logger.warn('No existing cache found, starting fresh');
    }
  }

  async save() {
    await fs.writeFile(this.filename, JSON.stringify(this.data, null, 2));
  }

  isValid(key) {
    return this.data[key] && 
           this.data[key].timestamp && 
           Date.now() - this.data[key].timestamp < CACHE_CONFIG.maxAge;
  }

  set(key, value) {
    if (!(value instanceof ProductModel)) {
      throw new Error('Cache value must be a ProductModel instance');
    }

    this.data[key] = {
      timestamp: Date.now(),
      data: value.toJSON()
    };
  }

  get(key) {
    const entry = this.data[key]?.data;
    return entry ? new ProductModel(entry) : null;
  }

  size() {
    return Object.keys(this.data).length;
  }
}

module.exports = Cache; 