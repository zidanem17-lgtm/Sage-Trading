"use strict";

const express = require("express");
const router  = express.Router();
const market  = require("../services/marketRouter");

/**
 * GET /api/quote/:symbol
 * Single symbol full quote snapshot.
 */
const SYMBOL_RE = /^[A-Z0-9./]{1,20}$/;

router.get("/:symbol", async (req, res) => {
  const symbol = req.params.symbol.toUpperCase();
  if (!SYMBOL_RE.test(symbol)) {
    return res.status(400).json({ error: "Invalid symbol format." });
  }
  try {
    const quote = await market.getQuote(symbol);
    res.json(quote);
  } catch (err) {
    console.error("[/api/quote]", err.message);
    res.status(502).json({ error: err.message });
  }
});

/**
 * GET /api/quote?symbols=AAPL,MSFT,EUR/USD
 * Bulk quote for watchlist / ticker tape.
 */
router.get("/", async (req, res) => {
  if (!req.query.symbols) {
    return res.status(400).json({ error: "Provide ?symbols=SYM1,SYM2,..." });
  }
  const symbols = req.query.symbols.split(",").map(s => s.trim().toUpperCase()).filter(Boolean);
  if (symbols.length > 30) {
    return res.status(400).json({ error: "Max 30 symbols per request" });
  }
  const invalid = symbols.find(s => !SYMBOL_RE.test(s));
  if (invalid) {
    return res.status(400).json({ error: `Invalid symbol format: ${invalid}` });
  }
  try {
    const quotes = await market.getBulkQuotes(symbols);
    res.json(quotes);
  } catch (err) {
    console.error("[/api/quote bulk]", err.message);
    res.status(502).json({ error: err.message });
  }
});

module.exports = router;
