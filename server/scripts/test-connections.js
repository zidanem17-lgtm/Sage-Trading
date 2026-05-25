#!/usr/bin/env node
"use strict";

require("dotenv").config({ path: require("path").join(__dirname, "../.env") });

const alpaca = require("../services/alpaca");
const twelve = require("../services/twelvedata");
const router = require("../services/marketRouter");

async function run() {
  console.log("\n========================================");
  console.log("  SAGE TRADING -- Connection Test");
  console.log("========================================\n");

  // 1. Alpaca account
  console.log("1. Alpaca account...");
  try {
    const r = await alpaca.testConnection();
    console.log("   OK -- Portfolio: $" + r.account.portfolioValue.toFixed(2));
    console.log("   Buying Power:   $" + r.account.buyingPower.toFixed(2));
    console.log("   Status:         " + r.account.status);
  } catch (e) {
    console.error("   FAIL:", e.message);
  }

  // 2. Alpaca stock bars
  console.log("\n2. Alpaca bars -- AAPL 1H...");
  try {
    const bars = await alpaca.getBars("AAPL", "1H");
    console.log("   OK -- got " + bars.length + " bars, latest close: $" + bars[bars.length-1].close.toFixed(2));
  } catch (e) {
    console.error("   FAIL:", e.message);
  }

  // 3. TwelveData forex
  console.log("\n3. TwelveData -- EUR/USD price...");
  try {
    const r = await twelve.testConnection();
    console.log("   OK -- EUR/USD: " + r.sampleForexPrice);
  } catch (e) {
    console.error("   FAIL:", e.message);
  }

  // 4. TwelveData bars
  console.log("\n4. TwelveData bars -- EUR/USD 1H...");
  try {
    const bars = await twelve.getBars("EUR/USD", "1H");
    console.log("   OK -- got " + bars.length + " bars, latest close: " + bars[bars.length-1].close.toFixed(5));
  } catch (e) {
    console.error("   FAIL:", e.message);
  }

  // 5. Router -- stock
  console.log("\n5. Router -- NVDA 1D...");
  try {
    const bars = await router.getBars("NVDA", "1D");
    console.log("   OK -- got " + bars.length + " bars");
  } catch (e) {
    console.error("   FAIL:", e.message);
  }

  // 6. Router -- futures
  console.log("\n6. Router -- GC (Gold) 1D...");
  try {
    const bars = await router.getBars("GC", "1D");
    console.log("   OK -- got " + bars.length + " bars");
  } catch (e) {
    console.error("   FAIL:", e.message);
  }

  // 7. Bulk quotes
  console.log("\n7. Bulk quotes -- AAPL, MSFT, EUR/USD...");
  try {
    const quotes = await router.getBulkQuotes(["AAPL","MSFT","EUR/USD"]);
    for (const [sym, q] of Object.entries(quotes)) {
      console.log("   " + sym + ": $" + (q.price || 0).toFixed(4) +
        " (" + (q.changePct >= 0 ? "+" : "") + (q.changePct || 0).toFixed(2) + "%)");
    }
  } catch (e) {
    console.error("   FAIL:", e.message);
  }

  // 8. Search
  console.log("\n8. Search -- 'tesla'...");
  try {
    const results = await router.searchSymbols("tesla");
    console.log("   OK -- " + results.length + " results: " + results.map(r => r.symbol).join(", "));
  } catch (e) {
    console.error("   FAIL:", e.message);
  }

  console.log("\n========================================\n");
}

run().catch(console.error);
