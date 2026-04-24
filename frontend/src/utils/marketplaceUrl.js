const toQuery = (value = "") => encodeURIComponent(value.trim());

export const getMarketplaceSearchUrl = (marketplaceName = "", productName = "") => {
    const market = marketplaceName.toLowerCase();
    const query = toQuery(productName);

    if (market.includes("amazon")) return `https://www.amazon.in/s?k=${query}`;
    if (market.includes("flipkart")) return `https://www.flipkart.com/search?q=${query}`;
    if (market.includes("croma")) return `https://www.croma.com/searchB?q=${query}`;
    if (market.includes("reliance")) return `https://www.reliancedigital.in/search?q=${query}`;
    if (market.includes("samsung")) return `https://www.samsung.com/in/search/?searchvalue=${query}`;
    if (market.includes("apple")) return `https://www.apple.com/in/search/${query}`;
    if (market.includes("oneplus")) return `https://www.oneplus.in/search?keyword=${query}`;
    if (market.includes("lenovo")) return `https://www.lenovo.com/in/en/search?text=${query}`;
    if (market.includes("dell")) return `https://www.dell.com/en-in/search/${query}`;
    if (market.includes("hp")) return `https://www.hp.com/in-en/search?q=${query}`;

    return `https://www.google.com/search?q=${toQuery(`${marketplaceName} ${productName}`)}`;
};
