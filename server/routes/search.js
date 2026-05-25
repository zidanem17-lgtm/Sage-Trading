"use strict";

const express = require("express");
const router  = express.Router();
const market  = require("../services/marketRouter");

/**
 * GET /api/search?q=AAPL
 */
router.get("/", async (req, res) => {
  const q = (req.query.q || "").trim();
  if (!q || q.length < 1) {
    return res.status(400).json({ error: "Provide ?q=<query>" });
  }
  try {
    const results = await market.searchSymbols(q);
    res.json(results);
  } catch (err) {
    console.error("[/api/search]", err.message);
    res.status(502).json({ error: err.message });
  }
});

module.exports = router;
