"use strict";

const WebSocket = require("ws");
const market    = require("../services/marketRouter");

// Default symbols streamed when no client specifies
const DEFAULT_SYMBOLS = [
  "AAPL","NVDA","MSFT","GOOGL","AMZN","TSLA","META","JPM","SPY","QQQ",
  "EUR/USD","GBP/USD","USD/JPY","AUD/USD",
  "ES","NQ","GC","CL","BTC",
];

// Poll interval ms (Alpaca free tier: ~200 req/min safe budget)
const POLL_INTERVAL_MS = 2000;

/**
 * createStreamServer(httpServer)
 * Attaches a WebSocket server to the existing HTTP server at path /api/stream.
 * Clients receive JSON messages:
 *   { type: "prices", data: { AAPL: { price, change, changePct, ... }, ... } }
 *   { type: "error",  message: "..." }
 */
const ALLOWED_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:3000";

function createStreamServer(httpServer) {
  const wss = new WebSocket.Server({
    server: httpServer,
    path:   "/api/stream",
    verifyClient: ({ origin }, cb) => {
      // Allow connections with no Origin (curl / server-to-server) and the
      // configured frontend origin. Reject everything else.
      if (!origin || origin === ALLOWED_ORIGIN) return cb(true);
      console.warn(`[Stream] Rejected WS from unauthorized origin: ${origin}`);
      cb(false, 403, "Forbidden");
    },
  });

  console.log("[Stream] WebSocket server attached at ws://localhost/api/stream");

  // Track all connected clients and their subscribed symbols
  const clients = new Map(); // ws -> Set<string>

  // Price cache -- updated by the poll loop
  const priceCache  = {};
  const prevPrices  = {};
  let   pollTimer   = null;
  let   activeSyms  = new Set(DEFAULT_SYMBOLS);

  //  Broadcast to all connected clients 
  function broadcast(payload) {
    const msg = JSON.stringify(payload);
    for (const [ws] of clients) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(msg);
      }
    }
  }

  //  Rebuild the active symbol list from all subscriptions 
  function rebuildActiveSymbols() {
    activeSyms = new Set(DEFAULT_SYMBOLS);
    for (const [, syms] of clients) {
      for (const s of syms) activeSyms.add(s);
    }
  }

  //  Poll loop -- fetch prices for all active symbols 
  async function pollPrices() {
    const symbols = Array.from(activeSyms);
    const updates = {};

    await Promise.allSettled(
      symbols.map(async sym => {
        try {
          const result = await market.getLatestPrice(sym);
          const price  = result.price;
          const prev   = prevPrices[sym] || price;
          const change = price - prev;

          updates[sym] = {
            price,
            change,
            changePct:  prev ? (change / prev) * 100 : 0,
            timestamp:  result.timestamp || new Date().toISOString(),
          };

          prevPrices[sym]  = price;
          priceCache[sym]  = updates[sym];
        } catch (err) {
          // Don't kill the loop on individual symbol errors
          if (priceCache[sym]) updates[sym] = priceCache[sym]; // serve cached
        }
      })
    );

    if (Object.keys(updates).length > 0 && clients.size > 0) {
      broadcast({ type: "prices", data: updates });
    }
  }

  function startPolling() {
    if (pollTimer) return;
    pollPrices(); // immediate first tick
    pollTimer = setInterval(pollPrices, POLL_INTERVAL_MS);
    console.log("[Stream] Polling started");
  }

  function stopPolling() {
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
      console.log("[Stream] Polling stopped (no clients)");
    }
  }

  //  Client connection 
  wss.on("connection", (ws, req) => {
    const ip = req.socket.remoteAddress;
    console.log(`[Stream] Client connected from ${ip}. Total: ${wss.clients.size}`);

    clients.set(ws, new Set(DEFAULT_SYMBOLS));
    startPolling();

    // Send current cache immediately so UI doesn't wait
    if (Object.keys(priceCache).length > 0) {
      ws.send(JSON.stringify({ type: "prices", data: priceCache }));
    }

    //  Handle messages from client 
    ws.on("message", raw => {
      try {
        const msg = JSON.parse(raw.toString());

        // { type: "subscribe", symbols: ["AAPL","EUR/USD"] }
        if (msg.type === "subscribe" && Array.isArray(msg.symbols)) {
          const symSet = clients.get(ws) || new Set();
          msg.symbols.forEach(s => symSet.add(s.toUpperCase()));
          clients.set(ws, symSet);
          rebuildActiveSymbols();
          console.log(`[Stream] Client subscribed to: ${msg.symbols.join(", ")}`);
        }

        // { type: "unsubscribe", symbols: ["AAPL"] }
        if (msg.type === "unsubscribe" && Array.isArray(msg.symbols)) {
          const symSet = clients.get(ws) || new Set();
          msg.symbols.forEach(s => symSet.delete(s.toUpperCase()));
          clients.set(ws, symSet);
          rebuildActiveSymbols();
        }

        // { type: "ping" }
        if (msg.type === "ping") {
          ws.send(JSON.stringify({ type: "pong", ts: Date.now() }));
        }
      } catch (e) {
        ws.send(JSON.stringify({ type: "error", message: "Invalid JSON" }));
      }
    });

    ws.on("close", () => {
      clients.delete(ws);
      rebuildActiveSymbols();
      console.log(`[Stream] Client disconnected. Remaining: ${clients.size}`);
      if (clients.size === 0) stopPolling();
    });

    ws.on("error", err => {
      console.error("[Stream] WS error:", err.message);
      clients.delete(ws);
    });
  });

  return wss;
}

module.exports = { createStreamServer };
