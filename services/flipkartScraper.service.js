export const scrapeFlipkart = async (query) => {
    console.log(`[Scraper] Fetching Flipkart mock data for: "${query}"...`);
    
    // Simulate real-world external API latency
    await new Promise(resolve => setTimeout(resolve, 800));

    const basePrice = Math.floor(Math.random() * 40000) + 15000;
    
    return [
        {
            name: `${query.charAt(0).toUpperCase() + query.slice(1)} - Global Edition`,
            price: basePrice - 499,
            url: `https://www.flipkart.com/search?q=${encodeURIComponent(query)}`,
            image: `https://via.placeholder.com/600x400.png?text=${encodeURIComponent(query)}`,
            marketplace: "Flipkart"
        }
    ];
};
