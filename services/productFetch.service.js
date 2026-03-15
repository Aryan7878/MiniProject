/**
 * productFetch.service.js
 * 
 * Simulates an external API integration for product searches.
 * Fetches and normalizes data to conform to our SmartCart schema.
 */

export const searchExternalProducts = async (query) => {
    console.log(`[ExtAPI] Intercepting request, fetching external data for: "${query}"`);
    
    // Simulate real-world external API latency
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Create realistic mock price variance
    const basePrice = Math.floor(Math.random() * 40000) + 15000;
    
    // Return normalized structure enforcing required Schema fields
    return [
        {
            name: `${query.charAt(0).toUpperCase() + query.slice(1)} - Global Edition`,
            brand: "GlobalTech",
            category: "Electronics",
            price: basePrice, // required by schema alongside marketplaces
            image: `https://via.placeholder.com/600x400.png?text=${encodeURIComponent(query)}`,
            marketplaces: [
                {
                    name: "Amazon",
                    price: basePrice,
                    url: `https://www.amazon.in/s?k=${encodeURIComponent(query)}`
                },
                {
                    name: "Flipkart",
                    price: basePrice - 499,
                    url: `https://www.flipkart.com/search?q=${encodeURIComponent(query)}`
                },
                {
                    name: "Croma",
                    price: basePrice + 999,
                    url: `https://www.croma.com/searchB?q=${encodeURIComponent(query)}`
                }
            ]
        }
    ];
};
