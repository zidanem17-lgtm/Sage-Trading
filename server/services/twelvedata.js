"use strict";

const axios = require("axios");

const BASE_URL = process.env.TWELVE_DATA_URL    || "https://api.twelvedata.com";
const API_KEY  = process.env.TWELVE_DATA_API_KEY || "";

// Twelve Data timeframe strings
const TF_MAP = {
  "1m": "1min", "5m": "5min", "15m": "15min", "1H": "1h",
  "4H": "4h",   "1D": "1day", "1W": "1week",  "1M": "1month",
};

const BAR_LIMIT = {
  "1m": 120, "5m": 130, "15m": 130, "1H": 130,
  "4H": 120, "1D": 120, "1W": 100,  "1M": 80,
};

// Twelve Data handles forex pairs in "EUR/USD" format natively
function isForex(symbol) {
  return /^[A-Z]{3}\/[A-Z]{3}$/.test(symbol);
}

function normalizeBar(v) {
  return {
    open:   parseFloat(v.open),
    high:   parseFloat(v.high),
    low:    parseFloat(v.low),
    close:  parseFloat(v.close),
    volume: parseInt(v.volume || "0", 10),
    time:   new Date(v.datetime).getTime(),
  };
}

// 
//  LATEST PRICE
// 
async function getLatestPrice(symbol) {
  try {
    const { data } = await axios.get(`${BASE_URL}/price`, {
      timeout: 8000,
      params: { symbol, apikey: API_KEY },
    });
    if (data.code && data.code !== 200) {
      throw new Error(data.message || "Twelve Data error");
    }
    return { symbol, price: parseFloat(data.price), timestamp: new Date().toISOString() };
  } catch (err) {
    throw new Error(`TwelveData getLatestPrice(${symbol}): ${err.message}`);
  }
}

// 
//  QUOTE  (bid/ask + daily stats)
// 
async function getQuote(symbol) {
  try {
    const { data } = await axios.get(`${BASE_URL}/quote`, {
      timeout: 8000,
      params: { symbol, apikey: API_KEY },
    });
    if (data.code && data.code !== 200) throw new Error(data.message);
    return {
      symbol,
      price:     parseFloat(data.close),
      open:      parseFloat(data.open),
      high:      parseFloat(data.high),
      low:       parseFloat(data.low),
      volume:    parseInt(data.volume || "0", 10),
      prevClose: parseFloat(data.previous_close),
      change:    parseFloat(data.change),
      changePct: parseFloat(data.percent_change),
      name:      data.name,
      timestamp: data.datetime,
    };
  } catch (err) {
    throw new Error(`TwelveData getQuote(${symbol}): ${err.message}`);
  }
}

// 
//  CANDLE BARS
// 
async function getBars(symbol, timeframe) {
  const interval   = TF_MAP[timeframe] || "1h";
  const outputsize = BAR_LIMIT[timeframe] || 130;

  try {
    const { data } = await axios.get(`${BASE_URL}/time_series`, {
      timeout: 12000,
      params: {
        symbol,
        interval,
        outputsize,
        apikey: API_KEY,
        order:  "ASC",
      },
    });

    if (data.code && data.code !== 200) throw new Error(data.message);
    if (!Array.isArray(data.values)) throw new Error("No bar data returned");

    return data.values.map(normalizeBar);
  } catch (err) {
    throw new Error(`TwelveData getBars(${symbol}, ${timeframe}): ${err.message}`);
  }
}

// 
//  FOREX SPECIFIC -- real-time rate
// 
async function getForexRate(fromCurrency, toCurrency) {
  const symbol = `${fromCurrency}/${toCurrency}`;
  return getLatestPrice(symbol);
}

// 
//  SEARCH
// 
async function searchSymbols(query) {
  try {
    const { data } = await axios.get(`${BASE_URL}/symbol_search`, {
      timeout: 8000,
      params: { symbol: query, apikey: API_KEY },
    });
    if (!data.data) return [];
    return data.data.slice(0, 10).map(item => ({
      symbol:   item.symbol,
      name:     item.instrument_name,
      type:     item.instrument_type,
      exchange: item.exchange,
    }));
  } catch (err) {
    throw new Error(`TwelveData searchSymbols(${query}): ${err.message}`);
  }
}

// 
//  CONNECTION TEST
// 
async function testConnection() {
  const result = await getLatestPrice("EUR/USD");
  return { ok: true, sampleForexPrice: result.price };
}

module.exports = {
  getLatestPrice,
  getQuote,
  getBars,
  getForexRate,
  searchSymbols,
  testConnection,
  isForex,
};
