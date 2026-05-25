"use strict";

const express = require("express");
const router  = express.Router();
const market  = require("../services/marketRouter");

/**
 * GET /api/candles/:symbol?tf=1H
 * Returns array of OHLCV bars for the chart.
 */
const SYMBOL_RE = /^[A-Z0-9./]{1,20}$/;

router.get("/:symbol", async (req, res) => {
  const { symbol } = req.params;
  const timeframe  = req.query.tf || "1H";

  const sym = symbol.toUpperCase();
  if (!SYMBOL_RE.test(sym)) {
    return res.status(400).json({ error: "Invalid symbol format." });
  }

  const validTf = ["1m","5m","15m","1H","4H","1D","1W","1M"];
  if (!validTf.includes(timeframe)) {
    return res.status(400).json({ error: `Invalid timeframe. Use one of: ${validTf.join(", ")}` });
  }

  try {
    const bars = await market.getBars(sym, timeframe);
    if (!bars || bars.length === 0) {
      return res.status(404).json({ error: `No bar data found for ${symbol}` });
    }
    res.json({ symbol: sym, timeframe, bars });
  } catch (err) {
    console.error("[/api/candles]", err.message);
    res.status(502).json({ error: err.message });
  }
});

module.exports = router;
