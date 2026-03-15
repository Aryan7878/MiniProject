/**
 * analyticsService.js
 * ───────────────────────────────────────────────────────────────────────────
 * SmartBuy Intelligence Platform — Core Analytics Engine
 *
 * Pure mathematical utilities. No database calls, no side effects.
 * Every function accepts plain arrays and returns plain values so they
 * can be tested, composed, and reused anywhere in the codebase.
 * ───────────────────────────────────────────────────────────────────────────
 */

// ─── Internal helpers ─────────────────────────────────────────────────────────

/**
 * Validates that the input is a non-empty array of finite numbers.
 * Throws a descriptive TypeError so callers get actionable feedback.
 *
 * @param {number[]} prices
 * @param {string}   label   - context shown in the error message
 * @param {number}   [minLen=1]
 */
const assertPrices = (prices, label, minLen = 1) => {
    if (!Array.isArray(prices) || prices.length < minLen) {
        throw new TypeError(
            `${label}: expected an array with at least ${minLen} element(s), ` +
            `got ${Array.isArray(prices) ? prices.length : typeof prices}.`
        );
    }
    if (prices.some((p) => typeof p !== "number" || !isFinite(p))) {
        throw new TypeError(`${label}: all elements must be finite numbers.`);
    }
};

/**
 * Returns the arithmetic mean of an array of numbers.
 * @param {number[]} values
 * @returns {number}
 */
const mean = (values) => values.reduce((sum, v) => sum + v, 0) / values.length;

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * calculateMovingAverage
 * ─────────────────────────────────────────────────────────────────────────────
 * Computes a Simple Moving Average (SMA) over a sliding window.
 *
 * Formula:
 *   SMA[i] = ( prices[i] + prices[i-1] + … + prices[i-(w-1)] ) / w
 *
 * The result array is aligned to the END of the input — the first value
 * corresponds to index (windowSize - 1) in the original array, so its
 * length is always (prices.length - windowSize + 1).
 *
 * @param {number[]} prices     - chronological price list (oldest → newest)
 * @param {number}   windowSize - number of periods per window (integer ≥ 1)
 * @returns {number[]}          - SMA values rounded to 4 decimal places
 *
 * @example
 *   calculateMovingAverage([100, 102, 98, 105, 110], 3)
 *   // → [100.0000, 101.6667, 104.3333]
 */
export const calculateMovingAverage = (prices, windowSize) => {
    assertPrices(prices, "calculateMovingAverage", 1);

    const w = Math.floor(windowSize);
    if (!Number.isInteger(w) || w < 1) {
        throw new TypeError(`calculateMovingAverage: windowSize must be a positive integer, got ${windowSize}.`);
    }
    if (w > prices.length) {
        throw new RangeError(
            `calculateMovingAverage: windowSize (${w}) cannot exceed prices.length (${prices.length}).`
        );
    }

    const sma = [];
    for (let i = w - 1; i < prices.length; i++) {
        const window = prices.slice(i - w + 1, i + 1);
        sma.push(parseFloat(mean(window).toFixed(4)));
    }
    return sma;
};

/**
 * calculateVolatility
 * ─────────────────────────────────────────────────────────────────────────────
 * Measures price instability via the Population Standard Deviation of the
 * percentage changes between consecutive prices (i.e. daily/periodic returns).
 *
 * Steps:
 *   1. Compute period-over-period returns:  r[i] = (price[i] - price[i-1]) / price[i-1]
 *   2. Compute the mean return:             μ = mean(r)
 *   3. Compute population variance:         σ² = mean( (r[i] - μ)² )
 *   4. Volatility = √σ² expressed as a percentage (0-100 scale)
 *
 * Why population (÷N) not sample (÷N-1)?
 *   We are describing the actual observed price behaviour, not estimating
 *   population volatility from a sample, so population std-dev is correct.
 *
 * @param {number[]} prices - at least 2 prices in chronological order
 * @returns {number}        - volatility percentage, rounded to 4 decimal places
 *                           0 = perfectly stable, higher = more volatile
 *
 * @example
 *   calculateVolatility([100, 102, 98, 105, 110])
 *   // → 3.5777  (≈ 3.58% average swing between periods)
 */
export const calculateVolatility = (prices) => {
    assertPrices(prices, "calculateVolatility", 2);

    // Step 1: period-over-period returns (as decimals)
    const returns = [];
    for (let i = 1; i < prices.length; i++) {
        if (prices[i - 1] === 0) {
            throw new RangeError(`calculateVolatility: price at index ${i - 1} is zero — cannot divide.`);
        }
        returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
    }

    // Step 2: mean return
    const μ = mean(returns);

    // Step 3: population variance
    const variance = mean(returns.map((r) => (r - μ) ** 2));

    // Step 4: std-dev → percentage
    const volatility = Math.sqrt(variance) * 100;

    return parseFloat(volatility.toFixed(4));
};

/**
 * detectTrendSlope
 * ─────────────────────────────────────────────────────────────────────────────
 * Fits a Simple Linear Regression line through the price series and returns
 * the slope (β₁), which quantifies the direction and speed of the price trend.
 *
 * Model:  price ≈ β₀ + β₁ · t   where t = 0, 1, 2, …, n-1
 *
 * Ordinary Least Squares solution:
 *   β₁ = [ Σ (tᵢ - t̄)(pᵢ - p̄) ] / [ Σ (tᵢ - t̄)² ]
 *
 * Interpretation:
 *   β₁ > 0  → prices are trending UP   (positive slope)
 *   β₁ < 0  → prices are trending DOWN (negative slope)
 *   β₁ ≈ 0  → prices are flat / sideways
 *
 * @param {number[]} prices - at least 2 prices in chronological order
 * @returns {{ slope: number, intercept: number, rSquared: number }}
 *   - slope     : β₁, the per-period price change of the trend line
 *   - intercept : β₀, the fitted starting value
 *   - rSquared  : R², goodness-of-fit (0 = no fit, 1 = perfect fit)
 *
 * @example
 *   detectTrendSlope([100, 102, 104, 106, 108])
 *   // → { slope: 2.0000, intercept: 100.0000, rSquared: 1.0000 }
 *
 *   detectTrendSlope([100, 99, 102, 98, 103])
 *   // → { slope: 0.6000, intercept: 98.8000, rSquared: 0.1765 }
 */
