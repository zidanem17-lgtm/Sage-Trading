"use strict";

const axios = require("axios");

const BASE_DATA  = process.env.ALPACA_DATA_URL  || "https://data.alpaca.markets";
const BASE_TRADE = process.env.ALPACA_TRADE_URL || "https://paper-api.alpaca.markets";
const KEY        = process.env.ALPACA_API_KEY    || "";
const SECRET     = process.env.ALPACA_SECRET_KEY || "";

const AUTH = {
  "APCA-API-KEY-ID":     KEY,
  "APCA-API-SECRET-KEY": SECRET,
  "Content-Type":        "application/json",
};

// Alpaca timeframe strings
const TF_MAP = {
  "1m": "1Min", "5m": "5Min", "15m": "15Min",
  "1H": "1Hour", "4H": "4Hour",
  "1D": "1Day",  "1W": "1Week", "1M": "1Month",
};

// How many bars to fetch per timeframe
const BAR_LIMIT = {
  "1m": 120, "5m": 130, "15m": 130, "1H": 130,
  "4H": 120, "1D": 120, "1W": 100,  "1M": 80,
};

function isCrypto(symbol) {
  return symbol.includes("/") && !symbol.includes("USD/") && !symbol.startsWith("EUR");
}

//  Normalize a raw Alpaca bar into our standard shape 
function normalizeBar(bar, tsField) {
  return {
    open:   bar.o,
    high:   bar.h,
    low:    bar.l,
    close:  bar.c,
    volume: bar.v,
    time:   new Date(bar[tsField] || bar.t).getTime(),
  };
}

// 
//  LATEST QUOTE / TRADE (single price snapshot)
// 
async function getLatestPrice(symbol) {
  try {
    if (isCrypto(symbol)) {
      const url = `${BASE_DATA}/v1beta3/crypto/us/latest/trades?symbols=${encodeURIComponent(symbol)}`;
      const { data } = await axios.get(url, { headers: AUTH, timeout: 8000 });
      const t = data.trades[symbol];
      return { symbol, price: t.p, timestamp: t.t };
    }
    // Stocks: use latest trade
    const url = `${BASE_DATA}/v2/stocks/${encodeURIComponent(symbol)}/trades/latest?feed=iex`;
    const { data } = await axios.get(url, { headers: AUTH, timeout: 8000 });
    return { symbol, price: data.trade.p, timestamp: data.trade.t };
  } catch (err) {
    throw new Error(`Alpaca getLatestPrice(${symbol}): ${err.message}`);
  }
}

// 
//  BARS (OHLCV candles)
// 
async function getBars(symbol, timeframe) {
  const tf    = TF_MAP[timeframe] || "1Hour";
  const limit = BAR_LIMIT[timeframe] || 130;

  try {
    if (isCrypto(symbol)) {
      const url = `${BASE_DATA}/v1beta3/crypto/us/bars`;
      const { data } = await axios.get(url, {
        headers: AUTH,
        timeout: 12000,
        params: { symbols: symbol, timeframe: tf, limit },
      });
      const bars = data.bars[symbol] || [];
      return bars.map(b => normalizeBar(b, "t"));
    }

    // Stocks
    const url = `${BASE_DATA}/v2/stocks/${encodeURIComponent(symbol)}/bars`;
    const { data } = await axios.get(url, {
      headers: AUTH,
      timeout: 12000,
      params: { timeframe: tf, limit, feed: "iex", adjustment: "raw" },
    });
    return (data.bars || []).map(b => normalizeBar(b, "t"));
  } catch (err) {
    throw new Error(`Alpaca getBars(${symbol}, ${timeframe}): ${err.message}`);
  }
}

// 
//  MULTI-SNAPSHOT  (bulk quotes for watchlist / ticker tape)
// 
async function getSnapshots(symbols) {
  // Filter to stock-only symbols for Alpaca snapshot endpoint
  const stockSymbols = symbols.filter(s => !isCrypto(s) && !s.includes("/"));
  if (!stockSymbols.length) return {};

  try {
    const url = `${BASE_DATA}/v2/stocks/snapshots`;
    const { data } = await axios.get(url, {
      headers: AUTH,
      timeout: 10000,
      params: { symbols: stockSymbols.join(","), feed: "iex" },
    });

    const result = {};
    for (const [sym, snap] of Object.entries(data)) {
      const lt = snap.latestTrade || {};
      const dBar = snap.dailyBar  || {};
      const pBar = snap.prevDailyBar || {};
      result[sym] = {
        symbol:    sym,
        price:     lt.p   || dBar.c || 0,
        open:      dBar.o || 0,
        high:      dBar.h || 0,
        low:       dBar.l || 0,
        volume:    dBar.v || 0,
        prevClose: pBar.c || 0,
        change:    (lt.p || dBar.c || 0) - (pBar.c || 0),
        changePct: pBar.c ? ((lt.p || dBar.c || 0) - pBar.c) / pBar.c * 100 : 0,
        timestamp: lt.t || dBar.t,
      };
    }
    return result;
  } catch (err) {
    throw new Error(`Alpaca getSnapshots: ${err.message}`);
  }
}

// 
//  SYMBOL SEARCH  (Alpaca asset list)
// 
async function searchAssets(query) {
  try {
    const url = `${BASE_TRADE}/v2/assets`;
    const { data } = await axios.get(url, {
      headers: AUTH,
      timeout: 10000,
      params: { status: "active", asset_class: "us_equity" },
    });
    const q = query.toLowerCase();
    return data
      .filter(a => a.symbol.toLowerCase().includes(q) || a.name.toLowerCase().includes(q))
      .slice(0, 10)
      .map(a => ({ symbol: a.symbol, name: a.name, type: "stock", exchange: a.exchange }));
  } catch (err) {
    throw new Error(`Alpaca searchAssets(${query}): ${err.message}`);
  }
}

// 
//  ACCOUNT INFO
// 
async function getAccount() {
  try {
    const { data } = await axios.get(`${BASE_TRADE}/v2/account`, {
      headers: AUTH, timeout: 8000,
    });
    return {
      id:            data.id,
      buyingPower:   parseFloat(data.buying_power),
      cash:          parseFloat(data.cash),
      portfolioValue:parseFloat(data.portfolio_value),
      equity:        parseFloat(data.equity),
      currency:      data.currency,
      status:        data.status,
    };
  } catch (err) {
    throw new Error(`Alpaca getAccount: ${err.message}`);
  }
}

// 
//  CONNECTION TEST
// 
async function testConnection() {
  const account = await getAccount();
  return { ok: true, account };
}

module.exports = {
  getLatestPrice,
  getBars,
  getSnapshots,
  searchAssets,
  getAccount,
  testConnection,
  isCrypto,
};
