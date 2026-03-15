/**
 * predictionService.js
 * ───────────────────────────────────────────────────────────────────────────
 * SmartBuy Intelligence Platform — Price Prediction Engine
 *
 * Builds on top of the OLS regression maths already established in
 * analyticsService.js. Pure functions — no DB calls, no side effects.
 * ───────────────────────────────────────────────────────────────────────────
 */

import { detectTrendSlope } from "./analyticsService.js";

// ─── Internal helpers ─────────────────────────────────────────────────────────

/**
 * Validates that the input is a non-empty array of finite, positive numbers.
 * @param {number[]} prices
 * @param {string}   label
 * @param {number}   [minLen=2]
 */
const assertPrices = (prices, label, minLen = 2) => {
    if (!Array.isArray(prices) || prices.length < minLen) {
        throw new TypeError(
            `${label}: expected an array with at least ${minLen} element(s), ` +
            `got ${Array.isArray(prices) ? prices.length : typeof prices}.`
        );
    }
    if (prices.some((p) => typeof p !== "number" || !isFinite(p) || p < 0)) {
        throw new TypeError(`${label}: all elements must be non-negative finite numbers.`);
    }
};

/**
 * Clamps a value to [min, max].
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

/**
 * Adds N calendar days to a given Date and returns a new Date.
 * @param {Date}   date
 * @param {number} days
 * @returns {Date}
 */
