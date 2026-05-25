"use strict";

require("dotenv").config();

const express    = require("express");
const http       = require("http");
const cors       = require("cors");
const rateLimit  = require("express-rate-limit");

const candlesRoute = require("./routes/candles");
const quotesRoute  = require("./routes/quotes");
const searchRoute  = require("./routes/search");
const { createStreamServer } = require("./routes/stream");

const alpaca   = require("./services/alpaca");
const twelve   = require("./services/twelvedata");

const PORT   = parseInt(process.env.PORT || "4000", 10);
const ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:3000";

//  Validate required env vars 
function checkEnv() {
  const required = ["ALPACA_API_KEY", "ALPACA_SECRET_KEY", "TWELVE_DATA_API_KEY"];
  const missing  = required.filter(k => !process.env[k] || process.env[k].startsWith("YOUR_"));
  if (missing.length) {
    console.warn("  Missing env vars (check .env):", missing.join(", "));
    console.warn("   Copy .env.example -> .env and fill in your API keys.\n");
  }
}

//  App setup 
const app = express();

app.use(cors({
  origin:      ORIGIN,
  credentials: true,
}));
app.use(express.json());

// Rate limiting -- protect upstream APIs
const limiter = rateLimit({
  windowMs: 60 * 1000,  // 1 minute
  max:      120,         // 120 requests / min per IP
  standardHeaders: true,
  legacyHeaders:   false,
  message: { error: "Too many requests, slow down." },
});
app.use("/api/", limiter);

//  Routes 
app.use("/api/candles", candlesRoute);
app.use("/api/quote",   quotesRoute);
app.use("/api/search",  searchRoute);

// Health / status
app.get("/api/health", (req, res) => {
  res.json({
    status:    "ok",
    timestamp: new Date().toISOString(),
    env: {
      alpaca:    !!process.env.ALPACA_API_KEY && !process.env.ALPACA_API_KEY.startsWith("YOUR_"),
      twelveData:!!process.env.TWELVE_DATA_API_KEY && !process.env.TWELVE_DATA_API_KEY.startsWith("YOUR_"),
    },
  });
});

// Account info (Alpaca paper account)
app.get("/api/account", async (req, res) => {
  try {
    const account = await alpaca.getAccount();
    res.json(account);
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

// 404 fallback
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` });
});

// Global error handler
app.use((err, req, res, _next) => {
  console.error("[Server Error]", err.message);
  res.status(500).json({ error: "Internal server error" });
});

//  Start 
const httpServer = http.createServer(app);
createStreamServer(httpServer);

httpServer.listen(PORT, async () => {
  console.log("\n======================================================");
  console.log("  SAGE TRADING BACKEND");
  console.log(`  HTTP  -> http://localhost:${PORT}`);
  console.log(`  WS    -> ws://localhost:${PORT}/api/stream`);
  console.log("======================================================\n");

  checkEnv();

  // Test connections on startup
  console.log("Testing API connections...");
  try {
    const acc = await alpaca.testConnection();
    console.log("  Alpaca OK  Portfolio: $" + acc.account.portfolioValue.toFixed(2));
  } catch (e) {
    console.error("  Alpaca X ", e.message);
  }

  try {
    const td = await twelve.testConnection();
    console.log("  TwelveData OK  EUR/USD:", td.sampleForexPrice);
  } catch (e) {
    console.error("  TwelveData X ", e.message);
  }

  console.log("\nReady.\n");
});

module.exports = app;
