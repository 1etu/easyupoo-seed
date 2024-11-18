## Purpose
This tool works in conjunction with the easYupoo Chrome extension. It pre-caches product prices from Yupoo seller albums by scraping their entire catalog. The cached data can then be used by the easYupoo extension to display real-time prices instantly without having to fetch them on-demand.

## Installation
1. Make sure you have Node.js and npm installed on your system
2. Clone this repository to your local machine
3. Make the start script executable:
   ```bash
   chmod +x start.sh
   ```

## Installation
1. Make sure you have Node.js and npm installed on your system
2. Clone this repository to your local machine
3. Make the start script executable:
   ```
   chmod +x start.sh
   ```

## Getting Started
1. Run the start script:
   ```
   ./start.sh
   ```
   This will automatically:
   - Install all required dependencies
   - Check for proper Node.js and npm installation
   - Start the cache seeding process

2. When prompted, enter the Yupoo seller URL (e.g., seller.x.yupoo.com)

3. The script will then:
   - Scan all albums from the seller
   - Extract product links (Taobao/Weidian)
   - Fetch and cache current prices
   - Save everything to cache.json

The cached data will NOT be automatically used by your easYupoo extension. You should go to the "Cache" tab on the Settings page and import it manualy.