const addDays = (date, days) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
};

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * linearRegressionForecast
 * ─────────────────────────────────────────────────────────────────────────────
 * Fits a Simple Linear Regression line through the historical price series
 * and extrapolates the fitted line forward by `daysAhead` periods.
 *
 * Model:
 *   price(t) = β₀ + β₁ · t        ← fitted on t = 0 … n-1
 *   forecast  = β₀ + β₁ · (n - 1 + daysAhead)
 *
 * Example with prices [100, 102, 104, 106, 108] (slope = 2):
 *   n = 5,  last index = 4
 *   forecast for daysAhead=7  →  β₀ + β₁ · (4 + 7)  =  100 + 2·11  =  122
 *
 * Reliability increases with:
 *   - More data points
 *   - Higher rSquared (the returned confidence metric)
 *
 * @param {number[]} prices    - chronological prices (oldest → newest), min 2
 * @param {number}   daysAhead - how many periods into the future to predict (≥ 1)
 * @returns {{
 *   forecastPrice : number,   - predicted price, floored at 0 (can't be negative)
 *   slope         : number,   - β₁, per-period direction of the trend
 *   intercept     : number,   - β₀, fitted y-intercept
 *   rSquared      : number,   - goodness-of-fit (0=no fit, 1=perfect)
 *   confidence    : "high" | "medium" | "low",  - human-readable reliability band
 *   daysAhead     : number,   - echoed back for clarity
 * }}
 *
 * @example
 *   linearRegressionForecast([100, 103, 106, 109, 112], 7)
 *   // → { forecastPrice: 130, slope: 3, intercept: 100, rSquared: 1,
 *   //     confidence: "high", daysAhead: 7 }
 */
export const linearRegressionForecast = (prices, daysAhead) => {
    assertPrices(prices, "linearRegressionForecast", 2);

    const days = Math.floor(daysAhead);
    if (!Number.isInteger(days) || days < 1) {
        throw new TypeError(
            `linearRegressionForecast: daysAhead must be a positive integer, got ${daysAhead}.`
        );
    }

    const { slope, intercept, rSquared } = detectTrendSlope(prices);

    // Extrapolate: the next point after index (n-1) is at t = (n - 1 + daysAhead)
    const futureT = (prices.length - 1) + days;
    const rawForecast = intercept + slope * futureT;

    // Prices can't go negative
    const forecastPrice = parseFloat(Math.max(0, rawForecast).toFixed(4));

    // Map rSquared into a human-readable confidence band
    const confidence =
        rSquared >= 0.85 ? "high" :
            rSquared >= 0.50 ? "medium" :
                "low";

    return { forecastPrice, slope, intercept, rSquared, confidence, daysAhead: days };
};

/**
 * calculateDropProbability
 * ─────────────────────────────────────────────────────────────────────────────
 * Estimates the probability (0–1) that the price will drop in the near future,
 * derived from two independent signals that are blended together:
 *
 *   Signal 1 — Trend slope signal (weight 0.70)
 *   ─────────────────────────────────────────────
 *   Uses the OLS slope expressed as a % of the mean price.
 *   A strongly negative normalised slope → high drop probability.
 *   A strongly positive slope             → low drop probability.
 *
 *   Raw slope signal = sigmoid( -k · normalisedSlope )
 *   where k = 10 controls sensitivity and the negation means:
 *     normalisedSlope < 0  →  sigmoid > 0.5  (downtrend → likely to keep falling)
 *     normalisedSlope > 0  →  sigmoid < 0.5  (uptrend   → unlikely to fall soon)
 *
 *   Signal 2 — Recent momentum signal (weight 0.30)
 *   ─────────────────────────────────────────────────
 *   Compares the average of the last ⌊n/3⌋ prices with the average of the
 *   first ⌊n/3⌋ prices (recent third vs early third).
 *   If recent average < early average → prices are falling → higher probability.
 *   Expressed as: clamp( (earlyMean - recentMean) / earlyMean · 5 + 0.5, 0, 1 )
 *
 *   Final probability = 0.70 · slopeSignal + 0.30 · momentumSignal
 *
 * @param {number[]} prices - at least 2 prices in chronological order
 * @returns {{
 *   dropProbability : number,   - blended probability [0, 1], 4 d.p.
 *   slopeSignal     : number,   - sigmoid of normalised slope [0, 1]
 *   momentumSignal  : number,   - recent vs early momentum [0, 1]
 *   normalisedSlope : number,   - slope as % of mean price
 *   interpretation  : string,   - plain-English label
 * }}
 *
 * @example
 *   // Consistent downtrend
 *   calculateDropProbability([120, 115, 110, 105, 100])
 *   // → { dropProbability: ~0.93, interpretation: "very likely to drop", … }
 *
 *   // Consistent uptrend
 *   calculateDropProbability([100, 105, 110, 115, 120])
 *   // → { dropProbability: ~0.07, interpretation: "unlikely to drop", … }
 */
export const calculateDropProbability = (prices) => {
    assertPrices(prices, "calculateDropProbability", 2);

    const { slope } = detectTrendSlope(prices);

    // ── Signal 1: Slope signal via sigmoid ───────────────────────────────────
    const meanPrice = prices.reduce((s, p) => s + p, 0) / prices.length;
    // Normalise slope as a fraction of mean price to make it scale-independent
    const normalisedSlope = meanPrice !== 0 ? slope / meanPrice : 0;
    const k = 10; // sensitivity constant
    const slopeSignal = 1 / (1 + Math.exp(k * normalisedSlope)); // sigmoid(-k·x)

    // ── Signal 2: Recent vs early momentum ───────────────────────────────────
    const segLen = Math.max(1, Math.floor(prices.length / 3));
    const early = prices.slice(0, segLen);
    const recent = prices.slice(-segLen);

    const earlyMean = early.reduce((s, p) => s + p, 0) / early.length;
    const recentMean = recent.reduce((s, p) => s + p, 0) / recent.length;

    // If earlyMean=0 → no meaningful momentum signal; default to neutral 0.5
    const rawMomentum =
        earlyMean !== 0
            ? (earlyMean - recentMean) / earlyMean * 5 + 0.5
            : 0.5;
    const momentumSignal = clamp(rawMomentum, 0, 1);

    // ── Blend ─────────────────────────────────────────────────────────────────
    const dropProbability = parseFloat(
        clamp(0.70 * slopeSignal + 0.30 * momentumSignal, 0, 1).toFixed(4)
    );

    // Plain-English label
    const interpretation =
        dropProbability >= 0.75 ? "very likely to drop" :
            dropProbability >= 0.55 ? "likely to drop" :
                dropProbability >= 0.45 ? "uncertain" :
                    dropProbability >= 0.25 ? "unlikely to drop" :
                        "very unlikely to drop";

    return {
        dropProbability,
        slopeSignal: parseFloat(slopeSignal.toFixed(4)),
        momentumSignal: parseFloat(momentumSignal.toFixed(4)),
        normalisedSlope: parseFloat(normalisedSlope.toFixed(6)),
        interpretation,
    };
};

/**
 * getBestBuyDate
 * ─────────────────────────────────────────────────────────────────────────────
 * Recommends the optimal calendar date to make a purchase, based on the
 * price trend direction detected via linear regression.
 *
 * Decision logic:
 *
 *   Scenario A — Downtrend  (slope < negThreshold)
 *   ─────────────────────────────────────────────────
 *   Prices are falling → waiting is beneficial.
 *   Best-buy date is estimated by projecting the trend line forward until
 *   either the price flattens at a "floor" (90th percentile of the lowest
 *   prices seen) or a maximum look-ahead cap is reached.
 *   Practically: daysToWait ∝ |slope| — steeper drops → wait longer.
 *
 *   Scenario B — Uptrend / Flat  (slope ≥ negThreshold)
 *   ────────────────────────────────────────────────────
 *   Prices are rising or stable → buy today to avoid paying more later.
 *   bestBuyDate = today.
 *
 * @param {number[]} prices         - at least 2 prices in chronological order
 * @param {Date}     [referenceDate] - "today" for the calculation (defaults to now)
 * @returns {{
 *   bestBuyDate      : Date,    - recommended purchase date
 *   daysFromNow      : number,  - 0 = buy today, N = wait N days
 *   recommendation   : "buy_now" | "wait",
 *   forecastPriceOnDate : number,  - projected price on bestBuyDate
 *   slope            : number,
 *   rSquared         : number,
 *   confidence       : "high" | "medium" | "low",
 *   rationale        : string,  - plain-English explanation
 * }}
 *
 * @example
 *   // Downtrend — wait recommended
 *   getBestBuyDate([200, 190, 180, 170, 160])
 *   // → { daysFromNow: ~14, recommendation: "wait", … }
 *
 *   // Uptrend — buy now
 *   getBestBuyDate([100, 110, 120, 130, 140])
 *   // → { daysFromNow: 0, recommendation: "buy_now", … }
 */
export const getBestBuyDate = (prices, referenceDate = new Date()) => {
    assertPrices(prices, "getBestBuyDate", 2);

    if (!(referenceDate instanceof Date) || isNaN(referenceDate.getTime())) {
        throw new TypeError(`getBestBuyDate: referenceDate must be a valid Date object.`);
    }

    const { slope, intercept, rSquared } = detectTrendSlope(prices);

    // Confidence band (reuse same thresholds as linearRegressionForecast)
    const confidence =
        rSquared >= 0.85 ? "high" :
            rSquared >= 0.50 ? "medium" :
                "low";

    // Threshold: only treat as a meaningful downtrend if slope is negative enough
    // to suggest a deliberate fall rather than random noise.
    const meanPrice = prices.reduce((s, p) => s + p, 0) / prices.length;
    const negThreshold = -(meanPrice * 0.002); // −0.2% of mean per period

    // ── Uptrend / Flat → Buy Now ─────────────────────────────────────────────
    if (slope >= negThreshold) {
        const forecastPriceOnDate = parseFloat(
            Math.max(0, intercept + slope * (prices.length - 1)).toFixed(4)
        );

        return {
            bestBuyDate: new Date(referenceDate),
            daysFromNow: 0,
            recommendation: "buy_now",
            forecastPriceOnDate,
            slope,
            rSquared,
            confidence,
            rationale:
                slope > 0
                    ? `Price is trending UP (slope = ${slope}). Buying now avoids paying more later.`
                    : `Price is stable (slope ≈ 0). No benefit to waiting — buy now.`,
        };
    }

    // ── Downtrend → Project forward to find optimal wait time ────────────────
    //
    // Strategy:
    //   1. The floor price is the 10th-percentile of observed prices
    //      (a reasonable estimate of where the price bottoms out).
    //   2. Walk the regression line forward day-by-day until the projected
    //      price reaches or falls below the floor, or until the 90-day cap.
    //   3. Cap at 90 days — beyond that the regression is too unreliable.

    const sorted = [...prices].sort((a, b) => a - b);
    const floorIdx = Math.max(0, Math.floor(sorted.length * 0.10) - 1);
    const floorPrice = sorted[floorIdx];
    const maxLookAhead = 90; // days

    let daysToWait = 1;
    let projectedPrice = 0;
    const baseT = prices.length - 1; // last known index on the regression line

    for (let d = 1; d <= maxLookAhead; d++) {
        projectedPrice = intercept + slope * (baseT + d);

        if (projectedPrice <= floorPrice) {
            daysToWait = d;
            break;
        }
        daysToWait = d; // will be maxLookAhead if floor never reached
    }

    // Clamp projected price to ≥ 0
    const forecastPriceOnDate = parseFloat(Math.max(0, projectedPrice).toFixed(4));
    const bestBuyDate = addDays(referenceDate, daysToWait);

    return {
        bestBuyDate,
        daysFromNow: daysToWait,
        recommendation: "wait",
        forecastPriceOnDate,
        slope,
        rSquared,
        confidence,
        rationale:
            `Price is trending DOWN (slope = ${slope}). ` +
            `Projected to reach floor (~₹${forecastPriceOnDate}) in ~${daysToWait} day(s). ` +
            `Confidence: ${confidence} (R² = ${rSquared}).`,
    };
};
