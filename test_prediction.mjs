import {
    linearRegressionForecast,
    calculateDropProbability,
    getBestBuyDate,
} from "./services/predictionService.js";

const sep = (label) => console.log(`\n${"─".repeat(55)}\n  ${label}\n${"─".repeat(55)}`);

// ── 1. linearRegressionForecast ──────────────────────────────────────────────
sep("linearRegressionForecast — perfect uptrend, 7-day forecast");
// slope=3, intercept=100 → forecast at t=(4+7)=11 → 100 + 3*11 = 133
console.log(linearRegressionForecast([100, 103, 106, 109, 112], 7));

sep("linearRegressionForecast — noisy prices, 30-day forecast");
console.log(linearRegressionForecast([200, 195, 210, 185, 198, 175, 180], 30));

sep("linearRegressionForecast — downtrend, 7-day forecast");
console.log(linearRegressionForecast([150, 140, 130, 120, 110], 7));

// ── 2. calculateDropProbability ───────────────────────────────────────────────
sep("calculateDropProbability — consistent downtrend (expect HIGH prob)");
console.log(calculateDropProbability([200, 190, 180, 170, 160]));

sep("calculateDropProbability — consistent uptrend (expect LOW prob)");
console.log(calculateDropProbability([100, 110, 120, 130, 140]));

sep("calculateDropProbability — flat prices (expect ~0.50, uncertain)");
console.log(calculateDropProbability([100, 100, 100, 100, 100]));

// ── 3. getBestBuyDate ─────────────────────────────────────────────────────────
const today = new Date("2026-03-02");

sep("getBestBuyDate — uptrend → buy_now (daysFromNow should be 0)");
console.log(getBestBuyDate([100, 110, 120, 130, 140], today));

sep("getBestBuyDate — downtrend → wait (daysFromNow should be > 0)");
console.log(getBestBuyDate([200, 190, 180, 170, 160], today));

sep("getBestBuyDate — steep downtrend → longer wait");
console.log(getBestBuyDate([500, 450, 400, 350, 300], today));