export const detectTrendSlope = (prices) => {
    assertPrices(prices, "detectTrendSlope", 2);

    const n = prices.length;
    const t = Array.from({ length: n }, (_, i) => i); // time indices: 0, 1, 2 …

    const tMean = mean(t);
    const pMean = mean(prices);

    // Numerator:   Σ (tᵢ - t̄)(pᵢ - p̄)
    let numerator = 0;
    // Denominator: Σ (tᵢ - t̄)²
    let denominator = 0;

    for (let i = 0; i < n; i++) {
        const dt = t[i] - tMean;
        const dp = prices[i] - pMean;
        numerator += dt * dp;
        denominator += dt * dt;
    }

    if (denominator === 0) {
        // All time points are identical — degenerate case (single price)
        return { slope: 0, intercept: parseFloat(pMean.toFixed(4)), rSquared: 0 };
    }

    const slope = numerator / denominator;
    const intercept = pMean - slope * tMean;

    // R² = 1 - SS_res / SS_tot
    const ssTot = prices.reduce((sum, p) => sum + (p - pMean) ** 2, 0);
    const ssRes = prices.reduce((sum, p, i) => {
        const predicted = intercept + slope * i;
        return sum + (p - predicted) ** 2;
    }, 0);

    const rSquared = ssTot === 0 ? 1 : 1 - ssRes / ssTot;

    return {
        slope: parseFloat(slope.toFixed(4)),
        intercept: parseFloat(intercept.toFixed(4)),
        rSquared: parseFloat(Math.max(0, rSquared).toFixed(4)), // clamp to [0, 1]
    };
};

/**
 * calculateRealDiscount
 * ─────────────────────────────────────────────────────────────────────────────
 * Computes the ACTUAL discount of the current price against a historical
 * baseline — as opposed to the inflated "was ₹X, now ₹Y" retailer claim.
 *
 * Two baselines are computed and returned:
 *
 *   1. vs. Historical Mean
 *      realDiscount = ((mean - current) / mean) × 100
 *      A positive value means the current price is BELOW the average →
 *      a genuine saving. A negative value means it is ABOVE average.
 *
 *   2. vs. Historical High (all-time high in the dataset)
 *      maxDiscount = ((high - current) / high) × 100
 *      This mirrors the "was X% cheaper" retailer framing but uses the
 *      real observed high instead of an arbitrary reference price.
 *
 *   3. vs. Historical Low (all-time low in the dataset)
 *      premiumOverLow = ((current - low) / low) × 100
 *      Tells the buyer how much MORE they are paying vs the best price
 *      ever seen. 0 = current price IS the all-time low (great deal!).
 *
 * @param {number}   currentPrice      - the live / latest price
 * @param {number[]} historicalPrices  - at least 1 past price to compare against
 * @returns {{
 *   currentPrice: number,
 *   historicalMean: number,
 *   historicalHigh: number,
 *   historicalLow: number,
 *   discountVsMean: number,
 *   discountVsHigh: number,
 *   premiumOverLow: number,
 *   isBelowMean: boolean,
 *   isAllTimeLow: boolean,
 * }}
 *
 * @example
 *   calculateRealDiscount(850, [1000, 950, 900, 870, 860])
 *   // → {
 *   //     currentPrice:   850,
 *   //     historicalMean: 916.0000,
 *   //     historicalHigh: 1000,
 *   //     historicalLow:  860,
 *   //     discountVsMean: 7.2052,    ← 7.2% below average → genuine saving
 *   //     discountVsHigh: 15.0000,   ← 15% off the all-time high
 *   //     premiumOverLow: -1.1628,   ← actually BELOW the previous low!
 *   //     isBelowMean:    true,
 *   //     isAllTimeLow:   true,
 *   // }
 */
export const calculateRealDiscount = (currentPrice, historicalPrices) => {
    if (typeof currentPrice !== "number" || !isFinite(currentPrice) || currentPrice < 0) {
        throw new TypeError(`calculateRealDiscount: currentPrice must be a non-negative finite number.`);
    }
    assertPrices(historicalPrices, "calculateRealDiscount", 1);

    const historicalMean = parseFloat(mean(historicalPrices).toFixed(4));
    const historicalHigh = Math.max(...historicalPrices);
    const historicalLow = Math.min(...historicalPrices);

    // Safeguard: avoid division by zero if all historical prices are 0
    const safeDiv = (num, denom) =>
        denom === 0 ? 0 : parseFloat(((num / denom) * 100).toFixed(4));

    const discountVsMean = safeDiv(historicalMean - currentPrice, historicalMean);
    const discountVsHigh = safeDiv(historicalHigh - currentPrice, historicalHigh);
    const premiumOverLow = safeDiv(currentPrice - historicalLow, historicalLow);

    return {
        currentPrice,
        historicalMean,
        historicalHigh,
        historicalLow,
        discountVsMean,   // +ve = saving vs average,  -ve = paying above average
        discountVsHigh,   // +ve = saving vs all-time high
        premiumOverLow,   // +ve = paying above the lowest ever seen, 0 = all-time low
        isBelowMean: currentPrice < historicalMean,
        isAllTimeLow: currentPrice <= historicalLow,
    };
};
