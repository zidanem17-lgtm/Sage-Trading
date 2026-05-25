"use strict";

/**
 * marketRouter.js
 * Decides which provider handles each symbol type, with automatic fallback.
 *
 * Rules:
 *   Forex pairs (EUR/USD etc.)  -> TwelveData (primary)
 *   Stocks / ETFs               -> Alpaca (primary) -> TwelveData fallback
 *   Crypto (BTC/USD etc.)       -> Alpaca (primary) -> TwelveData fallback
 *   Futures (ES, GC, CL etc.)   -> TwelveData (Alpaca doesn't support futures yet)
 */

const alpaca    = require("./alpaca");
const twelve    = require("./twelvedata");

// Symbols that must go to TwelveData
const FUTURES_SYMBOLS = new Set([
  "ES", "NQ", "YM", "RTY",
  "GC", "SI", "CL", "NG", "ZN", "ZB",
  "BTC", "ETH",               // CME futures
]);

function isForexSymbol(sym) {
  return /^[A-Z]{3}\/[A-Z]{3}$/.test(sym);
}
function isFuturesSymbol(sym) {
  return FUTURES_SYMBOLS.has(sym.toUpperCase());
}
function isCryptoSymbol(sym) {
  // Alpaca crypto format: "BTC/USD"
  return sym.includes("/") && !isForexSymbol(sym);
}

// 
//  ROUTE: GET BARS
// 
async function getBars(symbol, timeframe) {
  // Forex -> TwelveData only
  if (isForexSymbol(symbol)) {
    return twelve.getBars(symbol, timeframe);
  }
  // Futures -> TwelveData only
  if (isFuturesSymbol(symbol)) {
    return twelve.getBars(symbol + "=F", timeframe)
      .catch(() => twelve.getBars(symbol, timeframe));
  }
  // Stocks / Crypto -> Alpaca with TwelveData fallback
  try {
    const bars = await alpaca.getBars(symbol, timeframe);
    if (bars && bars.length > 0) return bars;
    throw new Error("Empty bars from Alpaca");
  } catch (alpacaErr) {
    console.warn(`[Router] Alpaca bars failed for ${symbol}, falling back to TwelveData: ${alpacaErr.message}`);
    return twelve.getBars(symbol, timeframe);
  }
}

// 
//  ROUTE: GET LATEST PRICE
// 
async function getLatestPrice(symbol) {
  if (isForexSymbol(symbol)) {
    return twelve.getLatestPrice(symbol);
  }
  if (isFuturesSymbol(symbol)) {
    return twelve.getLatestPrice(symbol + "=F")
      .catch(() => twelve.getLatestPrice(symbol));
  }
  try {
    return await alpaca.getLatestPrice(symbol);
  } catch (err) {
    console.warn(`[Router] Alpaca price failed for ${symbol}, falling back: ${err.message}`);
    return twelve.getLatestPrice(symbol);
  }
}

// 
//  ROUTE: GET QUOTE (full OHLCV snapshot)
// 
async function getQuote(symbol) {
  if (isForexSymbol(symbol) || isFuturesSymbol(symbol)) {
    return twelve.getQuote(symbol);
  }
  // Try Alpaca snapshot first
  try {
    const snaps = await alpaca.getSnapshots([symbol]);
    if (snaps[symbol]) return snaps[symbol];
    throw new Error("No snapshot");
  } catch (err) {
    console.warn(`[Router] Alpaca snapshot failed for ${symbol}: ${err.message}`);
    return twelve.getQuote(symbol);
  }
}

// 
//  ROUTE: BULK SNAPSHOTS (for watchlist refresh)
// 
async function getBulkQuotes(symbols) {
  const results = {};
  const stockSyms  = symbols.filter(s => !isForexSymbol(s) && !isFuturesSymbol(s));
  const forexSyms  = symbols.filter(s => isForexSymbol(s));
  const futureSyms = symbols.filter(s => isFuturesSymbol(s));

  // Alpaca bulk for stocks
  if (stockSyms.length) {
    try {
      const snaps = await alpaca.getSnapshots(stockSyms);
      Object.assign(results, snaps);
    } catch (err) {
      console.warn("[Router] Alpaca bulk snapshot error:", err.message);
      // Fallback: fetch individually via TwelveData
      for (const sym of stockSyms) {
        try {
          results[sym] = await twelve.getQuote(sym);
        } catch (e) {
          console.error(`[Router] TwelveData fallback failed for ${sym}:`, e.message);
        }
      }
    }
  }

  // TwelveData for forex and futures (parallel)
  const tdSymbols = [
    ...forexSyms,
    ...futureSyms.map(s => s + "=F"),
  ];
  await Promise.allSettled(
    tdSymbols.map(async (sym, i) => {
      const originalSym = futureSyms[i - forexSyms.length] || sym;
      try {
        results[originalSym] = await twelve.getQuote(sym);
        results[originalSym].symbol = originalSym;
      } catch (e) {
        console.error(`[Router] TwelveData quote failed for ${sym}:`, e.message);
      }
    })
  );

  return results;
}

// 
//  ROUTE: SEARCH
// 
async function searchSymbols(query) {
  const [alpacaResults, tdResults] = await Promise.allSettled([
    alpaca.searchAssets(query),
    twelve.searchSymbols(query),
  ]);

  const fromAlpaca = alpacaResults.status === "fulfilled" ? alpacaResults.value : [];
  const fromTd     = tdResults.status     === "fulfilled" ? tdResults.value     : [];

  // Deduplicate by symbol
  const seen = new Set();
  return [...fromAlpaca, ...fromTd].filter(r => {
    if (seen.has(r.symbol)) return false;
    seen.add(r.symbol);
    return true;
  }).slice(0, 12);
}

module.exports = {
  getBars,
  getLatestPrice,
  getQuote,
  getBulkQuotes,
  searchSymbols,
  isForexSymbol,
  isFuturesSymbol,
  isCryptoSymbol,
};
