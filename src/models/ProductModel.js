const BaseModel = require('./BaseModel');
const { PLATFORM_CONFIG } = require('../config/config');

class ProductModel extends BaseModel {
  static get schema() {
    return {
      platform: {
        type: 'string',
        required: true,
        validate: (value) => {
          return Object.keys(PLATFORM_CONFIG.platforms).includes(value) || 
            'Invalid platform. Must be either taobao or weidian';
        }
      },
      link: {
        type: 'string',
        required: true,
        validate: (value) => {
          try {
            new URL(`https://${value}`);
            return true;
          } catch {
            return 'Invalid URL format';
          }
        }
      },
      price: {
        type: 'string',
      },
      timestamp: {
        type: 'number',
        required: true,
        validate: (value) => {
          return value > 0 || 'Invalid timestamp';
        }
      }
    };
  }

  static createFromDetails(details) {
    return new ProductModel({
      ...details,
      timestamp: Date.now()
    });
  }
}

module.exports = ProductModel; 