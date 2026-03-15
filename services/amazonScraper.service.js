import puppeteer from 'puppeteer';

/**
 * Scrapes product listings from Amazon search results using Puppeteer.
 * 
 * @param {string} query - The search term (e.g., "iPhone 15")
 * @returns {Promise<Array>} - Ground truth list of top 10 products
 */
export const scrapeAmazonProducts = async (query) => {
    const browser = await puppeteer.launch({
        headless: "new", // Run in modern headless mode
        args: [
            '--no-sandbox', 
            '--disable-setuid-sandbox',
            '--disable-blink-features=AutomationControlled' // Helps bypass anti-bot detections
        ]
    });
    
    try {
        const page = await browser.newPage();
        
        // Amazon aggressively blocks Puppeteer default User Agents. Impersonate standard Chrome.
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        
        // Go to Amazon India search page
        const searchUrl = `https://www.amazon.in/s?k=${encodeURIComponent(query)}`;
        console.log(`[Scraper] Fetching Amazon data for: "${query}"...`);
        
        // waitUntil domcontentloaded is faster than parsing all external network idle assets
        await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 0 });

        // Execute extraction script securely isolated within the headless browser context
        const products = await page.evaluate(() => {
            const results = [];
            
            // Standard bounding box query selector for Amazon search result items
            const itemNodes = document.querySelectorAll('div[data-component-type="s-search-result"]');
            
            for (const node of itemNodes) {
                // Hard limit enforcement: only pull the top 10 results
                if (results.length >= 10) break;
                
                const titleNode = node.querySelector('h2 a span');
                const priceNode = node.querySelector('.a-price-whole');
                const linkNode = node.querySelector('h2 a');
                const imgNode = node.querySelector('img.s-image');

                // Filter out sponsored/broken nodes lacking core critical fields
                if (titleNode && priceNode && linkNode && imgNode) {
                    
                    // Sanitize price strings formats (e.g., "72,499" to integer 72499)
                    const priceText = priceNode.innerText.replace(/,/g, '');
                    const price = parseInt(priceText, 10);
                    
                    // Ensure the href is a fully qualified absolute URL path
                    let url = linkNode.getAttribute('href');
                    if (url && !url.startsWith('http')) {
                        url = 'https://www.amazon.in' + url;
                    }

                    results.push({
                        name: titleNode.innerText.trim(),
                        brand: "Unknown",
                        category: "Electronics",
                        image: imgNode.getAttribute('src'),
                        price: isNaN(price) ? 0 : price,
                        marketplaces: [
                            {
                                name: "Amazon",
                                price: isNaN(price) ? 0 : price,
                                url: url
                            }
                        ]
                    });
                }
            }
            
            return results;
        });

        console.log(`[Scraper] Successfully extracted ${products.length} products!`);
        return products;

    } catch (error) {
        console.error("[Scraper] Amazon DOM traversal failed:", error);
        return [];
    } finally {
        // ALWAYS terminate the chromium process to prevent zombie memory leaks
        await browser.close();
    }
};
