import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  BarChart2, TrendingUp, TrendingDown, Globe, Zap, Search, Bell, Settings,
  Star, ArrowUpRight, ArrowDownRight, LayoutDashboard,
  ChevronUp, ChevronDown, SlidersHorizontal,
  Maximize2, Minimize2, Layers, Plus, X,
  ChevronRight, Clock, Wifi, ZoomIn, ZoomOut,
  DollarSign
} from "lucide-react";

/* ================================================================
   CUSTOM SVG ICONS  (no emojis)
================================================================ */
const PlayIcon  = ({ s = 14, c = "currentColor" }) => (
  <svg width={s} height={s} viewBox="0 0 16 16"><path d="M4 2.5L13.5 8 4 13.5Z" fill={c} /></svg>
);
const PauseIcon = ({ s = 14, c = "currentColor" }) => (
  <svg width={s} height={s} viewBox="0 0 16 16">
    <rect x="2.5" y="2.5" width="4" height="11" rx="1" fill={c} />
    <rect x="9.5" y="2.5" width="4" height="11" rx="1" fill={c} />
  </svg>
);
const StopIcon  = ({ s = 14, c = "currentColor" }) => (
  <svg width={s} height={s} viewBox="0 0 16 16">
    <rect x="2.5" y="2.5" width="11" height="11" rx="1.5" fill={c} />
  </svg>
);
const BotSvg    = ({ s = 18, c = "currentColor" }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round">
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <circle cx="12" cy="5" r="2" />
    <line x1="12" y1="7" x2="12" y2="11" />
    <circle cx="8" cy="16.5" r="1.2" fill={c} stroke="none" />
    <circle cx="16" cy="16.5" r="1.2" fill={c} stroke="none" />
    <path d="M9 19.5c0-.8.9-1.5 3-1.5s3 .7 3 1.5" />
  </svg>
);
const CandleIcon = ({ s = 14, c = "currentColor" }) => (
  <svg width={s} height={s} viewBox="0 0 16 16" fill="none">
    <line x1="4"  y1="1"    x2="4"  y2="4.5"  stroke={c} strokeWidth="1.4" strokeLinecap="round" />
    <rect x="2"   y="4.5"   width="4" height="6" rx="0.5" fill={c} />
    <line x1="4"  y1="10.5" x2="4"  y2="14"   stroke={c} strokeWidth="1.4" strokeLinecap="round" />
    <line x1="12" y1="2.5"  x2="12" y2="5.5"  stroke={c} strokeWidth="1.4" strokeLinecap="round" />
    <rect x="10"  y="5.5"   width="4" height="7" rx="0.5" fill="none" stroke={c} strokeWidth="1.4" />
    <line x1="12" y1="12.5" x2="12" y2="15"   stroke={c} strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);
const AreaIcon = ({ s = 14, c = "currentColor" }) => (
  <svg width={s} height={s} viewBox="0 0 16 16" fill="none">
    <path d="M1 13L4.5 7.5 7.5 9.5 11 4.5 14.5 6.5" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M1 13L4.5 7.5 7.5 9.5 11 4.5 14.5 6.5 14.5 14 1 14Z" fill={c} opacity="0.2" />
  </svg>
);
const LineIcon = ({ s = 14, c = "currentColor" }) => (
  <svg width={s} height={s} viewBox="0 0 16 16" fill="none">
    <path d="M1 13L5 7 8.5 9.5 12 4 15 6.5" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* ================================================================
   COLOUR PALETTE
================================================================ */
const C = {
  bg:        "#070910",
  surf:      "#0d1019",
  surf2:     "#111521",
  surf3:     "#161b2c",
  border:    "#1c2235",
  borderMid: "#242c45",
  text:      "#c2cbdf",
  bright:    "#e8edf8",
  muted:     "#4e5a74",
  faint:     "#1d2438",
  green:     "#0de8a2",
  greenDim:  "rgba(13,232,162,0.10)",
  greenGlow: "rgba(13,232,162,0.06)",
  red:       "#ff4f6d",
  redDim:    "rgba(255,79,109,0.10)",
  blue:      "#4f9dff",
  blueDim:   "rgba(79,157,255,0.10)",
  purple:    "#a07cf8",
  amber:     "#f5b942",
  amberDim:  "rgba(245,185,66,0.12)",
  cyan:      "#22d4e8",
};

/* ================================================================
   SEED SYMBOL LISTS  (prices are starting points only)
================================================================ */
const STOCKS = [
  { symbol: "AAPL",  name: "Apple Inc.",        price: 189.84 },
  { symbol: "NVDA",  name: "NVIDIA Corp.",       price: 875.39 },
  { symbol: "MSFT",  name: "Microsoft Corp.",    price: 415.26 },
  { symbol: "GOOGL", name: "Alphabet Inc.",      price: 175.01 },
  { symbol: "AMZN",  name: "Amazon.com",         price: 192.45 },
  { symbol: "TSLA",  name: "Tesla Inc.",         price: 247.15 },
  { symbol: "META",  name: "Meta Platforms",     price: 504.22 },
  { symbol: "JPM",   name: "JPMorgan Chase",     price: 198.77 },
  { symbol: "SPY",   name: "S&P 500 ETF",        price: 528.14 },
  { symbol: "QQQ",   name: "Invesco QQQ",        price: 461.88 },
];
const FOREX = [
  { symbol: "EUR/USD", name: "Euro / USD",    price: 1.08415, pip: 0.0001 },
  { symbol: "GBP/USD", name: "Pound / USD",   price: 1.27340, pip: 0.0001 },
  { symbol: "USD/JPY", name: "USD / Yen",     price: 154.720, pip: 0.01   },
  { symbol: "AUD/USD", name: "AUD / USD",     price: 0.64410, pip: 0.0001 },
  { symbol: "USD/CHF", name: "USD / CHF",     price: 0.90120, pip: 0.0001 },
  { symbol: "NZD/USD", name: "NZD / USD",     price: 0.59780, pip: 0.0001 },
  { symbol: "EUR/GBP", name: "Euro / Pound",  price: 0.85140, pip: 0.0001 },
  { symbol: "USD/CAD", name: "USD / CAD",     price: 1.36820, pip: 0.0001 },
];
const FUTURES = [
  { symbol: "ES",  name: "S&P 500 Futures",    price: 5287.50,  expiry: "Jun 25" },
  { symbol: "NQ",  name: "Nasdaq-100 Futures", price: 18742.25, expiry: "Jun 25" },
  { symbol: "GC",  name: "Gold Futures",       price: 2387.40,  expiry: "Jun 25" },
  { symbol: "CL",  name: "Crude Oil WTI",      price: 82.14,    expiry: "Jun 25" },
  { symbol: "SI",  name: "Silver Futures",     price: 28.765,   expiry: "Jul 25" },
  { symbol: "BTC", name: "Bitcoin CME",        price: 64850.00, expiry: "May 25" },
  { symbol: "NG",  name: "Natural Gas",        price: 1.742,    expiry: "Jun 25" },
  { symbol: "ZN",  name: "10-Yr T-Note",       price: 109.203,  expiry: "Jun 25" },
];
const ALL_SEED = [...STOCKS, ...FOREX, ...FUTURES];

/* ================================================================
   TIMEFRAME CONFIG
================================================================ */
const TF_CFG = {
  "1m":  { count: 120, vol: 0.0015, ms: 60000       },
  "5m":  { count: 130, vol: 0.003,  ms: 300000      },
  "15m": { count: 130, vol: 0.006,  ms: 900000      },
  "1H":  { count: 130, vol: 0.009,  ms: 3600000     },
  "4H":  { count: 120, vol: 0.016,  ms: 14400000    },
  "1D":  { count: 120, vol: 0.026,  ms: 86400000    },
  "1W":  { count: 100, vol: 0.042,  ms: 604800000   },
  "1M":  { count:  80, vol: 0.065,  ms: 2592000000  },
};

/* ================================================================
   REAL MARKET DATA SERVICE
   Points to the Node.js backend on :4000.
   Falls back to simulated data if backend is unreachable.
================================================================ */
// In production set VITE_API_BASE (e.g. https://api.yourserver.com) and
// VITE_WS_URL (e.g. wss://api.yourserver.com/api/stream).
// In dev, leave them empty so Vite's proxy forwards /api/* to :4000.
const API_BASE = import.meta.env.VITE_API_BASE ?? "";
const WS_URL   = import.meta.env.VITE_WS_URL
  ?? (() => {
    const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
    return `${proto}//${window.location.host}/api/stream`;
  })();

// How long (ms) a "dead" backend status is cached before retrying.
const BACKEND_CHECK_TTL = 30_000;

const MarketDataService = {
  _backendAlive:    null,
  _backendCheckedAt: 0,

  async _checkBackend() {
    const now = Date.now();
    if (this._backendAlive !== null && now - this._backendCheckedAt < BACKEND_CHECK_TTL) {
      return this._backendAlive;
    }
    try {
      const r = await fetch(API_BASE + "/api/health", { signal: AbortSignal.timeout(3000) });
      this._backendAlive = r.ok;
    } catch {
      this._backendAlive = false;
    }
    this._backendCheckedAt = now;
    return this._backendAlive;
  },

  async getCandles(symbol, timeframe) {
    const alive = await this._checkBackend();
    if (!alive) {
      console.warn("[MDS] Backend offline - using simulated candles for", symbol);
      const cfg  = TF_CFG[timeframe] || TF_CFG["1H"];
      const seed = ALL_SEED.find(x => x.symbol === symbol);
      return genCandles(seed ? seed.price : 200, cfg.count, cfg.vol, cfg.ms);
    }
    try {
      const r = await fetch(
        API_BASE + "/api/candles/" + encodeURIComponent(symbol) + "?tf=" + timeframe,
        { signal: AbortSignal.timeout(12000) }
      );
      if (!r.ok) throw new Error("HTTP " + r.status);
      const json = await r.json();
      if (!json.bars || json.bars.length === 0) throw new Error("Empty bars");
      return json.bars;
    } catch (err) {
      console.warn("[MDS] Candles fetch failed for", symbol, "-", err.message, "- using sim");
      const cfg  = TF_CFG[timeframe] || TF_CFG["1H"];
      const seed = ALL_SEED.find(x => x.symbol === symbol);
      return genCandles(seed ? seed.price : 200, cfg.count, cfg.vol, cfg.ms);
    }
  },

  async getBulkQuotes(symbols) {
    const alive = await this._checkBackend();
    if (!alive) return {};
    try {
      const r = await fetch(
        API_BASE + "/api/quote?symbols=" + symbols.map(s => encodeURIComponent(s)).join(","),
        { signal: AbortSignal.timeout(10000) }
      );
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    } catch (err) {
      console.warn("[MDS] Bulk quotes failed:", err.message);
      return {};
    }
  },

  async searchSymbols(query) {
    const alive = await this._checkBackend();
    if (!alive) return [];
    try {
      const r = await fetch(
        API_BASE + "/api/search?q=" + encodeURIComponent(query),
        { signal: AbortSignal.timeout(6000) }
      );
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    } catch (err) {
      console.warn("[MDS] Search failed:", err.message);
      return [];
    }
  },

  async getAccount() {
    try {
      const r = await fetch(API_BASE + "/api/account", { signal: AbortSignal.timeout(6000) });
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    } catch {
      return null;
    }
  },
};

/* ================================================================
   UTILITIES
================================================================ */
const tickP   = (p, v = 0.0003) => p * (1 + (Math.random() - 0.499) * v * 2);
const fmtP    = p => p > 10000 ? p.toFixed(2) : p > 100 ? p.toFixed(2) : p > 10 ? p.toFixed(3) : p.toFixed(5);
const fmtPx   = (p, isForex) => isForex ? p.toFixed(5) : fmtP(p);
const fmtV    = v => v >= 1e9 ? (v / 1e9).toFixed(2) + "B" : v >= 1e6 ? (v / 1e6).toFixed(2) + "M" : (v / 1e3).toFixed(0) + "K";
const fmtPnl  = n => (n >= 0 ? "+" : "-") + "$" + Math.abs(n).toFixed(2);
const fmtChg  = (chg, sym) => FOREX.find(f => f.symbol === sym) ? fmtP(chg) : chg.toFixed(2);
const clamp   = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const uid     = () => Math.random().toString(36).slice(2);
const isForexSym = sym => !!FOREX.find(f => f.symbol === sym);

function genCandles(base, count = 130, vol = 0.009, ms = 3600000) {
  let p = base;
  const now = Date.now();
  return Array.from({ length: count }, (_, i) => {
    const open  = p;
    const diff  = (Math.random() - 0.496) * vol;
    const close = open * (1 + diff);
    const high  = Math.max(open, close) * (1 + Math.random() * vol * 0.4);
    const low   = Math.min(open, close) * (1 - Math.random() * vol * 0.4);
    p = close;
    return { open, close, high, low, volume: Math.floor(Math.random() * 4e6 + 3e5), time: now - (count - i) * ms };
  });
}

function initMkt(arr) {
  return arr.map(x => ({
    ...x,
    openP:     x.price,
    high:      x.price * 1.013,
    low:       x.price * 0.987,
    change:    0,
    changePct: 0,
    history:   Array(60).fill(x.price),
    volume:    Math.floor(Math.random() * 20e6 + 1e6),
  }));
}

function tickMkt(arr) {
  return arr.map(x => {
    const np  = tickP(x.price, 0.00035);
    const ch  = np - x.openP;
    const pct = (ch / x.openP) * 100;
    return {
      ...x,
      price:     np,
      change:    ch,
      changePct: pct,
      high:      Math.max(x.high, np),
      low:       Math.min(x.low, np),
      history:   [...x.history.slice(1), np],
      volume:    x.volume + Math.floor(Math.random() * 40000),
    };
  });
}

/* ================================================================
   MARKET-OPEN CHECK  (uses local hour approximation)
================================================================ */
function marketOpen() {
  const now = new Date();
  const utc = now.getUTCHours() * 60 + now.getUTCMinutes();
  // NYSE roughly 13:30-20:00 UTC (shifts ~1h with DST but fine for sim)
  return utc >= 810 && utc < 1200;
}

/* ================================================================
   STRATEGY ENGINE
================================================================ */
const smaVal = (px, n) => px.length < n ? px[px.length - 1] : px.slice(-n).reduce((a, b) => a + b, 0) / n;
const emaVal = (px, n) => {
  if (px.length < n) return px[px.length - 1];
  const k = 2 / (n + 1);
  let e = px.slice(0, n).reduce((a, b) => a + b, 0) / n;
  for (let i = n; i < px.length; i++) e = px[i] * k + e * (1 - k);
  return e;
};
const rsiVal = (px, n = 14) => {
  if (px.length < n + 1) return 50;
  const d  = px.slice(1).map((p, i) => p - px[i]);
  const ag = d.slice(-n).filter(x => x > 0).reduce((a, b) => a + b, 0) / n;
  const al = d.slice(-n).filter(x => x < 0).reduce((a, b) => a + Math.abs(b), 0) / n;
  return al === 0 ? 100 : 100 - 100 / (1 + ag / al);
};

/* Simplified Black-Scholes for call/put premium */
const normCDF = x => {
  const t = 1 / (1 + 0.3275911 * Math.abs(x));
  const v = 1 - (0.254829592 + (-0.284496736 + (1.421413741 + (-1.453152027 + 1.061405429 * t) * t) * t) * t) * t * Math.exp(-x * x / 2);
  return x >= 0 ? v : 1 - v;
};
function bsPremium(S, K, T, type, vol = 0.25, r = 0.05) {
  if (T <= 0) return type === "call" ? Math.max(0, S - K) : Math.max(0, K - S);
  const d1 = (Math.log(S / K) + (r + vol * vol / 2) * T) / (vol * Math.sqrt(T));
  const d2 = d1 - vol * Math.sqrt(T);
  return type === "call"
    ? S * normCDF(d1)  - K * Math.exp(-r * T) * normCDF(d2)
    : K * Math.exp(-r * T) * normCDF(-d2) - S * normCDF(-d1);
}

function getSignal(strategy, prices, params = {}) {
  if (prices.length < 30) return "hold";
  const prev = prices.slice(0, -1);
  switch (strategy) {
    case "SMA Cross": {
      const fast = params.fast || 9, slow = params.slow || 21;
      const f = smaVal(prices, fast), s = smaVal(prices, slow);
      const pf = smaVal(prev, fast),  ps = smaVal(prev, slow);
      if (f > s && pf <= ps) return "buy";
      if (f < s && pf >= ps) return "sell";
      return "hold";
    }
    case "RSI": {
      const per = params.period || 14;
      const r = rsiVal(prices, per), pr = rsiVal(prev, per);
      if (r < (params.oversold  || 30) && pr >= (params.oversold  || 30)) return "buy";
      if (r > (params.overbought|| 70) && pr <= (params.overbought|| 70)) return "sell";
      return "hold";
    }
    case "MACD": {
      const m  = emaVal(prices, 12) - emaVal(prices, 26);
      const pm = emaVal(prev,   12) - emaVal(prev,   26);
      if (m > 0 && pm <= 0) return "buy";
      if (m < 0 && pm >= 0) return "sell";
      return "hold";
    }
    case "Bollinger": {
      const n  = params.period || 20, mul = params.std || 2;
      const sl = prices.slice(-n), mean = sl.reduce((a, b) => a + b, 0) / n;
      const sd = Math.sqrt(sl.reduce((a, b) => a + (b - mean) ** 2, 0) / n);
      const p  = prices[prices.length - 1];
      if (p < mean - mul * sd) return "buy";
      if (p > mean + mul * sd) return "sell";
      return "hold";
    }
    case "Mean Rev.": {
      const m   = smaVal(prices, params.period || 20);
      const p   = prices[prices.length - 1];
      const dev = (p - m) / m * 100;
      if (dev < -(params.threshold || 1.5)) return "buy";
      if (dev >  (params.threshold || 1.5)) return "sell";
      return "hold";
    }
    default:
      return "hold";
  }
}

function exitPosition(bot, exitPrice, reason) {
  if (!bot.position) return bot;
  const { entry, size } = bot.position;
  const pnlPct = (exitPrice - entry) / entry * 100;
  const pnlUsd = pnlPct / 100 * size;
  const trade  = { id: uid(), entry, exit: exitPrice, pnl: pnlUsd, pnlPct, reason, time: Date.now() };
  return {
    ...bot,
    position: null,
    pnl:      (bot.pnl || 0) + pnlUsd,
    trades:   [trade, ...(bot.trades || []).slice(0, 49)],
    signals:  [{ type: "close", price: exitPrice, time: Date.now() }, ...(bot.signals || []).slice(0, 19)],
  };
}

function processBot(bot, curPrice) {
  if (bot.status !== "running") return bot;
  const priceHistory = [...(bot.priceHistory || []), curPrice].slice(-100);
  let b = { ...bot, priceHistory };

  /* SL / TP on open position */
  if (b.position) {
    const { entry, size } = b.position;
    const pct = (curPrice - entry) / entry * 100;
    if (pct <= -(b.risk.sl || 2)) {
      b = exitPosition(b, curPrice, "Stop Loss");
    } else if (pct >= (b.risk.tp || 4)) {
      b = exitPosition(b, curPrice, "Take Profit");
    } else {
      b = { ...b, position: { ...b.position, openPnl: pct / 100 * size } };
    }
  }

  /* Entry / exit signal (long-only) */
  const sig = getSignal(b.strategy, b.priceHistory, b.params);

  if (sig === "buy" && !b.position) {
    let entryPrice = curPrice;
    let note = "";
    if (b.market === "options") {
      const K  = b.optStrike || curPrice;
      const T  = (b.optDays || 30) / 365;
      entryPrice = bsPremium(curPrice, K, T, b.optType || "call") * 100;
      note = (b.optType || "call").toUpperCase() + " $" + K.toFixed(0);
    }
    b = {
      ...b,
      position: { side: "long", entry: entryPrice, size: b.risk.size || 1000, openPnl: 0, time: Date.now(), note },
      signals: [{ type: "buy", price: curPrice, time: Date.now() }, ...(b.signals || []).slice(0, 19)],
    };
  } else if (sig === "sell" && b.position) {
    let exitPrice = curPrice;
    if (b.market === "options") {
      const K = b.optStrike || curPrice;
      const T = Math.max(0, ((b.optDays || 30) - 0.1) / 365);
      exitPrice = bsPremium(curPrice, K, T, b.optType || "call") * 100;
    }
    b = exitPosition(b, exitPrice, "Signal");
  }

  return b;
}

/* ================================================================
   DRAWING TOOLKIT  —  geometry helpers
================================================================ */
function chartGeom(canvas, N) {
  const W    = canvas.clientWidth;
  const H    = canvas.clientHeight;
  const PAD  = { l: 8, r: 76, t: 20, b: 22 };
  const PH   = H * 0.745;
  const cW   = W - PAD.l - PAD.r;
  const cH   = PH - PAD.t;
  const step = cW / Math.max(1, N);
  return { W, H, PAD, PH, cW, cH, step };
}

function chartScale(candles) {
  const rawMax = Math.max(...candles.map(c => c.high));
  const rawMin = Math.min(...candles.map(c => c.low));
  const pad    = (rawMax - rawMin) * 0.07;
  return { pMax: rawMax + pad, pMin: rawMin - pad };
}

function pxToCoord(px, py, canvas, visibleCandles) {
  const N   = visibleCandles.length;
  const { W, H, PAD, PH, cW, cH, step } = chartGeom(canvas, N);
  const { pMax, pMin } = chartScale(visibleCandles);
  const idx   = clamp(Math.round((px - PAD.l) / step - 0.5), 0, N - 1);
  const price = pMin + (1 - (py - PAD.t) / cH) * (pMax - pMin);
  const time  = visibleCandles[idx] ? visibleCandles[idx].time : 0;
  return { time, price, idx };
}

function coordToPx(time, price, canvas, visibleCandles) {
  const N   = visibleCandles.length;
  const { W, H, PAD, PH, cW, cH, step } = chartGeom(canvas, N);
  const { pMax, pMin } = chartScale(visibleCandles);
  const idx = visibleCandles.findIndex(c => c.time >= time);
  const i   = idx < 0 ? N - 1 : idx;
  const x   = PAD.l + (i + 0.5) * step;
  const y   = PAD.t + (1 - (price - pMin) / (pMax - pMin)) * cH;
  return { x, y };
}

function distToSeg(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1, dy = y2 - y1;
  const len2 = dx * dx + dy * dy;
  if (len2 === 0) return Math.hypot(px - x1, py - y1);
  const t = clamp(((px - x1) * dx + (py - y1) * dy) / len2, 0, 1);
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

/* ================================================================
   CANVAS CHART RENDERER
================================================================ */
function renderChart(canvas, candles, chartType, hx, hy, tfMs, botSignals, drawings, activeDrawing, selectedDrawId) {
  if (!canvas || candles.length < 2) return;
  const dpr = window.devicePixelRatio || 1;
  const W   = canvas.clientWidth;
  const H   = canvas.clientHeight;
  if (!W || !H) return;
  if (canvas.width  !== Math.round(W * dpr)) canvas.width  = Math.round(W * dpr);
  if (canvas.height !== Math.round(H * dpr)) canvas.height = Math.round(H * dpr);
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const PAD = { l: 8, r: 76, t: 20, b: 22 };
  const PH  = H * 0.745;
  const VT  = PH + 7;
  const VH  = H - VT - PAD.b;
  const cW  = W - PAD.l - PAD.r;
  const cH  = PH - PAD.t;
  const N   = candles.length;
  const step = cW / N;
  const bw  = Math.max(1.5, step * 0.72);

  const rawMax = Math.max(...candles.map(c => c.high));
  const rawMin = Math.min(...candles.map(c => c.low));
  const pad    = (rawMax - rawMin) * 0.07;
  const pMax   = rawMax + pad;
  const pMin   = rawMin - pad;

  const tx = i => PAD.l + (i + 0.5) * step;
  const ty = p => PAD.t + (1 - (p - pMin) / (pMax - pMin)) * cH;

  /* Background */
  ctx.fillStyle = C.bg;
  ctx.fillRect(0, 0, W, H);

  /* Horizontal grid lines */
  for (let g = 0; g <= 5; g++) {
    const gp = pMin + (g / 5) * (pMax - pMin);
    const gy = ty(gp);
    ctx.strokeStyle = "rgba(255,255,255,0.03)";
    ctx.lineWidth   = 1;
    ctx.beginPath();
    ctx.moveTo(PAD.l, gy);
    ctx.lineTo(W - PAD.r, gy);
    ctx.stroke();
    ctx.fillStyle = "#2c3650";
    ctx.font      = "10px JetBrains Mono,monospace";
    ctx.textAlign = "left";
    ctx.fillText(fmtP(gp), W - PAD.r + 5, gy + 3.5);
  }

  /* Vertical grid lines */
  for (let g = 0; g <= 6; g++) {
    const x = PAD.l + (g / 6) * cW;
    ctx.strokeStyle = "rgba(255,255,255,0.015)";
    ctx.lineWidth   = 1;
    ctx.beginPath();
    ctx.moveTo(x, PAD.t);
    ctx.lineTo(x, PH);
    ctx.stroke();
  }

  const overallUp = candles[N - 1].close >= candles[0].open;

  /* Area / Line */
  if (chartType !== "candle") {
    const col = overallUp ? C.green : C.red;
    if (chartType === "area") {
      const grad = ctx.createLinearGradient(0, PAD.t, 0, PH);
      grad.addColorStop(0, overallUp ? "rgba(13,232,162,0.22)" : "rgba(255,79,109,0.22)");
      grad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.beginPath();
      ctx.moveTo(tx(0), ty(candles[0].close));
      candles.forEach((c, i) => ctx.lineTo(tx(i), ty(c.close)));
      ctx.lineTo(tx(N - 1), PH);
      ctx.lineTo(tx(0), PH);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();
    }
    ctx.beginPath();
    ctx.moveTo(tx(0), ty(candles[0].close));
    candles.forEach((c, i) => ctx.lineTo(tx(i), ty(c.close)));
    ctx.strokeStyle = col;
    ctx.lineWidth   = 1.8;
    ctx.lineJoin    = "round";
    ctx.stroke();

  /* Candlesticks */
  } else {
    candles.forEach((c, i) => {
      const x   = tx(i);
      const isUp = c.close >= c.open;
      const col  = isUp ? C.green : C.red;
      const bT   = ty(Math.max(c.open, c.close));
      const bB   = ty(Math.min(c.open, c.close));
      const bH   = Math.max(1, bB - bT);
      ctx.strokeStyle = col;
      ctx.lineWidth   = 1;
      ctx.beginPath();
      ctx.moveTo(x, ty(c.high));
      ctx.lineTo(x, bT);
      ctx.moveTo(x, bB);
      ctx.lineTo(x, ty(c.low));
      ctx.stroke();
      if (bw >= 3) {
        if (isUp) {
          ctx.fillStyle = col;
          ctx.fillRect(x - bw / 2, bT, bw, bH);
        } else {
          ctx.fillStyle   = col + "28";
          ctx.strokeStyle = col;
          ctx.lineWidth   = 1;
          ctx.fillRect(x - bw / 2, bT, bw, bH);
          ctx.strokeRect(x - bw / 2, bT, bw, bH);
        }
      } else {
        ctx.strokeStyle = col;
        ctx.lineWidth   = 1;
        ctx.beginPath();
        ctx.moveTo(x, ty(c.high));
        ctx.lineTo(x, ty(c.low));
        ctx.stroke();
      }
    });
  }

  /* Current-price dashed line */
  const lastClose = candles[N - 1].close;
  const ly        = ty(lastClose);
  const pCol      = overallUp ? C.green : C.red;
  ctx.strokeStyle = overallUp ? "rgba(13,232,162,0.30)" : "rgba(255,79,109,0.30)";
  ctx.lineWidth   = 1;
  ctx.setLineDash([4, 5]);
  ctx.beginPath();
  ctx.moveTo(PAD.l, ly);
  ctx.lineTo(W - PAD.r, ly);
  ctx.stroke();
  ctx.setLineDash([]);
  const BW = 70, BH = 20, bx = W - PAD.r + 3, by = ly - BH / 2;
  ctx.fillStyle = pCol;
  if (ctx.roundRect) ctx.roundRect(bx, by, BW, BH, 3); else ctx.rect(bx, by, BW, BH);
  ctx.fill();
  ctx.fillStyle = "#000";
  ctx.font      = "bold 10.5px JetBrains Mono,monospace";
  ctx.textAlign = "center";
  ctx.fillText(fmtP(lastClose), bx + BW / 2, by + BH / 2 + 3.8);

  /* Volume bars */
  const maxVol = Math.max(...candles.map(c => c.volume));
  ctx.strokeStyle = "rgba(255,255,255,0.04)";
  ctx.lineWidth   = 1;
  ctx.beginPath();
  ctx.moveTo(PAD.l, VT);
  ctx.lineTo(W - PAD.r, VT);
  ctx.stroke();
  candles.forEach((c, i) => {
    const x  = tx(i);
    const vh = Math.max(1, (c.volume / maxVol) * VH);
    ctx.fillStyle = c.close >= c.open ? "rgba(13,232,162,0.28)" : "rgba(255,79,109,0.28)";
    if (bw >= 1.5) ctx.fillRect(x - bw / 2, H - PAD.b - vh, bw, vh);
  });

  /* Bot signal markers (uses underlying price, works for all markets) */
  const sigWindow = tfMs * 2;
  (botSignals || []).forEach(sig => {
    if (sig.price > pMax || sig.price < pMin) return;
    const idx = candles.findIndex(c => Math.abs(c.time - sig.time) < sigWindow);
    if (idx < 0) return;
    const x = tx(idx), y = ty(sig.price);
    const isBuy = sig.type === "buy";
    ctx.fillStyle = isBuy ? C.green : C.red;
    ctx.beginPath();
    if (isBuy) {
      ctx.moveTo(x,     y + 8);
      ctx.lineTo(x - 5, y + 18);
      ctx.lineTo(x + 5, y + 18);
    } else {
      ctx.moveTo(x,     y - 8);
      ctx.lineTo(x - 5, y - 18);
      ctx.lineTo(x + 5, y - 18);
    }
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#000";
    ctx.font      = "bold 7px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(isBuy ? "B" : "S", x, y + (isBuy ? 14 : -13));
  });

  /* Crosshair */
  if (hx != null && hy != null && hx > PAD.l && hx < W - PAD.r && hy > PAD.t && hy < PH) {
    ctx.strokeStyle = "rgba(194,203,223,0.17)";
    ctx.lineWidth   = 1;
    ctx.setLineDash([3, 4]);
    ctx.beginPath();
    ctx.moveTo(hx, PAD.t); ctx.lineTo(hx, PH);
    ctx.moveTo(PAD.l, hy); ctx.lineTo(W - PAD.r, hy);
    ctx.stroke();
    ctx.setLineDash([]);

    /* Y-axis price label */
    const hp = pMin + (1 - (hy - PAD.t) / cH) * (pMax - pMin);
    ctx.fillStyle   = C.surf3;
    ctx.strokeStyle = "rgba(255,255,255,0.14)";
    ctx.lineWidth   = 1;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(W - PAD.r + 3, hy - 10, BW, 20, 3); else ctx.rect(W - PAD.r + 3, hy - 10, BW, 20);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = C.text;
    ctx.font      = "10px JetBrains Mono,monospace";
    ctx.textAlign = "center";
    ctx.fillText(fmtP(hp), W - PAD.r + 3 + BW / 2, hy + 3.5);

    /* OHLCV tooltip */
    const idx = clamp(Math.floor((hx - PAD.l) / step), 0, N - 1);
    const hc  = candles[idx];
    if (hc) {
      const isUp = hc.close >= hc.open;
      const TW = 158, TH = 100;
      const ttx = Math.min(hx + 14, W - PAD.r - TW - 8);
      const tty = clamp(hy - TH / 2, PAD.t + 4, PH - TH - 4);
      ctx.fillStyle   = "rgba(9,11,18,0.94)";
      ctx.strokeStyle = C.border;
      ctx.lineWidth   = 1;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(ttx, tty, TW, TH, 7); else ctx.rect(ttx, tty, TW, TH);
      ctx.fill();
      ctx.stroke();
      const rows = [
        ["Open",  fmtP(hc.open),  isUp ? C.green : C.red],
        ["High",  fmtP(hc.high),  C.green],
        ["Low",   fmtP(hc.low),   C.red],
        ["Close", fmtP(hc.close), isUp ? C.green : C.red],
        ["Vol",   fmtV(hc.volume), C.muted],
      ];
      rows.forEach(([l, v, col], li) => {
        ctx.fillStyle = C.muted;
        ctx.font      = "10px JetBrains Mono,monospace";
        ctx.textAlign = "left";
        ctx.fillText(l, ttx + 12, tty + 18 + li * 16.5);
        ctx.fillStyle = col;
        ctx.textAlign = "right";
        ctx.fillText(v, ttx + TW - 10, tty + 18 + li * 16.5);
      });
    }
  }

  /* ---- DRAWINGS ---- */
  const allDrawings = [...(drawings || []), ...(activeDrawing ? [activeDrawing] : [])];

  // Helper: x pixel from a time value
  function xFromTime(t) {
    const idx = candles.findIndex(c => c.time >= t);
    const i   = idx < 0 ? N - 1 : idx;
    return tx(i);
  }

  function applyStroke(d) {
    ctx.strokeStyle = d.color || C.green;
    ctx.lineWidth   = d.width || 1.5;
    ctx.setLineDash(d.dash ? [6, 4] : []);
  }

  function drawGlow(id) {
    if (id === selectedDrawId) {
      ctx.shadowColor = "#0de8a2";
      ctx.shadowBlur  = 10;
    } else {
      ctx.shadowBlur = 0;
    }
  }

  allDrawings.forEach(d => {
    if (!d || !d.p1) return;
    const isSelected = d.id === selectedDrawId;
    ctx.save();
    drawGlow(d.id);
    applyStroke(d);

    const x1 = xFromTime(d.p1.time);
    const y1 = ty(d.p1.price || 0);
    const x2 = d.p2 ? xFromTime(d.p2.time) : x1;
    const y2 = d.p2 ? ty(d.p2.price || 0)  : y1;

    /* ---- trend line ---- */
    if (d.type === "line") {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    /* ---- ray (extends from p1 through p2 to edge of chart) ---- */
    else if (d.type === "ray") {
      if (x1 !== x2 || y1 !== y2) {
        const dx = x2 - x1, dy = y2 - y1;
        const t  = Math.max((W - PAD.r - x1) / (dx || 0.001), (PAD.l - x1) / (dx || 0.001));
        const ex = x1 + dx * (dx > 0 ? t : 0);
        const ey = y1 + dy * (dx > 0 ? t : 0);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(dx >= 0 ? Math.min(ex, W - PAD.r) : Math.max(ex, PAD.l), ey);
        ctx.stroke();
        // small dot at origin
        ctx.fillStyle = d.color || C.green;
        ctx.beginPath();
        ctx.arc(x1, y1, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    /* ---- extended line (infinite both ways) ---- */
    else if (d.type === "xline") {
      if (x1 !== x2 || y1 !== y2) {
        const dx = x2 - x1 || 0.001, dy = y2 - y1;
        const tR = (W - PAD.r - x1) / dx;
        const tL = (PAD.l - x1) / dx;
        const tMin = Math.min(tL, tR);
        const tMax = Math.max(tL, tR);
        ctx.beginPath();
        ctx.moveTo(x1 + dx * tMin, y1 + dy * tMin);
        ctx.lineTo(x1 + dx * tMax, y1 + dy * tMax);
        ctx.stroke();
      }
    }

    /* ---- horizontal line ---- */
    else if (d.type === "hline") {
      const y = ty(d.p1.price);
      ctx.beginPath();
      ctx.moveTo(PAD.l, y);
      ctx.lineTo(W - PAD.r, y);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = d.color || C.green;
      ctx.font      = "9px JetBrains Mono,monospace";
      ctx.textAlign = "left";
      ctx.fillText(fmtP(d.p1.price), W - PAD.r + 5, y - 3);
    }

    /* ---- vertical line ---- */
    else if (d.type === "vline") {
      const x = xFromTime(d.p1.time);
      ctx.beginPath();
      ctx.moveTo(x, PAD.t);
      ctx.lineTo(x, PH);
      ctx.stroke();
    }

    /* ---- rectangle ---- */
    else if (d.type === "rect") {
      const rx  = Math.min(x1, x2);
      const ry  = Math.min(y1, y2);
      const rw  = Math.abs(x2 - x1);
      const rh  = Math.abs(y2 - y1);
      const col = d.color || C.green;
      ctx.fillStyle   = col + "1a";
      ctx.strokeStyle = col;
      ctx.fillRect(rx, ry, rw, rh);
      ctx.strokeRect(rx, ry, rw, rh);
    }

    /* ---- parallel channel ---- */
    else if (d.type === "channel" && d.p2) {
      const x3 = d.p3 ? xFromTime(d.p3.time) : x1;
      const y3 = d.p3 ? ty(d.p3.price || 0)  : y1;
      // base line p1 → p2
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      if (d.p3) {
        // offset = p3.price - p1.price
        const dy3 = y3 - y1;
        ctx.beginPath();
        ctx.moveTo(x1, y1 + dy3);
        ctx.lineTo(x2, y2 + dy3);
        ctx.stroke();
        // fill between
        ctx.setLineDash([]);
        const col = d.color || C.green;
        ctx.fillStyle = col + "0d";
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.lineTo(x2, y2 + dy3);
        ctx.lineTo(x1, y1 + dy3);
        ctx.closePath();
        ctx.fill();
        // midline dashed
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = (d.color || C.green) + "66";
        ctx.lineWidth   = 0.8;
        ctx.beginPath();
        ctx.moveTo(x1, y1 + dy3 / 2);
        ctx.lineTo(x2, y2 + dy3 / 2);
        ctx.stroke();
      }
    }

    /* ---- fibonacci retracement ---- */
    else if (d.type === "fib" && d.p2) {
      const fibLevels = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1, 1.618];
      const fibColors = [C.green, C.blue, C.blue, C.amber, C.blue, C.blue, C.red, C.purple];
      // draw connector
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      fibLevels.forEach((lvl, li) => {
        const fibPrice = d.p2.price + (d.p1.price - d.p2.price) * lvl;
        const fy       = ty(fibPrice);
        if (fy < PAD.t || fy > PH) return;
        ctx.setLineDash([5, 3]);
        ctx.strokeStyle = fibColors[li] || C.green;
        ctx.lineWidth   = 0.8;
        ctx.globalAlpha = 0.7;
        ctx.beginPath();
        ctx.moveTo(PAD.l, fy);
        ctx.lineTo(W - PAD.r, fy);
        ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.setLineDash([]);
        ctx.fillStyle = fibColors[li] || C.green;
        ctx.font      = "8px JetBrains Mono,monospace";
        ctx.textAlign = "right";
        ctx.fillText(
          (lvl * 100).toFixed(1) + "%  " + fmtP(fibPrice),
          W - PAD.r - 2, fy - 2
        );
      });
    }

    /* ---- pitchfork (Andrews) ---- */
    else if (d.type === "pitch" && d.p2) {
      const x3 = d.p3 ? xFromTime(d.p3.time) : x2;
      const y3 = d.p3 ? ty(d.p3.price || 0)  : y2;
      // midpoint of p2 and p3
      const mx = (x2 + x3) / 2;
      const my = (y2 + y3) / 2;
      // median line: p1 → midpoint, extended
      const mDx = mx - x1 || 0.001, mDy = my - y1;
      const tR  = (W - PAD.r - x1) / mDx;
      const meX = x1 + mDx * Math.max(tR, 0);
      const meY = y1 + mDy * Math.max(tR, 0);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(Math.min(meX, W - PAD.r), meY);
      ctx.stroke();
      if (d.p3) {
        // upper fork through p2, parallel to median
        const tR2  = (W - PAD.r - x2) / mDx;
        const uf1X = x2, uf1Y = y2;
        const uf2X = Math.min(x2 + mDx * Math.max(tR2, 0), W - PAD.r);
        const uf2Y = y2 + mDy * Math.max(tR2, 0);
        ctx.beginPath();
        ctx.moveTo(uf1X, uf1Y);
        ctx.lineTo(uf2X, uf2Y);
        ctx.stroke();
        // lower fork through p3, parallel to median
        const tR3  = (W - PAD.r - x3) / mDx;
        const lf1X = x3, lf1Y = y3;
        const lf2X = Math.min(x3 + mDx * Math.max(tR3, 0), W - PAD.r);
        const lf2Y = y3 + mDy * Math.max(tR3, 0);
        ctx.beginPath();
        ctx.moveTo(lf1X, lf1Y);
        ctx.lineTo(lf2X, lf2Y);
        ctx.stroke();
        // handle bar p2 → p3
        ctx.setLineDash([3, 3]);
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(x2, y2);
        ctx.lineTo(x3, y3);
        ctx.stroke();
      }
    }

    /* ---- arrow up ---- */
    else if (d.type === "arrowup") {
      const col = d.color || C.green;
      ctx.fillStyle   = col;
      ctx.strokeStyle = col;
      ctx.setLineDash([]);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x1,     y1 - 6);
      ctx.lineTo(x1 - 7, y1 + 6);
      ctx.lineTo(x1 + 7, y1 + 6);
      ctx.closePath();
      ctx.fill();
      ctx.font      = "bold 9px sans-serif";
      ctx.fillStyle = "#000";
      ctx.textAlign = "center";
      ctx.fillText("B", x1, y1 + 4);
    }

    /* ---- arrow down ---- */
    else if (d.type === "arrowdn") {
      const col = d.color || C.red;
      ctx.fillStyle   = col;
      ctx.strokeStyle = col;
      ctx.setLineDash([]);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x1,     y1 + 6);
      ctx.lineTo(x1 - 7, y1 - 6);
      ctx.lineTo(x1 + 7, y1 - 6);
      ctx.closePath();
      ctx.fill();
      ctx.font      = "bold 9px sans-serif";
      ctx.fillStyle = "#000";
      ctx.textAlign = "center";
      ctx.fillText("S", x1, y1 - 2);
    }

    /* ---- text note ---- */
    else if (d.type === "text" && d.label) {
      const col = d.color || C.amber;
      ctx.font      = "11px DM Sans,sans-serif";
      ctx.textAlign = "left";
      const tw  = ctx.measureText(d.label).width + 12;
      const th  = 18;
      ctx.fillStyle   = C.surf3;
      ctx.strokeStyle = col;
      ctx.lineWidth   = 1;
      ctx.setLineDash([]);
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(x1, y1 - th, tw, th, 3);
      else ctx.rect(x1, y1 - th, tw, th);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = col;
      ctx.fillText(d.label, x1 + 6, y1 - 4);
    }

    /* ---- price measure ---- */
    else if (d.type === "measure" && d.p2) {
      const rx  = Math.min(x1, x2);
      const ry  = Math.min(y1, y2);
      const rw  = Math.abs(x2 - x1);
      const rh  = Math.abs(y2 - y1);
      const diff = d.p2.price - d.p1.price;
      const pct  = d.p1.price ? ((diff / d.p1.price) * 100).toFixed(2) : "0";
      const bars = Math.abs(candles.findIndex(c => c.time >= d.p2.time) -
                            candles.findIndex(c => c.time >= d.p1.time));
      ctx.fillStyle   = (diff >= 0 ? C.green : C.red) + "1a";
      ctx.strokeStyle = (diff >= 0 ? C.green : C.red) + "cc";
      ctx.lineWidth   = 1;
      ctx.setLineDash([]);
      ctx.fillRect(rx, ry, rw, rh);
      ctx.strokeRect(rx, ry, rw, rh);
      const label = (diff >= 0 ? "+" : "") + fmtP(diff) + "  " + (diff >= 0 ? "+" : "") + pct + "%  " + bars + "bars";
      ctx.fillStyle = diff >= 0 ? C.green : C.red;
      ctx.font      = "9px JetBrains Mono,monospace";
      ctx.textAlign = "center";
      ctx.fillText(label, rx + rw / 2, ry + rh / 2 + 4);
    }

    ctx.restore();
    ctx.setLineDash([]);
    ctx.shadowBlur = 0;

    /* Draw anchor dots for selected drawing or active drawing */
    if ((isSelected || d === activeDrawing) && d.p1) {
      [d.p1, d.p2, d.p3].forEach(pt => {
        if (!pt) return;
        const ax = xFromTime(pt.time);
        const ay = ty(pt.price || 0);
        ctx.save();
        ctx.fillStyle   = d.color || C.green;
        ctx.strokeStyle = "#fff";
        ctx.lineWidth   = 1.5;
        ctx.beginPath();
        ctx.arc(ax, ay, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      });
    }
  });

  /* Time axis */
  for (let i = 0; i <= 5; i++) {
    const idx = Math.floor(i * (N - 1) / 5);
    const d   = new Date(candles[idx].time);
    const lbl = (d.getMonth() + 1) + "/" + d.getDate() + " " +
                String(d.getHours()).padStart(2, "0") + ":" +
                String(d.getMinutes()).padStart(2, "0");
    ctx.fillStyle = "#2a3450";
    ctx.font      = "8.5px JetBrains Mono,monospace";
    ctx.textAlign = "center";
    ctx.fillText(lbl, tx(idx), H - 5);
  }
}

/* ================================================================
   SPARKLINE
================================================================ */
function Spark({ data, positive, w = 70, h = 26 }) {
  const mn  = Math.min(...data);
  const mx  = Math.max(...data);
  const rg  = mx - mn || 0.001;
  const pts = data.map((v, i) => (i / (data.length - 1)) * w + "," + (h - ((v - mn) / rg) * h)).join(" ");
  const col = positive ? C.green : C.red;
  const ex  = (data.length - 1) / (data.length - 1) * w;
  const ey  = h - ((data[data.length - 1] - mn) / rg) * h;
  return (
    <svg width={w} height={h} style={{ overflow: "visible", flexShrink: 0 }}>
      <polygon points={"0," + h + " " + pts + " " + w + "," + h}
        fill={positive ? "rgba(13,232,162,0.07)" : "rgba(255,79,109,0.07)"} />
      <polyline points={pts} fill="none" stroke={col} strokeWidth="1.35" strokeLinejoin="round" />
      <circle cx={ex} cy={ey} r="2.2" fill={col} />
    </svg>
  );
}

/* ================================================================
   BOT CARD
================================================================ */
function BotCard({ bot, onUpdate }) {
  const [expanded, setExpanded] = useState(false);
  const up       = (bot.pnl || 0) >= 0;
  const hasPos   = !!bot.position;
  const statusCol = bot.status === "running" ? C.green : bot.status === "paused" ? C.amber : C.muted;

  return (
    <div style={{ borderBottom: "1px solid " + C.border + "22" }}>
      {/* Header */}
      <div style={{ padding: "10px 13px", cursor: "pointer" }} onClick={() => setExpanded(e => !e)}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <div style={{
              width: 6, height: 6, borderRadius: "50%", background: statusCol,
              boxShadow:  bot.status === "running" ? "0 0 6px " + statusCol : undefined,
              animation:  bot.status === "running" ? "pulse-dot 1.8s ease-in-out infinite" : undefined,
            }} />
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11.5, fontWeight: 700, color: C.bright }}>
              {bot.name}
            </span>
          </div>
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.08em",
            padding: "2px 7px", borderRadius: 3,
            background: statusCol + "22", color: statusCol }}>
            {bot.status.toUpperCase()}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 6, flexWrap: "wrap" }}>
          {[bot.symbol, bot.market.toUpperCase(), bot.strategy, "LONG-ONLY"].map((t, i) => (
            <span key={i} style={{ fontSize: 8.5, color: C.muted, background: C.faint, padding: "1px 6px", borderRadius: 3 }}>
              {t}
            </span>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <span style={{ fontSize: 9, color: C.muted, marginRight: 4 }}>Realised PnL</span>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, fontWeight: 700, color: up ? C.green : C.red }}>
              {fmtPnl(bot.pnl || 0)}
            </span>
          </div>
          {hasPos && (
            <span style={{ fontSize: 9, color: (bot.position.openPnl || 0) >= 0 ? C.green : C.red }}>
              {"Open: " + fmtPnl(bot.position.openPnl || 0)}
            </span>
          )}
          <span style={{ fontSize: 9, color: hasPos ? C.amber : C.muted }}>
            {hasPos ? "LONG @ " + fmtP(bot.position.entry) : "FLAT"}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: "flex", gap: 4, padding: "0 13px 10px" }}>
        {bot.status !== "running" && (
          <button onClick={() => onUpdate({ ...bot, status: "running" })} style={{
            display: "flex", alignItems: "center", gap: 3, padding: "3px 9px",
            borderRadius: 4, border: "1px solid " + C.green + "40",
            background: C.greenDim, color: C.green, fontSize: 9, fontWeight: 600, cursor: "pointer" }}>
            <PlayIcon s={10} c={C.green} /> Run
          </button>
        )}
        {bot.status === "running" && (
          <button onClick={() => onUpdate({ ...bot, status: "paused" })} style={{
            display: "flex", alignItems: "center", gap: 3, padding: "3px 9px",
            borderRadius: 4, border: "1px solid " + C.amber + "40",
            background: C.amberDim, color: C.amber, fontSize: 9, fontWeight: 600, cursor: "pointer" }}>
            <PauseIcon s={10} c={C.amber} /> Pause
          </button>
        )}
        <button onClick={() => onUpdate({ ...bot, status: "stopped", position: null })} style={{
          display: "flex", alignItems: "center", gap: 3, padding: "3px 9px",
          borderRadius: 4, border: "1px solid " + C.muted + "40",
          background: C.faint, color: C.muted, fontSize: 9, fontWeight: 600, cursor: "pointer" }}>
          <StopIcon s={10} c={C.muted} /> Stop
        </button>
        <button onClick={() => setExpanded(e => !e)} style={{
          marginLeft: "auto", display: "flex", alignItems: "center", gap: 2,
          padding: "3px 8px", borderRadius: 4, border: "1px solid " + C.border,
          background: "transparent", color: C.muted, fontSize: 9, cursor: "pointer" }}>
          {expanded ? "Hide" : "Details"}
          <ChevronRight size={10} style={{ transform: expanded ? "rotate(90deg)" : "none", transition: "transform 0.2s" }} />
        </button>
      </div>

      {/* Expanded */}
      {expanded && (
        <div style={{ padding: "0 13px 12px", borderTop: "1px solid " + C.border + "22" }}>
          {(bot.signals || []).length > 0 && (
            <>
              <div style={{ fontSize: 8, color: C.muted, letterSpacing: "0.1em", marginTop: 8, marginBottom: 4 }}>
                RECENT SIGNALS
              </div>
              {bot.signals.slice(0, 5).map((s, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 3, fontSize: 9 }}>
                  <span style={{ color: s.type === "buy" ? C.green : s.type === "close" ? C.muted : C.red, fontWeight: 700 }}>
                    {s.type === "buy" ? "BUY" : s.type === "close" ? "CLOSE" : "SELL"}
                  </span>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", color: C.text }}>{fmtP(s.price)}</span>
                  <span style={{ color: C.muted }}>{Math.round((Date.now() - s.time) / 60000) + "m ago"}</span>
                </div>
              ))}
            </>
          )}
          {(bot.trades || []).length > 0 && (
            <>
              <div style={{ fontSize: 8, color: C.muted, letterSpacing: "0.1em", marginTop: 8, marginBottom: 4 }}>
                TRADE HISTORY
              </div>
              {bot.trades.slice(0, 4).map((t, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 3, fontSize: 9 }}>
                  <span style={{ color: t.pnl >= 0 ? C.green : C.red, fontWeight: 700 }}>{t.reason}</span>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", color: t.pnl >= 0 ? C.green : C.red }}>
                    {fmtPnl(t.pnl) + " (" + (t.pnlPct >= 0 ? "+" : "") + t.pnlPct.toFixed(2) + "%)"}
                  </span>
                </div>
              ))}
              <div style={{ marginTop: 6, fontSize: 10, color: C.muted }}>
                {"Trades: "}
                <span style={{ color: C.text, fontFamily: "'JetBrains Mono',monospace" }}>
                  {bot.trades.length}
                </span>
                {"  Win rate: "}
                <span style={{ color: C.green, fontFamily: "'JetBrains Mono',monospace" }}>
                  {bot.trades.length
                    ? Math.round(bot.trades.filter(t => t.pnl > 0).length / bot.trades.length * 100) + "%"
                    : "--"}
                </span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ================================================================
   PARAM FIELD
================================================================ */
function ParamField({ label, value, onChange }) {
  return (
    <div>
      <div style={{ fontSize: 9, color: C.muted, marginBottom: 3 }}>{label}</div>
      <input
        type="number"
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{ width: "100%", background: C.surf3, border: "1px solid " + C.border, borderRadius: 5,
          padding: "5px 8px", color: C.bright, fontFamily: "'JetBrains Mono',monospace", fontSize: 10.5, outline: "none" }}
      />
    </div>
  );
}

/* ================================================================
   CREATE BOT MODAL
================================================================ */
const STRATEGIES = ["SMA Cross", "RSI", "MACD", "Bollinger", "Mean Rev."];
const STRIKE_OPTIONS = ["ATM", "ATM +2.5%", "ATM +5%", "ATM -2.5%", "ATM -5%"];

function strikeFromLabel(label, baseP) {
  if (label === "ATM") return baseP;
  const pct = parseFloat(label.replace("ATM", "").replace("%", "")) / 100;
  return baseP * (1 + pct);
}

function CreateBotModal({ onClose, onCreate, allItems }) {
  const [cfg, setCfg] = useState({
    name:       "Bot " + (Math.floor(Math.random() * 900) + 100),
    market:     "stocks",
    symbol:     "AAPL",
    strategy:   "SMA Cross",
    params:     { fast: 9, slow: 21, period: 14, oversold: 30, overbought: 70, std: 2, threshold: 1.5 },
    risk:       { sl: 2, tp: 4, size: 1000 },
    optType:    "call",
    optStrikeLabel: "ATM",
    optStrike:  null,
    optDays:    30,
  });

  const set  = (k, v) => setCfg(p => ({ ...p, [k]: v }));
  const setP = (k, v) => setCfg(p => ({ ...p, params: { ...p.params, [k]: v } }));
  const setR = (k, v) => setCfg(p => ({ ...p, risk: { ...p.risk, [k]: v } }));

  const symbols  = cfg.market === "stocks" ? STOCKS : cfg.market === "forex" ? FOREX : FUTURES;
  const curItem  = allItems.find(x => x.symbol === cfg.symbol);
  const baseP    = curItem ? curItem.price : 100;
  const effStrike = cfg.optStrike != null ? cfg.optStrike : baseP;
  const estPremium = bsPremium(baseP, effStrike, (cfg.optDays || 30) / 365, cfg.optType || "call");

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9998, background: "rgba(0,0,0,0.75)",
      display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 480, maxHeight: "90vh", overflowY: "auto",
        background: "#0e1220", border: "1px solid " + C.borderMid,
        borderRadius: 12, boxShadow: "0 24px 80px rgba(0,0,0,0.8)" }}>

        {/* Header */}
        <div style={{ padding: "16px 20px", borderBottom: "1px solid " + C.border,
          display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <BotSvg s={18} c={C.green} />
            <span style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 18, color: C.bright, letterSpacing: "0.08em" }}>
              CREATE TRADING BOT
            </span>
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", cursor: "pointer", color: C.muted }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Name */}
          <div>
            <label style={{ fontSize: 9, color: C.muted, letterSpacing: "0.1em", display: "block", marginBottom: 5 }}>
              BOT NAME
            </label>
            <input value={cfg.name} onChange={e => set("name", e.target.value)}
              style={{ width: "100%", background: C.surf3, border: "1px solid " + C.border, borderRadius: 6,
                padding: "7px 10px", color: C.bright, fontFamily: "'JetBrains Mono',monospace", fontSize: 11, outline: "none" }} />
          </div>

          {/* Market type */}
          <div>
            <label style={{ fontSize: 9, color: C.muted, letterSpacing: "0.1em", display: "block", marginBottom: 5 }}>
              MARKET TYPE
            </label>
            <div style={{ display: "flex", gap: 4 }}>
              {[["stocks", "Equities"], ["forex", "Forex"], ["options", "Options"]].map(([m, lbl]) => (
                <button key={m} onClick={() => {
                  const defaultSym = m === "stocks" ? "AAPL" : m === "forex" ? "EUR/USD" : "AAPL";
                  set("market", m);
                  set("symbol", defaultSym);
                }} style={{
                  flex: 1, padding: "7px 0", borderRadius: 6, border: "none", cursor: "pointer",
                  background: cfg.market === m ? C.greenDim : C.faint,
                  color:      cfg.market === m ? C.green    : C.muted,
                  fontSize: 10, fontWeight: 600,
                  outline: cfg.market === m ? "1px solid " + C.green + "40" : "none" }}>
                  {lbl}
                </button>
              ))}
            </div>
          </div>

          {/* Symbol */}
          <div>
            <label style={{ fontSize: 9, color: C.muted, letterSpacing: "0.1em", display: "block", marginBottom: 5 }}>
              {cfg.market === "options" ? "UNDERLYING SYMBOL" : "SYMBOL"}
            </label>
            <select value={cfg.symbol} onChange={e => set("symbol", e.target.value)}
              style={{ width: "100%", background: C.surf3, border: "1px solid " + C.border, borderRadius: 6,
                padding: "7px 10px", color: C.bright, fontFamily: "'JetBrains Mono',monospace", fontSize: 11, outline: "none" }}>
              {(cfg.market === "options" ? STOCKS : symbols).map(s => (
                <option key={s.symbol} value={s.symbol}>{s.symbol + " - " + s.name}</option>
              ))}
            </select>
          </div>

          {/* Strategy */}
          <div>
            <label style={{ fontSize: 9, color: C.muted, letterSpacing: "0.1em", display: "block", marginBottom: 5 }}>
              STRATEGY
            </label>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {STRATEGIES.map(s => (
                <button key={s} onClick={() => set("strategy", s)} style={{
                  padding: "5px 10px", borderRadius: 5, border: "none", cursor: "pointer",
                  background: cfg.strategy === s ? C.blueDim : C.faint,
                  color:      cfg.strategy === s ? C.blue    : C.muted,
                  fontSize: 9.5, fontWeight: 600,
                  outline: cfg.strategy === s ? "1px solid " + C.blue + "40" : "none" }}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Strategy params */}
          <div>
            <label style={{ fontSize: 9, color: C.muted, letterSpacing: "0.1em", display: "block", marginBottom: 8 }}>
              PARAMETERS
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {cfg.strategy === "SMA Cross" && <>
                <ParamField label="Fast Period"   value={cfg.params.fast}       onChange={v => setP("fast", +v)} />
                <ParamField label="Slow Period"   value={cfg.params.slow}       onChange={v => setP("slow", +v)} />
              </>}
              {cfg.strategy === "RSI" && <>
                <ParamField label="RSI Period"    value={cfg.params.period}     onChange={v => setP("period", +v)} />
                <ParamField label="Oversold"      value={cfg.params.oversold}   onChange={v => setP("oversold", +v)} />
                <ParamField label="Overbought"    value={cfg.params.overbought} onChange={v => setP("overbought", +v)} />
              </>}
              {cfg.strategy === "MACD" && <>
                <ParamField label="Fast EMA (12)" value={12}  onChange={() => {}} />
                <ParamField label="Slow EMA (26)" value={26}  onChange={() => {}} />
              </>}
              {cfg.strategy === "Bollinger" && <>
                <ParamField label="Period"        value={cfg.params.period} onChange={v => setP("period", +v)} />
                <ParamField label="Std Dev"       value={cfg.params.std}    onChange={v => setP("std",    +v)} />
              </>}
              {cfg.strategy === "Mean Rev." && <>
                <ParamField label="Period"        value={cfg.params.period}    onChange={v => setP("period",    +v)} />
                <ParamField label="Threshold %"   value={cfg.params.threshold} onChange={v => setP("threshold", +v)} />
              </>}
            </div>
          </div>

          {/* Options contract */}
          {cfg.market === "options" && (
            <div>
              <label style={{ fontSize: 9, color: C.muted, letterSpacing: "0.1em", display: "block", marginBottom: 8 }}>
                OPTIONS CONTRACT (simulated Black-Scholes)
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <div>
                  <div style={{ fontSize: 9, color: C.muted, marginBottom: 4 }}>Type</div>
                  <div style={{ display: "flex", gap: 4 }}>
                    {["call", "put"].map(t => (
                      <button key={t} onClick={() => set("optType", t)} style={{
                        flex: 1, padding: "6px 0", borderRadius: 5, border: "none", cursor: "pointer",
                        background: cfg.optType === t ? (t === "call" ? C.greenDim : C.redDim) : C.faint,
                        color:      cfg.optType === t ? (t === "call" ? C.green    : C.red   ) : C.muted,
                        fontSize: 10, fontWeight: 700, textTransform: "uppercase" }}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 9, color: C.muted, marginBottom: 4 }}>Strike</div>
                  <select
                    value={cfg.optStrikeLabel}
                    onChange={e => {
                      set("optStrikeLabel", e.target.value);
                      set("optStrike", strikeFromLabel(e.target.value, baseP));
                    }}
                    style={{ width: "100%", background: C.surf3, border: "1px solid " + C.border,
                      borderRadius: 6, padding: "6px 8px", color: C.bright, fontSize: 10, outline: "none" }}>
                    {STRIKE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <div style={{ fontSize: 9, color: C.muted, marginBottom: 4 }}>Days to Expiry</div>
                  <input type="number" value={cfg.optDays} onChange={e => set("optDays", +e.target.value)}
                    style={{ width: "100%", background: C.surf3, border: "1px solid " + C.border, borderRadius: 6,
                      padding: "6px 8px", color: C.bright, fontFamily: "'JetBrains Mono',monospace", fontSize: 10, outline: "none" }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                  <div style={{ fontSize: 9, color: C.muted }}>Est. Premium / share</div>
                  <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 13, fontWeight: 700, color: C.amber }}>
                    {"$" + estPremium.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Risk */}
          <div>
            <label style={{ fontSize: 9, color: C.muted, letterSpacing: "0.1em", display: "block", marginBottom: 8 }}>
              RISK MANAGEMENT
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
              <ParamField label="Stop Loss %"   value={cfg.risk.sl}   onChange={v => setR("sl",   +v)} />
              <ParamField label="Take Profit %" value={cfg.risk.tp}   onChange={v => setR("tp",   +v)} />
              <ParamField label="Position $"    value={cfg.risk.size} onChange={v => setR("size", +v)} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: "14px 20px", borderTop: "1px solid " + C.border,
          display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ padding: "8px 18px", borderRadius: 6,
            border: "1px solid " + C.border, background: "transparent", color: C.muted,
            fontSize: 11, cursor: "pointer" }}>
            Cancel
          </button>
          <button onClick={() => onCreate({
            ...cfg,
            id:           uid(),
            pnl:          0,
            status:       "stopped",
            trades:       [],
            signals:      [],
            priceHistory: [],
            position:     null,
          })} style={{ padding: "8px 20px", borderRadius: 6, border: "none", cursor: "pointer",
            background: "linear-gradient(135deg," + C.green + "," + C.blue + ")",
            color: "#000", fontSize: 11, fontWeight: 700,
            display: "flex", alignItems: "center", gap: 6 }}>
            <PlayIcon s={11} c="#000" /> Create Bot
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   MAIN APP
================================================================ */
export default function SageTrading() {
  /* ---------- market state (seeded from static prices; updated by live WS) ---------- */
  const [stocks,  setStocks]  = useState(() => initMkt(STOCKS));
  const [forex,   setForex]   = useState(() => initMkt(FOREX));
  const [futures, setFutures] = useState(() => initMkt(FUTURES));

  /* ---------- connection / account state ---------- */
  const [wsStatus,   setWsStatus]   = useState("connecting"); // "connecting"|"live"|"fallback"
  const [account,    setAccount]    = useState(null);
  const [candleLoad, setCandleLoad] = useState(false);
  const [loadKey,    setLoadKey]    = useState(0);
  const wsRef = useRef(null);
  const wsWentLive = useRef(false);

  /* ---------- chart state ---------- */
  const [selected,   setSelected]   = useState("AAPL");
  const [selType,    setSelType]     = useState("stocks");
  const [candles,    setCandles]     = useState([]);
  const [chartType,  setChartType]   = useState("candle");
  const [timeframe,  setTimeframe]   = useState("1H");
  const [zoom,       setZoom]        = useState(130);
  const [panOff,     setPanOff]      = useState(0);
  const [hover,      setHover]       = useState({ x: null, y: null });
  const [isDragging, setIsDragging]  = useState(false);
  const [fullscreen, setFullscreen]  = useState(false);

  /* ---------- drawing state ---------- */
  const [drawings,       setDrawings]       = useState([]);
  const [activeTool,     setActiveTool]     = useState("cursor");
  const [selectedDrawId, setSelectedDrawId] = useState(null);
  const [activeDrawing,  setActiveDrawing]  = useState(null);
  const [drawColor,      setDrawColor]      = useState("#0de8a2");
  const [drawWidth,      setDrawWidth]      = useState(1.5);
  const [drawDash,       setDrawDash]       = useState(false);
  const [showColorPick,  setShowColorPick]  = useState(false);
  const [textInput,      setTextInput]      = useState({ visible: false, x: 0, y: 0, value: "", coord: null });
  const drawClicksRef    = useRef(0);        // tracks # of anchor clicks for multi-point tools
  const dragDrawRef      = useRef({ active: false, drawId: null, startPx: null, startPy: null, origP1: null, origP2: null, origP3: null });

  /* ---------- ui state ---------- */
  const [navId,        setNavId]        = useState("chart");
  const [tblTab,       setTblTab]       = useState("stocks");
  const [now,          setNow]          = useState(new Date());
  const [renderKey,    setRenderKey]    = useState(0);
  const [searchQ,      setSearchQ]      = useState("");
  const [showSearch,   setShowSearch]   = useState(false);
  const [botFilter,    setBotFilter]    = useState("all");
  const [showBotModal, setShowBotModal] = useState(false);
  const [bots,         setBots]         = useState([]);

  /* ---------- refs ---------- */
  const chartRef   = useRef(null);
  const rafId      = useRef(null);
  const tickN      = useRef(0);
  const candlesRef = useRef([]);
  const zoomRef    = useRef(130);
  const panRef     = useRef(0);
  const dragInfo   = useRef({ active: false, startX: 0, startPan: 0 });

  /* Sync refs */
  useEffect(() => { candlesRef.current = candles; }, [candles]);
  useEffect(() => { zoomRef.current    = zoom;    }, [zoom]);
  useEffect(() => { panRef.current     = panOff;  }, [panOff]);

  /* drawing state refs (for use inside callbacks without stale closure issues) */
  const activeToolRef     = useRef("cursor");
  const drawingsRef       = useRef([]);
  const selectedDrawIdRef = useRef(null);
  const activeDrawingRef  = useRef(null);
  const drawColorRef      = useRef("#0de8a2");
  const drawWidthRef      = useRef(1.5);
  const drawDashRef       = useRef(false);
  useEffect(() => { activeToolRef.current     = activeTool;     }, [activeTool]);
  useEffect(() => { drawingsRef.current       = drawings;       }, [drawings]);
  useEffect(() => { selectedDrawIdRef.current = selectedDrawId; }, [selectedDrawId]);
  useEffect(() => { activeDrawingRef.current  = activeDrawing;  }, [activeDrawing]);
  useEffect(() => { drawColorRef.current      = drawColor;      }, [drawColor]);
  useEffect(() => { drawWidthRef.current      = drawWidth;      }, [drawWidth]);
  useEffect(() => { drawDashRef.current       = drawDash;       }, [drawDash]);

  /* latest market refs for bot ticking */
  const stocksRef  = useRef(stocks);
  const forexRef   = useRef(forex);
  const futuresRef = useRef(futures);
  useEffect(() => { stocksRef.current  = stocks;  }, [stocks]);
  useEffect(() => { forexRef.current   = forex;   }, [forex]);
  useEffect(() => { futuresRef.current = futures; }, [futures]);

  /* ---------- visible candles (zoom + pan) ---------- */
  const visibleCandles = useMemo(() => {
    const total = candles.length;
    if (!total) return [];
    const end   = Math.min(total, total - panOff);
    const start = Math.max(0, end - zoom);
    return candles.slice(start, end);
  }, [candles, zoom, panOff]);

  /* ================================================================
     CANDLE LOAD  -- fetches real OHLCV from backend, falls back to sim
  ================================================================ */
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setCandleLoad(true);
      const data = await MarketDataService.getCandles(selected, timeframe);
      if (!cancelled) {
        setCandles(data);
        setZoom(data.length);
        setPanOff(0);
        tickN.current = 0;
        setCandleLoad(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [selected, timeframe, loadKey]);

  /* ================================================================
     WEBSOCKET STREAM  -- live price ticks from backend
     Falls back to local simulation if backend is unreachable.
  ================================================================ */
  useEffect(() => {
    let ws = null;
    let pingInterval = null;
    let reconnectTimer = null;
    let dead = false;

    /* Helper: apply a price-update batch to a market array */
    function applyUpdates(arr, updates) {
      return arr.map(item => {
        const u = updates[item.symbol];
        if (!u) return item;
        const np  = u.price;
        const ch  = np - item.openP;
        const pct = item.openP ? (ch / item.openP) * 100 : 0;
        return {
          ...item,
          price:     np,
          change:    ch,
          changePct: pct,
          high:      Math.max(item.high, np),
          low:       Math.min(item.low,  np),
          history:   [...item.history.slice(1), np],
        };
      });
    }

    function connect() {
      if (dead) return;
      ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        setWsStatus("live");
        console.log("[WS] Connected to", WS_URL);
        // Subscribe to all symbols
        const allSyms = [
          ...STOCKS.map(s => s.symbol),
          ...FOREX.map(s => s.symbol),
          ...FUTURES.map(s => s.symbol),
        ];
        ws.send(JSON.stringify({ type: "subscribe", symbols: allSyms }));
        // Keepalive ping every 20s
        pingInterval = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type: "ping" }));
        }, 20000);
      };

      ws.onmessage = evt => {
        try {
          const msg = JSON.parse(evt.data);
          if (msg.type !== "prices") return;
          const updates = msg.data; // { AAPL: { price, change, changePct }, ... }

          setStocks(p  => applyUpdates(p, updates));
          setForex(p   => applyUpdates(p, updates));
          setFutures(p => applyUpdates(p, updates));

          /* Tick the live candle for the selected symbol */
          const u = updates[selected];
          if (u) {
            setCandles(prev => {
              if (!prev.length) return prev;
              tickN.current++;
              const last = { ...prev[prev.length - 1] };
              last.close  = u.price;
              last.high   = Math.max(last.high, u.price);
              last.low    = Math.min(last.low,  u.price);
              last.volume += Math.floor(Math.random() * 8000);
              // New candle every ~18 ticks
              if (tickN.current % 18 === 0) {
                const nc = { open: u.price, close: u.price, high: u.price, low: u.price, volume: 40000, time: Date.now() };
                return [...prev.slice(-129), last, nc];
              }
              return [...prev.slice(0, -1), last];
            });
          }
        } catch (e) {
          console.warn("[WS] Bad message:", e.message);
        }
      };

      ws.onerror = () => {
        console.warn("[WS] Connection error");
      };

      ws.onclose = () => {
        clearInterval(pingInterval);
        if (!dead) {
          setWsStatus("fallback");
          console.warn("[WS] Disconnected - reconnecting in 5s...");
          reconnectTimer = setTimeout(connect, 5000);
        }
      };
    }

    /* Try to connect; if backend is offline the close fires immediately */
    MarketDataService._checkBackend().then(alive => {
      if (alive) {
        connect();
      } else {
        setWsStatus("fallback");
        console.warn("[WS] Backend offline - using simulation fallback");
      }
    });

    return () => {
      dead = true;
      clearInterval(pingInterval);
      clearTimeout(reconnectTimer);
      if (ws) ws.close();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ================================================================
     SIMULATION FALLBACK  -- only runs when WS is not live
  ================================================================ */
  useEffect(() => {
    if (wsStatus === "live") return; // real data is driving updates
    const id = setInterval(() => {
      tickN.current++;
      setStocks(p  => tickMkt(p));
      setForex(p   => tickMkt(p));
      setFutures(p => tickMkt(p));
      setCandles(prev => {
        if (!prev.length) return prev;
        const last = { ...prev[prev.length - 1] };
        const np   = tickP(last.close, 0.00038);
        last.close  = np;
        last.high   = Math.max(last.high, np);
        last.low    = Math.min(last.low,  np);
        last.volume += Math.floor(Math.random() * 18000);
        if (tickN.current % 9 === 0) {
          const nc = { open: np, close: np, high: np, low: np, volume: 60000, time: Date.now() };
          return [...prev.slice(-129), last, nc];
        }
        return [...prev.slice(0, -1), last];
      });
    }, 800);
    return () => clearInterval(id);
  }, [wsStatus]);

  /* ================================================================
     BOT ENGINE  -- 1200 ms, uses latest market refs
  ================================================================ */
  useEffect(() => {
    const id = setInterval(() => {
      setBots(prev => prev.map(bot => {
        const all  = [...stocksRef.current, ...forexRef.current, ...futuresRef.current];
        const item = all.find(x => x.symbol === bot.symbol);
        if (!item) return bot;
        return processBot(bot, item.price);
      }));
    }, 1200);
    return () => clearInterval(id);
  }, []);

  /* ================================================================
     ACCOUNT FETCH  -- load Alpaca paper account on mount
  ================================================================ */
  useEffect(() => {
    MarketDataService.getAccount().then(acc => {
      if (acc) setAccount(acc);
    });
  }, []);

  /* When WS first goes live, reload candles so real API data replaces any
     simulated candles that were generated during the cold-start window.   */
  useEffect(() => {
    if (wsStatus === "live" && !wsWentLive.current) {
      wsWentLive.current = true;
      MarketDataService._backendCheckedAt = 0; // force fresh backend check
      setLoadKey(k => k + 1);
    }
  }, [wsStatus]);

  /* ---------- localStorage: save drawings whenever they change ---------- */
  useEffect(() => {
    if (!selected || !timeframe) return;
    const key = "sage-drawings-" + selected + "-" + timeframe;
    try { localStorage.setItem(key, JSON.stringify(drawings)); } catch {}
  }, [drawings, selected, timeframe]);

  /* ---------- localStorage: load drawings on symbol/timeframe change ---------- */
  useEffect(() => {
    if (!selected || !timeframe) return;
    const key = "sage-drawings-" + selected + "-" + timeframe;
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setDrawings(parsed);
        else setDrawings([]);
      } else {
        setDrawings([]);
      }
    } catch { setDrawings([]); }
    setSelectedDrawId(null);
    setActiveDrawing(null);
    drawClicksRef.current = 0;
  }, [selected, timeframe]);

  /* ---------- keyboard: Delete removes selected drawing ---------- */
  useEffect(() => {
    const handler = e => {
      if ((e.key === "Delete" || e.key === "Backspace") &&
          selectedDrawIdRef.current &&
          document.activeElement === document.body) {
        setDrawings(prev => prev.filter(d => d.id !== selectedDrawIdRef.current));
        setSelectedDrawId(null);
      }
      if (e.key === "Escape") {
        setActiveDrawing(null);
        drawClicksRef.current = 0;
        setActiveTool("cursor");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  /* ---------- clock ---------- */
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  /* ---------- resize observer ---------- */
  useEffect(() => {
    const canvas = chartRef.current;
    if (!canvas) return;
    const ro = new ResizeObserver(() => setRenderKey(k => k + 1));
    ro.observe(canvas);
    return () => ro.disconnect();
  }, []);

  /* ---------- scroll-wheel zoom (non-passive) ---------- */
  useEffect(() => {
    const canvas = chartRef.current;
    if (!canvas) return;
    const handler = e => {
      e.preventDefault();
      const out  = e.deltaY > 0;
      const step = Math.max(3, Math.floor(zoomRef.current * 0.1));
      setZoom(z => clamp(z + (out ? step : -step), 15, candlesRef.current.length));
    };
    canvas.addEventListener("wheel", handler, { passive: false });
    return () => canvas.removeEventListener("wheel", handler);
  }, []);

  /* ---------- draw chart ---------- */
  const botSignals = useMemo(() =>
    bots.filter(b => b.symbol === selected).flatMap(b => b.signals || []),
    [bots, selected]
  );

  const tfMs = (TF_CFG[timeframe] || TF_CFG["1H"]).ms;

  useEffect(() => {
    if (!chartRef.current || !visibleCandles.length) return;
    if (rafId.current) cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(() =>
      renderChart(chartRef.current, visibleCandles, chartType, hover.x, hover.y, tfMs, botSignals, drawings, activeDrawing, selectedDrawId)
    );
    return () => { if (rafId.current) cancelAnimationFrame(rafId.current); };
  }, [visibleCandles, chartType, hover, renderKey, botSignals, tfMs, drawings, activeDrawing, selectedDrawId]);

  /* ================================================================
     HIT TESTING  --  returns the first drawing near (px, py), or null
  ================================================================ */
  function hitTestDrawings(px, py, canvas, vcList, drawList) {
    if (!canvas || !vcList.length) return null;
    const N = vcList.length;
    const { PAD, PH, cW, cH, step } = chartGeom(canvas, N);
    const { pMax, pMin } = chartScale(vcList);
    const tx = i => PAD.l + (i + 0.5) * step;
    const ty = p => PAD.t + (1 - (p - pMin) / (pMax - pMin)) * cH;
    const xFromTime = t => {
      const idx = vcList.findIndex(c => c.time >= t);
      const i = idx < 0 ? N - 1 : idx;
      return tx(i);
    };
    // Iterate in reverse so last-drawn (top) is hit first
    for (let di = drawList.length - 1; di >= 0; di--) {
      const d = drawList[di];
      if (!d || !d.p1) continue;
      const x1 = xFromTime(d.p1.time);
      const y1 = ty(d.p1.price || 0);
      const x2 = d.p2 ? xFromTime(d.p2.time) : x1;
      const y2 = d.p2 ? ty(d.p2.price || 0) : y1;
      switch (d.type) {
        case "line":
          if (distToSeg(px, py, x1, y1, x2, y2) < 8) return d;
          break;
        case "ray": {
          const dx = x2 - x1 || 0.001, dy2 = y2 - y1;
          const t = (cW - x1) / dx;
          const ex = dx > 0 ? Math.min(x1 + dx * t, PAD.l + cW) : x1;
          const ey = dx > 0 ? y1 + dy2 * t : y1;
          if (distToSeg(px, py, x1, y1, ex, ey) < 8) return d;
          break;
        }
        case "xline": {
          const dx = x2 - x1 || 0.001, dy2 = y2 - y1;
          const tR = (PAD.l + cW - x1) / dx;
          const tL = (PAD.l - x1) / dx;
          const tMn = Math.min(tL, tR), tMx = Math.max(tL, tR);
          if (distToSeg(px, py, x1 + dx * tMn, y1 + dy2 * tMn, x1 + dx * tMx, y1 + dy2 * tMx) < 8) return d;
          break;
        }
        case "hline":
          if (Math.abs(py - ty(d.p1.price)) < 6) return d;
          break;
        case "vline":
          if (Math.abs(px - xFromTime(d.p1.time)) < 6) return d;
          break;
        case "rect":
        case "measure": {
          const rx = Math.min(x1, x2), ry = Math.min(y1, y2);
          const rw = Math.abs(x2 - x1), rh = Math.abs(y2 - y1);
          if (px >= rx && px <= rx + rw && py >= ry && py <= ry + rh) return d;
          break;
        }
        case "channel": {
          if (distToSeg(px, py, x1, y1, x2, y2) < 6) return d;
          if (d.p3) {
            const x3 = xFromTime(d.p3.time), y3 = ty(d.p3.price || 0);
            const dy3 = y3 - y1;
            if (distToSeg(px, py, x1, y1 + dy3, x2, y2 + dy3) < 6) return d;
          }
          break;
        }
        case "fib": {
          if (!d.p2) break;
          const fibLevels = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1, 1.618];
          for (const lvl of fibLevels) {
            const fp = d.p2.price + (d.p1.price - d.p2.price) * lvl;
            if (Math.abs(py - ty(fp)) < 6) return d;
          }
          break;
        }
        case "pitch": {
          if (distToSeg(px, py, x1, y1, x2, y2) < 6) return d;
          if (d.p3) {
            const x3 = xFromTime(d.p3.time), y3 = ty(d.p3.price || 0);
            const mx = (x2 + x3) / 2, my = (y2 + y3) / 2;
            if (distToSeg(px, py, x1, y1, mx, my) < 6) return d;
            if (distToSeg(px, py, x2, y2, x3, y3) < 6) return d;
          }
          break;
        }
        case "arrowup":
        case "arrowdn":
          if (Math.hypot(px - x1, py - y1) < 14) return d;
          break;
        case "text": {
          // approximate text bbox
          const tw = (d.label ? d.label.length * 7 : 20) + 12;
          if (px >= x1 && px <= x1 + tw && py >= y1 - 18 && py <= y1) return d;
          break;
        }
        default: break;
      }
    }
    return null;
  }

  /* ---------- mouse handlers ---------- */
  const onMouseDown = useCallback(e => {
    if (e.button !== 0) return;
    const canvas = chartRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const vc = candlesRef.current.slice(
      Math.max(0, candlesRef.current.length - panRef.current - zoomRef.current),
      candlesRef.current.length - panRef.current || undefined
    );
    // Re-compute visible candles inline (same slice as the memoized visibleCandles)
    const total = candlesRef.current.length;
    const end   = Math.min(total, total - panRef.current);
    const start = Math.max(0, end - zoomRef.current);
    const vcList = candlesRef.current.slice(start, end);

    const tool = activeToolRef.current;

    /* ---- ERASER: click to delete drawing ---- */
    if (tool === "eraser") {
      const hit = hitTestDrawings(px, py, canvas, vcList, drawingsRef.current);
      if (hit) {
        setDrawings(prev => prev.filter(d => d.id !== hit.id));
        if (selectedDrawIdRef.current === hit.id) setSelectedDrawId(null);
      }
      return;
    }

    /* ---- CURSOR: select / drag ---- */
    if (tool === "cursor") {
      const hit = hitTestDrawings(px, py, canvas, vcList, drawingsRef.current);
      if (hit) {
        setSelectedDrawId(hit.id);
        if (!hit.locked) {
          // Begin drag-move of selected drawing
          dragDrawRef.current = {
            active: true,
            drawId: hit.id,
            startPx: px, startPy: py,
            origP1: hit.p1 ? { ...hit.p1 } : null,
            origP2: hit.p2 ? { ...hit.p2 } : null,
            origP3: hit.p3 ? { ...hit.p3 } : null,
          };
        }
      } else {
        setSelectedDrawId(null);
        // Start pan
        dragInfo.current = { active: true, startX: e.clientX, startPan: panRef.current };
        setIsDragging(true);
      }
      return;
    }

    /* ---- DRAWING TOOLS ---- */
    if (!vcList.length) return;
    const coord = pxToCoord(px, py, canvas, vcList);
    const clickCount = drawClicksRef.current;

    /* Single-click tools: hline, vline, arrowup, arrowdn */
    if (tool === "hline" || tool === "vline" || tool === "arrowup" || tool === "arrowdn") {
      const newD = {
        id: uid(), type: tool,
        p1: coord, p2: null, p3: null,
        color: drawColorRef.current, width: drawWidthRef.current,
        dash: drawDashRef.current, locked: false, label: "",
      };
      setDrawings(prev => [...prev, newD]);
      setActiveDrawing(null);
      drawClicksRef.current = 0;
      return;
    }

    /* Text tool: show floating input */
    if (tool === "text") {
      setTextInput({ visible: true, x: px, y: py, value: "", coord });
      return;
    }

    /* Two-click tools: line, ray, xline, rect, fib, measure */
    const twoClickTools = ["line", "ray", "xline", "rect", "fib", "measure"];
    if (twoClickTools.includes(tool)) {
      if (clickCount === 0) {
        const newD = {
          id: uid(), type: tool,
          p1: coord, p2: coord, p3: null,
          color: drawColorRef.current, width: drawWidthRef.current,
          dash: drawDashRef.current, locked: false, label: "",
        };
        setActiveDrawing(newD);
        drawClicksRef.current = 1;
      } else {
        // Complete drawing
        setDrawings(prev => {
          const cur = activeDrawingRef.current;
          if (!cur) return prev;
          return [...prev, { ...cur, p2: coord }];
        });
        setActiveDrawing(null);
        drawClicksRef.current = 0;
      }
      return;
    }

    /* Three-click tools: channel, pitch */
    const threeClickTools = ["channel", "pitch"];
    if (threeClickTools.includes(tool)) {
      if (clickCount === 0) {
        const newD = {
          id: uid(), type: tool,
          p1: coord, p2: coord, p3: null,
          color: drawColorRef.current, width: drawWidthRef.current,
          dash: drawDashRef.current, locked: false, label: "",
        };
        setActiveDrawing(newD);
        drawClicksRef.current = 1;
      } else if (clickCount === 1) {
        setActiveDrawing(prev => prev ? { ...prev, p2: coord } : null);
        drawClicksRef.current = 2;
      } else {
        // Complete with p3
        setDrawings(prev => {
          const cur = activeDrawingRef.current;
          if (!cur) return prev;
          return [...prev, { ...cur, p3: coord }];
        });
        setActiveDrawing(null);
        drawClicksRef.current = 0;
      }
      return;
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const onMouseMove = useCallback(e => {
    const canvas = chartRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    /* ---- Drawing drag (move selected drawing) ---- */
    if (dragDrawRef.current.active) {
      const dd = dragDrawRef.current;
      const dpx = px - dd.startPx;
      const dpy = py - dd.startPy;
      const total = candlesRef.current.length;
      const end   = Math.min(total, total - panRef.current);
      const start = Math.max(0, end - zoomRef.current);
      const vcList = candlesRef.current.slice(start, end);
      if (!vcList.length) return;
      const { PAD, cW, cH } = chartGeom(canvas, vcList.length);
      const { pMax, pMin }  = chartScale(vcList);
      const pxPerPrice = cH / (pMax - pMin);
      const msPerPx    = vcList.length > 1
        ? (vcList[vcList.length - 1].time - vcList[0].time) / cW
        : 1;
      const dtMs   = dpx * msPerPx;
      const dPrice = -(dpy / pxPerPrice);
      function shiftCoord(orig) {
        if (!orig) return null;
        return { time: orig.time + dtMs, price: orig.price + dPrice };
      }
      setDrawings(prev => prev.map(d => {
        if (d.id !== dd.drawId) return d;
        return { ...d, p1: shiftCoord(dd.origP1), p2: shiftCoord(dd.origP2), p3: shiftCoord(dd.origP3) };
      }));
      return;
    }

    /* ---- Pan (cursor mode, no drawing selected) ---- */
    if (dragInfo.current.active) {
      const dx         = e.clientX - dragInfo.current.startX;
      const pxPerCandle = rect.width / zoomRef.current;
      const shift       = Math.round(-dx / pxPerCandle);
      const maxPan      = Math.max(0, candlesRef.current.length - zoomRef.current);
      setPanOff(clamp(dragInfo.current.startPan + shift, 0, maxPan));
      setHover({ x: null, y: null });
      return;
    }

    /* ---- Update active drawing preview ---- */
    if (activeDrawingRef.current && drawClicksRef.current > 0) {
      const total = candlesRef.current.length;
      const end   = Math.min(total, total - panRef.current);
      const start = Math.max(0, end - zoomRef.current);
      const vcList = candlesRef.current.slice(start, end);
      if (vcList.length) {
        const coord = pxToCoord(px, py, canvas, vcList);
        const clicks = drawClicksRef.current;
        if (clicks === 1) {
          setActiveDrawing(prev => prev ? { ...prev, p2: coord } : null);
        } else if (clicks === 2) {
          setActiveDrawing(prev => prev ? { ...prev, p3: coord } : null);
        }
      }
    }

    /* ---- Crosshair hover ---- */
    setHover({ x: px, y: py });
  }, []);

  const stopDrag = useCallback(() => {
    dragInfo.current.active = false;
    dragDrawRef.current.active = false;
    setIsDragging(false);
  }, []);

  const onMouseLeave = useCallback(() => {
    dragInfo.current.active = false;
    dragDrawRef.current.active = false;
    setIsDragging(false);
    setHover({ x: null, y: null });
  }, []);

  useEffect(() => {
    window.addEventListener("mouseup", stopDrag);
    return () => window.removeEventListener("mouseup", stopDrag);
  }, [stopDrag]);

  /* ---------- derived ---------- */
  const allItems   = [...stocks, ...forex, ...futures];
  const selItem    = allItems.find(x => x.symbol === selected) || stocks[0];
  const tblData    = tblTab === "stocks" ? stocks : tblTab === "forex" ? forex : futures;
  const getTypeOf  = sym => STOCKS.find(s => s.symbol === sym) ? "stocks" : FOREX.find(f => f.symbol === sym) ? "forex" : "futures";
  const selectSym  = (sym, type) => { setSelected(sym); setSelType(type); };
  const isFx       = isForexSym(selected);
  const filtBots   = botFilter === "all" ? bots : bots.filter(b => b.market === botFilter);

  const navItems = [
    { id: "chart",    icon: <BarChart2 size={18} />,       label: "Chart"    },
    { id: "watchlist",icon: <Star size={18} />,            label: "Watch"    },
    { id: "bot",      icon: <BotSvg s={18} c="currentColor" />, label: "Bot" },
    { id: "markets",  icon: <LayoutDashboard size={18} />, label: "Markets"  },
    { id: "screener", icon: <SlidersHorizontal size={18}/>,label: "Screener" },
  ];

  const quickSyms = [
    { sym: "AAPL",    type: "stocks"  }, { sym: "NVDA",    type: "stocks"  },
    { sym: "TSLA",    type: "stocks"  }, { sym: "SPY",     type: "stocks"  },
    { sym: "EUR/USD", type: "forex"   }, { sym: "GBP/USD", type: "forex"   },
    { sym: "ES",      type: "futures" }, { sym: "GC",      type: "futures" },
    { sym: "BTC",     type: "futures" }, { sym: "CL",      type: "futures" },
  ];

  const wlSyms  = ["AAPL", "NVDA", "TSLA", "EUR/USD", "ES", "GC", "BTC"];
  const wlItems = allItems.filter(x => wlSyms.includes(x.symbol));

  const summaryItems = [
    { label: "S&P 500",  item: futures.find(f => f.symbol === "ES"),      col: C.blue   },
    { label: "NASDAQ",   item: futures.find(f => f.symbol === "NQ"),      col: C.purple },
    { label: "GOLD",     item: futures.find(f => f.symbol === "GC"),      col: C.amber  },
    { label: "OIL WTI",  item: futures.find(f => f.symbol === "CL"),      col: C.cyan   },
    { label: "EUR/USD",  item: forex.find(f   => f.symbol === "EUR/USD"), col: C.green  },
    { label: "BTC CME",  item: futures.find(f => f.symbol === "BTC"),     col: C.red    },
  ];

  const isOpen = marketOpen();
  const botRunCount = bots.filter(b => b.status === "running").length;
  const totalPnl    = bots.reduce((a, b) => a + (b.pnl || 0), 0);
  const allTrades   = bots.flatMap(b => b.trades || []);
  const winRate     = allTrades.length
    ? Math.round(allTrades.filter(t => t.pnl > 0).length / allTrades.length * 100)
    : 0;

  /* Real search results -- debounced API call, falls back to local filter */
  const [searchResults, setSearchResults] = useState([]);
  useEffect(() => {
    if (!searchQ || searchQ.length < 1) { setSearchResults([]); return; }
    const timer = setTimeout(async () => {
      const apiResults = await MarketDataService.searchSymbols(searchQ);
      if (apiResults.length > 0) {
        setSearchResults(apiResults.slice(0, 8));
      } else {
        // Local fallback
        const q = searchQ.toLowerCase();
        setSearchResults(
          allItems.filter(x =>
            x.symbol.toLowerCase().includes(q) || x.name.toLowerCase().includes(q)
          ).slice(0, 8)
        );
      }
    }, 280);
    return () => clearTimeout(timer);
  }, [searchQ]);

  /* ================================================================
     RENDER
  ================================================================ */
  return (
    <div style={{ display: "flex", height: "100vh", width: "100%",
      background: C.bg, color: C.text, fontFamily: "'DM Sans',sans-serif", overflow: "hidden" }}>

      <style>{
        "@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&family=JetBrains+Mono:wght@400;500;600;700&display=swap');" +
        "*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}" +
        "::-webkit-scrollbar{width:3px;height:3px;}" +
        "::-webkit-scrollbar-track{background:transparent;}" +
        "::-webkit-scrollbar-thumb{background:#222840;border-radius:2px;}" +
        "@keyframes pulse-dot{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.85)}}" +
        "@keyframes spin{to{transform:rotate(360deg)}}" +
        "@keyframes ticker-run{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}" +
        "@keyframes fade-up{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}" +
        ".nb:hover{background:rgba(255,255,255,.045)!important;}" +
        ".qb:hover{background:rgba(255,255,255,.05)!important;border-color:#2a3450!important;}" +
        ".tr:hover td{background:rgba(255,255,255,.016)!important;}" +
        ".wl:hover{background:rgba(255,255,255,.028)!important;cursor:pointer;}" +
        ".tf:hover{background:rgba(255,255,255,.06)!important;}" +
        ".ct:hover{background:rgba(255,255,255,.05)!important;}" +
        ".si:hover{background:rgba(255,255,255,.03)!important;}" +
        "input,select{color-scheme:dark;}"
      }</style>

      {showBotModal && (
        <CreateBotModal
          onClose={() => setShowBotModal(false)}
          onCreate={bot => { setBots(p => [...p, bot]); setShowBotModal(false); }}
          allItems={allItems}
        />
      )}

      {/* ==== SIDEBAR ==== */}
      <div style={{ width: 56, flexShrink: 0, background: C.surf, borderRight: "1px solid " + C.border,
        display: "flex", flexDirection: "column", alignItems: "center",
        paddingTop: 12, paddingBottom: 12, gap: 2, zIndex: 20 }}>

        <div style={{ width: 34, height: 34, borderRadius: 9, marginBottom: 14,
          background: "linear-gradient(135deg," + C.green + "," + C.blue + ")",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 0 18px rgba(13,232,162,.25)" }}>
          <TrendingUp size={17} color="#060a10" strokeWidth={2.8} />
        </div>

        {navItems.map(n => (
          <button key={n.id} className="nb" onClick={() => setNavId(n.id)} title={n.label} style={{
            width: 40, height: 40, borderRadius: 8, border: "none", cursor: "pointer",
            background: navId === n.id ? C.greenDim : "transparent",
            color:      navId === n.id ? C.green    : C.muted,
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all .15s", position: "relative" }}>
            {n.icon}
            {n.id === "bot" && botRunCount > 0 && (
              <div style={{ position: "absolute", top: 6, right: 6, width: 6, height: 6,
                borderRadius: "50%", background: C.green,
                boxShadow: "0 0 5px " + C.green,
                animation: "pulse-dot 1.5s ease-in-out infinite" }} />
            )}
          </button>
        ))}

        <div style={{ flex: 1 }} />

        {[{ id: "alerts", icon: <Bell size={18} /> }, { id: "settings", icon: <Settings size={18} /> }].map(n => (
          <button key={n.id} className="nb" title={n.id} style={{
            width: 40, height: 40, borderRadius: 8, border: "none", cursor: "pointer",
            background: "transparent", color: C.muted,
            display: "flex", alignItems: "center", justifyContent: "center", transition: "all .15s" }}>
            {n.icon}
          </button>
        ))}
      </div>

      {/* ==== MAIN COLUMN ==== */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>

        {/* -- Top bar -- */}
        <div style={{ height: 48, flexShrink: 0, background: C.surf,
          borderBottom: "1px solid " + C.border,
          display: "flex", alignItems: "center", gap: 10, padding: "0 14px",
          position: "relative", zIndex: 10 }}>

          <span style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 22, letterSpacing: "0.12em",
            color: "#fff", userSelect: "none" }}>
            SAGE<span style={{ color: C.green }}>TRADING</span>
          </span>

          {/* Connection status badge */}
          <span style={{
            fontSize: 8, fontWeight: 700, letterSpacing: "0.1em",
            padding: "2px 7px", borderRadius: 3, display: "flex", alignItems: "center", gap: 4,
            background: wsStatus === "live" ? C.greenDim : C.amberDim,
            color:      wsStatus === "live" ? C.green    : C.amber,
            border: "1px solid " + (wsStatus === "live" ? C.green + "30" : C.amber + "30"),
          }}>
            <span style={{
              width: 5, height: 5, borderRadius: "50%",
              background: wsStatus === "live" ? C.green : wsStatus === "connecting" ? C.blue : C.amber,
              display: "inline-block",
              animation: wsStatus !== "fallback" ? "pulse-dot 1.5s ease-in-out infinite" : "none",
            }} />
            {wsStatus === "live" ? "LIVE" : wsStatus === "connecting" ? "CONNECTING" : "SIMULATED"}
          </span>

          <div style={{ width: 1, height: 22, background: C.border }} />

          {/* Search */}
          <div style={{ position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7,
              background: C.surf2,
              border: "1px solid " + (showSearch ? C.borderMid : C.border),
              borderRadius: 7, padding: "0 11px", height: 31, width: 210,
              cursor: "text", transition: "border-color .15s" }}>
              <Search size={12} color={C.muted} />
              <input
                value={searchQ}
                onChange={e => setSearchQ(e.target.value)}
                onFocus={() => setShowSearch(true)}
                onBlur={() => setTimeout(() => { setShowSearch(false); setSearchQ(""); }, 150)}
                placeholder="Symbol or name..."
                style={{ background: "transparent", border: "none", outline: "none",
                  color: C.text, fontFamily: "'JetBrains Mono',monospace", fontSize: 10.5, flex: 1 }}
              />
              <kbd style={{ fontSize: 9, color: C.muted, background: C.faint, padding: "1px 5px", borderRadius: 3 }}>
                /
              </kbd>
            </div>
            {showSearch && (
              <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, width: 280, zIndex: 999,
                background: "#0e1220", border: "1px solid " + C.borderMid, borderRadius: 8,
                boxShadow: "0 16px 48px rgba(0,0,0,.6)", animation: "fade-up .15s ease", overflow: "hidden" }}>
                {searchResults.length === 0 ? (
                  <div style={{ padding: "12px 16px", fontSize: 11, color: C.muted }}>
                    {searchQ.length === 0 ? "Start typing to search..." : "No results for \"" + searchQ + "\""}
                  </div>
                ) : searchResults.map(item => {
                  const pct = item.changePct ?? null;
                  const up  = (pct ?? 0) >= 0;
                  return (
                    <div key={item.symbol} className="si"
                      onMouseDown={() => { selectSym(item.symbol, getTypeOf(item.symbol)); setShowSearch(false); setSearchQ(""); }}
                      style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "8px 12px", cursor: "pointer", borderBottom: "1px solid " + C.border + "22" }}>
                      <div>
                        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, fontWeight: 700, color: C.bright }}>
                          {item.symbol}
                        </span>
                        <span style={{ fontSize: 10, color: C.muted, marginLeft: 8 }}>{(item.name || "").slice(0, 22)}</span>
                      </div>
                      {pct !== null && (
                        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: up ? C.green : C.red }}>
                          {up ? "+" : ""}{pct.toFixed(2) + "%"}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div style={{ flex: 1 }} />

          {/* Summary pills */}
          {summaryItems.slice(0, 4).map(({ label, item, col }) => {
            const up = (item ? item.changePct : 0) >= 0;
            return (
              <div key={label} className="si" style={{ display: "flex", flexDirection: "column",
                alignItems: "flex-end", padding: "0 8px", borderRadius: 5, cursor: "default",
                transition: "background .12s" }}>
                <span style={{ fontSize: 8, color: C.muted, letterSpacing: "0.08em" }}>{label}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: C.bright, fontWeight: 600 }}>
                    {fmtP(item ? item.price : 0)}
                  </span>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: up ? C.green : C.red }}>
                    {up ? "+" : ""}{(item ? item.changePct : 0).toFixed(2) + "%"}
                  </span>
                </div>
              </div>
            );
          })}

          <div style={{ width: 1, height: 22, background: C.border }} />

          <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "3px 10px",
            borderRadius: 5, border: "1px solid " + (isOpen ? C.green + "30" : "#e8821430"),
            background: isOpen ? C.greenGlow : "rgba(232,130,20,.05)" }}>
            <div style={{ width: 5, height: 5, borderRadius: "50%",
              background: isOpen ? C.green : "#e88214",
              animation: "pulse-dot 1.8s ease-in-out infinite" }} />
            <span style={{ fontSize: 9, fontFamily: "'JetBrains Mono',monospace", fontWeight: 700,
              letterSpacing: "0.08em", color: isOpen ? C.green : "#e88214" }}>
              {isOpen ? "NYSE OPEN" : "CLOSED"}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "3px 10px",
            borderRadius: 5, background: C.blueDim, border: "1px solid " + C.blue + "22" }}>
            <Clock size={10} color={C.blue} />
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: C.blue }}>
              {now.toUTCString().slice(17, 25) + " UTC"}
            </span>
          </div>
        </div>

        {/* -- Quick Access -- */}
        <div style={{ height: 37, flexShrink: 0, background: C.surf2,
          borderBottom: "1px solid " + C.border,
          display: "flex", alignItems: "center", gap: 3,
          padding: "0 12px", overflowX: "auto" }}>
          {quickSyms.map(({ sym, type }) => {
            const item  = allItems.find(x => x.symbol === sym);
            const up    = (item ? item.changePct : 0) >= 0;
            const isSel = selected === sym;
            return (
              <button key={sym} className="qb" onClick={() => selectSym(sym, type)} style={{
                display: "flex", alignItems: "center", gap: 5, flexShrink: 0,
                padding: "0 10px", height: 25, borderRadius: 5, cursor: "pointer",
                transition: "all .12s",
                background: isSel ? C.greenDim : "transparent",
                border: "1px solid " + (isSel ? C.green + "40" : C.border) }}>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10.5,
                  fontWeight: isSel ? 700 : 400, color: isSel ? C.green : C.text }}>
                  {sym}
                </span>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: up ? C.green : C.red }}>
                  {up ? "+" : ""}{(item ? item.changePct : 0).toFixed(2) + "%"}
                </span>
              </button>
            );
          })}
        </div>

        {/* -- Content row -- */}
        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

          {/* ==== DRAWING TOOLBAR ==== */}
          {!fullscreen && (
            <div style={{
              width: 36, flexShrink: 0,
              background: C.surf, borderRight: "1px solid " + C.border,
              display: "flex", flexDirection: "column", alignItems: "center",
              paddingTop: 6, paddingBottom: 6, gap: 1, zIndex: 15, position: "relative",
            }}>
              {/* Tool buttons */}
              {[
                { id: "cursor",  title: "Select / Move",
                  svg: <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M3 2L3 13L6.5 10L8.5 14.5L10 14L8 9.5L12.5 9.5Z" fill="currentColor"/></svg> },
                { id: "line",    title: "Trend Line",
                  svg: <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><line x1="2" y1="13" x2="14" y2="3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><circle cx="2" cy="13" r="1.8" fill="currentColor"/><circle cx="14" cy="3" r="1.8" fill="currentColor"/></svg> },
                { id: "ray",     title: "Ray",
                  svg: <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><line x1="2" y1="13" x2="15" y2="3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><circle cx="2" cy="13" r="1.8" fill="currentColor"/><path d="M12 3.5L15 3L14.5 6" stroke="currentColor" strokeWidth="1.2" fill="none"/></svg> },
                { id: "xline",   title: "Extended Line",
                  svg: <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><line x1="0" y1="13" x2="16" y2="3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg> },
                { id: "hline",   title: "Horizontal Line",
                  svg: <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><line x1="1" y1="8" x2="15" y2="8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><line x1="1" y1="5" x2="1" y2="11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><line x1="15" y1="5" x2="15" y2="11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg> },
                { id: "vline",   title: "Vertical Line",
                  svg: <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><line x1="8" y1="1" x2="8" y2="15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><line x1="5" y1="1" x2="11" y2="1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><line x1="5" y1="15" x2="11" y2="15" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg> },
                { id: "rect",    title: "Rectangle",
                  svg: <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><rect x="2" y="4" width="12" height="8" rx="1" stroke="currentColor" strokeWidth="1.7"/></svg> },
                { id: "channel", title: "Parallel Channel",
                  svg: <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><line x1="2" y1="12" x2="14" y2="6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/><line x1="2" y1="8" x2="14" y2="2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeDasharray="3 2"/></svg> },
                { id: "fib",     title: "Fibonacci Retracement",
                  svg: <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><line x1="2" y1="3" x2="14" y2="3" stroke={C.green} strokeWidth="1.3"/><line x1="2" y1="6" x2="14" y2="6" stroke={C.blue} strokeWidth="1.3"/><line x1="2" y1="8.5" x2="14" y2="8.5" stroke={C.amber} strokeWidth="1.3"/><line x1="2" y1="11" x2="14" y2="11" stroke={C.blue} strokeWidth="1.3"/><line x1="2" y1="13.5" x2="14" y2="13.5" stroke={C.red} strokeWidth="1.3"/></svg> },
                { id: "pitch",   title: "Andrews Pitchfork",
                  svg: <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M2 8 L8 4 L14 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none"/><path d="M2 8 L8 10 L14 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none" strokeDasharray="3 2"/><line x1="2" y1="8" x2="8" y2="7" stroke="currentColor" strokeWidth="1.4" strokeDasharray="3 2"/></svg> },
                { id: "arrowup", title: "Arrow Up (Buy marker)",
                  svg: <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><polygon points="8,2 13,12 3,12" fill={C.green} opacity="0.9"/></svg> },
                { id: "arrowdn", title: "Arrow Down (Sell marker)",
                  svg: <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><polygon points="8,14 13,4 3,4" fill={C.red} opacity="0.9"/></svg> },
                { id: "text",    title: "Text Note",
                  svg: <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><text x="2" y="13" style={{fontFamily:"sans-serif",fontSize:"13px",fill:"currentColor",fontWeight:700}}>T</text></svg> },
                { id: "measure", title: "Price Measure",
                  svg: <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><rect x="2" y="4" width="12" height="8" rx="1" stroke={C.amber} strokeWidth="1.5"/><line x1="8" y1="2" x2="8" y2="14" stroke={C.amber} strokeWidth="1" strokeDasharray="2 2"/></svg> },
                { id: "eraser",  title: "Eraser",
                  svg: <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M3 13L6 10L12 4L13 5L7 11L5 14Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" fill="none"/><line x1="3" y1="13" x2="13" y2="13" stroke="currentColor" strokeWidth="1.4"/></svg> },
              ].map(({ id, title, svg }) => (
                <button
                  key={id}
                  title={title}
                  onClick={() => {
                    setActiveTool(id);
                    if (id !== activeTool) {
                      setActiveDrawing(null);
                      drawClicksRef.current = 0;
                    }
                  }}
                  style={{
                    width: 28, height: 28, borderRadius: 6, border: "none", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background:  activeTool === id ? C.greenDim : "transparent",
                    color:       activeTool === id ? C.green    : C.muted,
                    outline:     activeTool === id ? "1px solid " + C.green + "50" : "none",
                    transition: "all .1s",
                  }}>
                  {svg}
                </button>
              ))}

              {/* Separator */}
              <div style={{ width: 22, height: 1, background: C.border, margin: "4px 0" }} />

              {/* Color swatch */}
              <div style={{ position: "relative" }}>
                <button
                  title="Line color"
                  onClick={() => setShowColorPick(v => !v)}
                  style={{
                    width: 22, height: 22, borderRadius: 4, border: "2px solid " + C.border,
                    background: drawColor, cursor: "pointer", flexShrink: 0,
                  }}
                />
                {showColorPick && (
                  <div style={{
                    position: "absolute", left: 30, top: 0, zIndex: 200,
                    background: C.surf3, border: "1px solid " + C.borderMid,
                    borderRadius: 8, padding: "8px", boxShadow: "0 8px 32px rgba(0,0,0,0.7)",
                    display: "flex", flexDirection: "column", gap: 6,
                  }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 4 }}>
                      {["#0de8a2","#4f9dff","#ff4f6d","#f5b942","#a07cf8","#22d4e8","#ffffff","#888ea8"].map(col => (
                        <button key={col} title={col}
                          onClick={() => { setDrawColor(col); setShowColorPick(false); }}
                          style={{
                            width: 20, height: 20, borderRadius: 4, border: drawColor === col ? "2px solid #fff" : "1px solid #333",
                            background: col, cursor: "pointer",
                          }} />
                      ))}
                    </div>
                    <input
                      type="text"
                      defaultValue={drawColor}
                      placeholder="#rrggbb"
                      onKeyDown={e => {
                        if (e.key === "Enter") {
                          const v = e.target.value.trim();
                          if (/^#[0-9a-fA-F]{6}$/.test(v)) { setDrawColor(v); setShowColorPick(false); }
                        }
                      }}
                      style={{
                        width: 88, background: C.surf2, border: "1px solid " + C.border,
                        borderRadius: 4, padding: "3px 6px",
                        color: C.text, fontFamily: "'JetBrains Mono',monospace", fontSize: 10, outline: "none",
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Line width buttons */}
              {[1, 1.5, 2.5].map((w, wi) => (
                <button
                  key={w}
                  title={"Width " + w + "px"}
                  onClick={() => setDrawWidth(w)}
                  style={{
                    width: 28, height: 20, borderRadius: 4, border: "none", cursor: "pointer",
                    background: drawWidth === w ? C.greenDim : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all .1s",
                  }}>
                  <div style={{ width: 16, height: w + 0.5, borderRadius: 1, background: drawWidth === w ? C.green : C.muted }} />
                </button>
              ))}

              {/* Dash toggle */}
              <button
                title={drawDash ? "Solid line" : "Dashed line"}
                onClick={() => setDrawDash(v => !v)}
                style={{
                  width: 28, height: 22, borderRadius: 4, border: "none", cursor: "pointer",
                  background: drawDash ? C.greenDim : "transparent",
                  color: drawDash ? C.green : C.muted,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all .1s",
                }}>
                <svg width="16" height="6" viewBox="0 0 16 6" fill="none">
                  {drawDash
                    ? <><line x1="1" y1="3" x2="5" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><line x1="8" y1="3" x2="12" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></>
                    : <line x1="1" y1="3" x2="15" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  }
                </svg>
              </button>

              <div style={{ flex: 1 }} />

              {/* Lock selected drawing */}
              {selectedDrawId && drawings.find(d => d.id === selectedDrawId) && (
                <button
                  title={drawings.find(d => d.id === selectedDrawId)?.locked ? "Unlock drawing" : "Lock drawing"}
                  onClick={() => setDrawings(prev => prev.map(d =>
                    d.id === selectedDrawId ? { ...d, locked: !d.locked } : d
                  ))}
                  style={{
                    width: 28, height: 28, borderRadius: 6, border: "none", cursor: "pointer",
                    background: drawings.find(d => d.id === selectedDrawId)?.locked ? C.amberDim : "transparent",
                    color: drawings.find(d => d.id === selectedDrawId)?.locked ? C.amber : C.muted,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                  {drawings.find(d => d.id === selectedDrawId)?.locked
                    ? <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><rect x="3" y="8" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.7"/><path d="M5 8V6a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.7"/></svg>
                    : <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><rect x="3" y="8" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.7"/><path d="M5 8V6a3 3 0 016 0" stroke="currentColor" strokeWidth="1.7" strokeDasharray="3 2"/></svg>
                  }
                </button>
              )}

              {/* Delete selected drawing */}
              {selectedDrawId && (
                <button
                  title="Delete selected drawing"
                  onClick={() => {
                    setDrawings(prev => prev.filter(d => d.id !== selectedDrawId));
                    setSelectedDrawId(null);
                  }}
                  style={{
                    width: 28, height: 28, borderRadius: 6, border: "none", cursor: "pointer",
                    background: C.redDim, color: C.red,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                    <path d="M3 5h10M6 5V3.5a1 1 0 011-1h2a1 1 0 011 1V5M6.5 8v4M9.5 8v4M4 5l.8 8.2a1 1 0 001 .8h4.4a1 1 0 001-.8L12 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              )}

              {/* Clear all drawings */}
              {drawings.length > 0 && (
                <button
                  title="Clear all drawings"
                  onClick={() => { setDrawings([]); setSelectedDrawId(null); }}
                  style={{
                    width: 28, height: 22, borderRadius: 5, border: "none", cursor: "pointer",
                    background: "transparent", color: C.muted, fontSize: 7,
                    fontFamily: "'JetBrains Mono',monospace",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    letterSpacing: "0.05em",
                  }}>
                  CLR
                </button>
              )}
            </div>
          )}

          {/* ==== CHART COLUMN ==== */}
          <div style={fullscreen ? {
            position: "fixed", inset: 0, zIndex: 9990, background: C.bg,
            display: "flex", flexDirection: "column",
          } : { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>

            {/* Price header */}
            <div style={{ flexShrink: 0, padding: "10px 16px 8px",
              borderBottom: "1px solid " + C.border, background: C.surf,
              display: "flex", alignItems: "center", gap: 16 }}>
              <div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 30,
                    fontWeight: 700, color: C.bright, lineHeight: 1 }}>
                    {fmtP(selItem ? selItem.price : 0)}
                  </span>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 13, fontWeight: 600,
                    color: (selItem ? selItem.changePct : 0) >= 0 ? C.green : C.red,
                    display: "flex", alignItems: "center", gap: 2 }}>
                    {(selItem ? selItem.changePct : 0) >= 0
                      ? <ArrowUpRight size={14} strokeWidth={2.5} />
                      : <ArrowDownRight size={14} strokeWidth={2.5} />}
                    {(selItem ? selItem.changePct : 0) >= 0 ? "+" : ""}
                    {(selItem ? selItem.changePct : 0).toFixed(2) + "%"}
                  </span>
                  <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono',monospace",
                    color: (selItem ? selItem.change : 0) >= 0 ? C.green : C.red }}>
                    {"(" + ((selItem ? selItem.change : 0) >= 0 ? "+" : "") +
                      fmtChg(selItem ? selItem.change : 0, selected) + ")"}
                  </span>
                </div>
                <div style={{ display: "flex", gap: 12, marginTop: 5 }}>
                  {[
                    ["H", fmtP(selItem ? selItem.high   : 0), C.green],
                    ["L", fmtP(selItem ? selItem.low    : 0), C.red  ],
                    ["O", fmtP(selItem ? selItem.openP  : 0), C.muted],
                    ["V", fmtV(selItem ? selItem.volume : 0), C.muted],
                  ].map(([l, v, col]) => (
                    <span key={l} style={{ display: "flex", gap: 4, fontSize: 10, fontFamily: "'JetBrains Mono',monospace" }}>
                      <span style={{ color: C.muted }}>{l}</span>
                      <span style={{ color: col }}>{v}</span>
                    </span>
                  ))}
                  {botRunCount > 0 && bots.some(b => b.symbol === selected && b.status === "running") && (
                    <span style={{ display: "flex", alignItems: "center", gap: 4,
                      background: C.greenDim, border: "1px solid " + C.green + "30",
                      borderRadius: 4, padding: "1px 7px", fontSize: 9, color: C.green, fontWeight: 700 }}>
                      <BotSvg s={10} c={C.green} /> BOT ACTIVE
                    </span>
                  )}
                </div>
              </div>
              <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
                <div>
                  <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 14, fontWeight: 700,
                    color: C.bright, textAlign: "right" }}>
                    {selected}
                  </div>
                  <div style={{ display: "flex", gap: 5, justifyContent: "flex-end", marginTop: 2 }}>
                    <span style={{ fontSize: 9, color: C.muted, background: C.surf3,
                      padding: "2px 7px", borderRadius: 4, border: "1px solid " + C.border }}>
                      {selType === "stocks" ? "EQUITY" : selType === "forex" ? "FX" : "FUTURES"}
                    </span>
                  </div>
                </div>
                <div style={{ width: 42, height: 42, borderRadius: 8,
                  background: (selItem ? selItem.changePct : 0) >= 0 ? C.greenDim : C.redDim,
                  border: "1px solid " + ((selItem ? selItem.changePct : 0) >= 0 ? C.green + "30" : C.red + "30"),
                  display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {(selItem ? selItem.changePct : 0) >= 0
                    ? <TrendingUp size={20} color={C.green} />
                    : <TrendingDown size={20} color={C.red} />}
                </div>
              </div>
            </div>

            {/* Chart toolbar */}
            <div style={{ height: 37, flexShrink: 0, background: C.surf2,
              borderBottom: "1px solid " + C.border,
              display: "flex", alignItems: "center", gap: 4, padding: "0 12px" }}>

              {["1m", "5m", "15m", "1H", "4H", "1D", "1W", "1M"].map(tf => (
                <button key={tf} className="tf" onClick={() => setTimeframe(tf)} style={{
                  padding: "2px 8px", borderRadius: 4, border: "none", cursor: "pointer",
                  transition: "all .1s",
                  background:  timeframe === tf ? C.green + "18" : "transparent",
                  color:       timeframe === tf ? C.green         : C.muted,
                  fontFamily: "'JetBrains Mono',monospace", fontSize: 9.5, fontWeight: 600,
                  borderBottom: timeframe === tf ? "2px solid " + C.green : "2px solid transparent" }}>
                  {tf}
                </button>
              ))}

              <div style={{ width: 1, height: 18, background: C.border, margin: "0 4px" }} />

              {[
                { id: "candle", icon: <CandleIcon s={14} /> },
                { id: "line",   icon: <LineIcon   s={14} /> },
                { id: "area",   icon: <AreaIcon   s={14} /> },
              ].map(ct => (
                <button key={ct.id} className="ct" onClick={() => setChartType(ct.id)} style={{
                  display: "flex", alignItems: "center", gap: 4,
                  padding: "3px 9px", borderRadius: 5, border: "none", cursor: "pointer",
                  transition: "all .1s",
                  background: chartType === ct.id ? C.blueDim : "transparent",
                  color:      chartType === ct.id ? C.blue    : C.muted,
                  outline:    chartType === ct.id ? "1px solid " + C.blue + "28" : "none" }}>
                  {ct.icon}
                </button>
              ))}

              <div style={{ width: 1, height: 18, background: C.border, margin: "0 4px" }} />

              <button className="ct" onClick={() => setZoom(z => Math.max(15, z - Math.max(3, Math.floor(z * 0.15))))}
                title="Zoom In" style={{ display: "flex", alignItems: "center", padding: "3px 7px",
                  borderRadius: 4, border: "none", cursor: "pointer",
                  background: "transparent", color: C.muted, transition: "all .1s" }}>
                <ZoomIn size={13} />
              </button>

              <button className="ct" onClick={() => setZoom(z => Math.min(candles.length, z + Math.max(3, Math.floor(z * 0.15))))}
                title="Zoom Out" style={{ display: "flex", alignItems: "center", padding: "3px 7px",
                  borderRadius: 4, border: "none", cursor: "pointer",
                  background: "transparent", color: C.muted, transition: "all .1s" }}>
                <ZoomOut size={13} />
              </button>

              <button className="ct" onClick={() => { setZoom(candles.length); setPanOff(0); }}
                title="Reset view" style={{ display: "flex", alignItems: "center", padding: "3px 7px",
                  borderRadius: 4, border: "none", cursor: "pointer",
                  background: "transparent", color: C.muted, fontSize: 13, transition: "all .1s" }}>
                reset
              </button>

              <div style={{ flex: 1 }} />

              <button style={{ display: "flex", alignItems: "center", gap: 4, padding: "3px 9px",
                borderRadius: 5, border: "1px solid " + C.border,
                background: "transparent", color: C.muted, fontSize: 9, cursor: "pointer" }}>
                <Layers size={11} /> Indicators
              </button>

              <button onClick={() => setFullscreen(f => !f)} style={{ background: "transparent", border: "none",
                cursor: "pointer", color: C.muted, display: "flex", alignItems: "center", marginLeft: 4 }}>
                {fullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
              </button>
            </div>

            {/* Canvas */}
            <div style={{ flex: 1, position: "relative", minHeight: 220, overflow: "hidden" }}>
              <canvas
                ref={chartRef}
                style={{ width: "100%", height: "100%", display: "block",
                  cursor: isDragging
                    ? "grabbing"
                    : activeTool === "cursor"
                      ? "default"
                      : activeTool === "eraser"
                        ? "cell"
                        : "crosshair"
                }}
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseLeave={onMouseLeave}
              />
              {/* Loading overlay */}
              {candleLoad && (
                <div style={{ position: "absolute", inset: 0, display: "flex",
                  alignItems: "center", justifyContent: "center",
                  background: "rgba(7,9,16,0.75)", zIndex: 5 }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%",
                      border: "2.5px solid " + C.border,
                      borderTopColor: C.green,
                      animation: "spin 0.8s linear infinite" }} />
                    <span style={{ fontFamily: "'JetBrains Mono',monospace",
                      fontSize: 10, color: C.muted }}>Loading {selected} {timeframe}...</span>
                  </div>
                </div>
              )}
              <div style={{ position: "absolute", bottom: 30, left: 12, fontSize: 9,
                fontFamily: "'JetBrains Mono',monospace", color: C.muted,
                background: C.surf2, padding: "2px 7px", borderRadius: 4,
                pointerEvents: "none", opacity: 0.7 }}>
                {visibleCandles.length + " bars  |  scroll to zoom  |  drag to pan"}
              </div>
              {/* Text note floating input */}
              {textInput.visible && (
                <div style={{
                  position: "absolute",
                  left: textInput.x, top: textInput.y - 28,
                  zIndex: 50,
                  display: "flex", gap: 4, alignItems: "center",
                }}>
                  <input
                    autoFocus
                    value={textInput.value}
                    onChange={e => setTextInput(prev => ({ ...prev, value: e.target.value }))}
                    onKeyDown={e => {
                      if (e.key === "Enter" && textInput.value.trim()) {
                        const newD = {
                          id: uid(), type: "text",
                          p1: textInput.coord, p2: null, p3: null,
                          color: drawColor, width: drawWidth,
                          dash: drawDash, locked: false,
                          label: textInput.value.trim(),
                        };
                        setDrawings(prev => [...prev, newD]);
                        setTextInput({ visible: false, x: 0, y: 0, value: "", coord: null });
                      }
                      if (e.key === "Escape") {
                        setTextInput({ visible: false, x: 0, y: 0, value: "", coord: null });
                      }
                    }}
                    onBlur={() => {
                      if (textInput.value.trim()) {
                        const newD = {
                          id: uid(), type: "text",
                          p1: textInput.coord, p2: null, p3: null,
                          color: drawColor, width: drawWidth,
                          dash: drawDash, locked: false,
                          label: textInput.value.trim(),
                        };
                        setDrawings(prev => [...prev, newD]);
                      }
                      setTextInput({ visible: false, x: 0, y: 0, value: "", coord: null });
                    }}
                    placeholder="Enter note..."
                    style={{
                      background: C.surf3, border: "1px solid " + C.green + "80",
                      borderRadius: 5, padding: "4px 8px",
                      color: drawColor, fontFamily: "'DM Sans',sans-serif", fontSize: 11,
                      outline: "none", minWidth: 120,
                    }}
                  />
                  <button
                    onMouseDown={e => { e.preventDefault();
                      if (textInput.value.trim()) {
                        const newD = {
                          id: uid(), type: "text",
                          p1: textInput.coord, p2: null, p3: null,
                          color: drawColor, width: drawWidth,
                          dash: drawDash, locked: false,
                          label: textInput.value.trim(),
                        };
                        setDrawings(prev => [...prev, newD]);
                      }
                      setTextInput({ visible: false, x: 0, y: 0, value: "", coord: null });
                    }}
                    style={{
                      background: C.greenDim, border: "1px solid " + C.green + "50",
                      color: C.green, borderRadius: 4, padding: "2px 7px",
                      fontSize: 10, cursor: "pointer", fontWeight: 700,
                    }}>OK</button>
                </div>
              )}
            </div>

            {/* Market table (hidden in fullscreen) */}
            {!fullscreen && (
              <div style={{ height: 214, flexShrink: 0, borderTop: "1px solid " + C.border,
                display: "flex", flexDirection: "column", background: C.surf }}>

                <div style={{ height: 33, flexShrink: 0, display: "flex", alignItems: "center",
                  gap: 1, padding: "0 12px", borderBottom: "1px solid " + C.border }}>
                  {[
                    { id: "stocks",  l: "Equities", i: <TrendingUp size={11} /> },
                    { id: "forex",   l: "Forex",    i: <Globe size={11} />      },
                    { id: "futures", l: "Futures",  i: <Zap size={11} />       },
                  ].map(t => (
                    <button key={t.id} onClick={() => setTblTab(t.id)} style={{
                      display: "flex", alignItems: "center", gap: 5,
                      padding: "3px 10px", borderRadius: 4, border: "none",
                      cursor: "pointer", transition: "all .1s",
                      fontSize: 10, fontWeight: 600,
                      background: tblTab === t.id ? C.surf3       : "transparent",
                      color:      tblTab === t.id ? C.bright      : C.muted,
                      borderBottom: tblTab === t.id ? "2px solid " + C.blue : "2px solid transparent" }}>
                      {t.i} {t.l}
                    </button>
                  ))}
                  <div style={{ flex: 1 }} />
                  <span style={{ fontSize: 9, color: C.muted, display: "flex", alignItems: "center", gap: 4 }}>
                    <Wifi size={10} color={C.green} style={{ animation: "pulse-dot 2s ease-in-out infinite" }} />
                    LIVE SIM
                  </span>
                </div>

                <div style={{ flex: 1, overflowY: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ position: "sticky", top: 0, background: C.surf, zIndex: 1 }}>
                        {["SYMBOL", "LAST", "CHG", "CHG %", "HIGH", "LOW", "VOL", "TREND"].map((h, i) => (
                          <th key={h} style={{ padding: "5px 10px", fontSize: 8,
                            fontFamily: "'JetBrains Mono',monospace",
                            letterSpacing: "0.1em", color: C.muted,
                            textAlign: i === 0 ? "left" : "right",
                            borderBottom: "1px solid " + C.border,
                            fontWeight: 600, whiteSpace: "nowrap" }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {tblData.map(item => {
                        const up  = item.changePct >= 0;
                        const sel = item.symbol === selected;
                        const fx  = isForexSym(item.symbol);
                        return (
                          <tr key={item.symbol} className="tr"
                            onClick={() => selectSym(item.symbol, tblTab)}
                            style={{ cursor: "pointer",
                              borderBottom: "1px solid " + C.border + "18",
                              background:  sel ? C.green + "05" : "transparent",
                              borderLeft:  sel ? "2px solid " + C.green : "2px solid transparent" }}>
                            <td style={{ padding: "6px 10px" }}>
                              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11,
                                fontWeight: 700, color: sel ? C.green : C.bright }}>
                                {item.symbol}
                              </span>
                              <div style={{ fontSize: 8.5, color: C.muted, marginTop: 1 }}>
                                {item.name.slice(0, 18)}
                              </div>
                            </td>
                            <td style={{ padding: "6px 10px", textAlign: "right",
                              fontFamily: "'JetBrains Mono',monospace",
                              fontSize: 10.5, color: C.bright, fontWeight: 600 }}>
                              {fmtPx(item.price, fx)}
                            </td>
                            <td style={{ padding: "6px 10px", textAlign: "right",
                              fontFamily: "'JetBrains Mono',monospace",
                              fontSize: 10, color: up ? C.green : C.red }}>
                              {(up ? "+" : "") + fmtChg(item.change, item.symbol)}
                            </td>
                            <td style={{ padding: "6px 10px", textAlign: "right" }}>
                              <span style={{ fontFamily: "'JetBrains Mono',monospace",
                                fontSize: 10, fontWeight: 600,
                                padding: "2px 6px", borderRadius: 3,
                                background: up ? C.greenDim : C.redDim,
                                color:      up ? C.green    : C.red }}>
                                {(up ? "+" : "") + item.changePct.toFixed(2) + "%"}
                              </span>
                            </td>
                            <td style={{ padding: "6px 10px", textAlign: "right",
                              fontFamily: "'JetBrains Mono',monospace",
                              fontSize: 10, color: C.green }}>
                              {fmtPx(item.high, fx)}
                            </td>
                            <td style={{ padding: "6px 10px", textAlign: "right",
                              fontFamily: "'JetBrains Mono',monospace",
                              fontSize: 10, color: C.red }}>
                              {fmtPx(item.low, fx)}
                            </td>
                            <td style={{ padding: "6px 10px", textAlign: "right",
                              fontFamily: "'JetBrains Mono',monospace",
                              fontSize: 10, color: C.muted }}>
                              {fmtV(item.volume)}
                            </td>
                            <td style={{ padding: "6px 10px", textAlign: "right" }}>
                              <Spark data={item.history} positive={up} w={58} h={20} />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>{/* end chart column */}

          {/* ==== RIGHT PANEL ==== */}
          {!fullscreen && (
            <div style={{ width: 258, flexShrink: 0, background: C.surf,
              borderLeft: "1px solid " + C.border,
              display: "flex", flexDirection: "column", overflow: "hidden" }}>

              {/* -- BOT PANEL -- */}
              {navId === "bot" ? (
                <>
                  <div style={{ height: 38, flexShrink: 0, display: "flex", alignItems: "center",
                    padding: "0 13px", borderBottom: "1px solid " + C.border, gap: 6 }}>
                    <BotSvg s={14} c={C.green} />
                    <span style={{ fontSize: 11, fontWeight: 600, color: C.bright }}>Trading Bots</span>
                    {botRunCount > 0 && (
                      <span style={{ fontSize: 9, background: C.greenDim, color: C.green,
                        padding: "1px 6px", borderRadius: 10 }}>
                        {botRunCount + " running"}
                      </span>
                    )}
                    <div style={{ flex: 1 }} />
                    <button onClick={() => setShowBotModal(true)} style={{
                      display: "flex", alignItems: "center", gap: 4, padding: "4px 10px",
                      borderRadius: 5, border: "1px solid " + C.green + "40",
                      background: C.greenDim, color: C.green,
                      fontSize: 9, fontWeight: 700, cursor: "pointer" }}>
                      <Plus size={11} /> New Bot
                    </button>
                  </div>

                  {/* Filter tabs */}
                  <div style={{ display: "flex", gap: 2, padding: "6px 13px",
                    borderBottom: "1px solid " + C.border, flexShrink: 0 }}>
                    {["all", "stocks", "forex", "options"].map(f => (
                      <button key={f} onClick={() => setBotFilter(f)} style={{
                        padding: "2px 8px", borderRadius: 4, border: "none", cursor: "pointer",
                        background: botFilter === f ? C.surf3       : "transparent",
                        color:      botFilter === f ? C.bright      : C.muted,
                        fontSize: 9, fontWeight: 600, transition: "all .1s",
                        textTransform: "capitalize" }}>
                        {f}
                      </button>
                    ))}
                  </div>

                  <div style={{ flex: 1, overflowY: "auto" }}>
                    {filtBots.length === 0 ? (
                      <div style={{ padding: 24, textAlign: "center" }}>
                        <BotSvg s={32} c={C.muted} />
                        <div style={{ marginTop: 10, fontSize: 11, color: C.muted, lineHeight: 1.6 }}>
                          {bots.length === 0
                            ? "No bots yet."
                            : "No bots for this filter."}
                          <br />
                          <span style={{ color: C.green, cursor: "pointer" }}
                            onClick={() => setShowBotModal(true)}>
                            Create your first bot ->
                          </span>
                        </div>
                      </div>
                    ) : filtBots.map(bot => (
                      <BotCard
                        key={bot.id}
                        bot={bot}
                        onUpdate={updated => setBots(p => p.map(b => b.id === updated.id ? updated : b))}
                      />
                    ))}
                  </div>

                  {/* Account card */}
                  {account && (
                    <div style={{ flexShrink: 0, margin: "0 13px 8px",
                      background: C.surf3, borderRadius: 7,
                      border: "1px solid " + C.border, padding: "9px 11px" }}>
                      <div style={{ fontSize: 8, color: C.muted, letterSpacing: "0.1em", marginBottom: 6 }}>
                        ALPACA PAPER ACCOUNT
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        {[
                          ["Portfolio", "$" + (account.portfolioValue || 0).toLocaleString("en-US", { maximumFractionDigits: 2 }), C.bright],
                          ["Cash",      "$" + (account.cash          || 0).toLocaleString("en-US", { maximumFractionDigits: 2 }), C.green],
                          ["Buying Pwr","$" + (account.buyingPower   || 0).toLocaleString("en-US", { maximumFractionDigits: 0 }), C.blue],
                        ].map(([l, v, col]) => (
                          <div key={l} style={{ textAlign: "center" }}>
                            <div style={{ fontSize: 7.5, color: C.muted, marginBottom: 2 }}>{l}</div>
                            <div style={{ fontFamily: "'JetBrains Mono',monospace",
                              fontSize: 9.5, fontWeight: 700, color: col }}>{v}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Bot stats footer */}
                  {bots.length > 0 && (
                    <div style={{ flexShrink: 0, padding: "10px 13px",
                      borderTop: "1px solid " + C.border,
                      display: "flex", justifyContent: "space-between" }}>
                      {[
                        ["Total PnL", fmtPnl(totalPnl), totalPnl >= 0 ? C.green : C.red],
                        ["Trades",    allTrades.length.toString(), C.text],
                        ["Win Rate",  allTrades.length ? winRate + "%" : "-", C.green],
                      ].map(([l, v, col]) => (
                        <div key={l} style={{ textAlign: "center" }}>
                          <div style={{ fontSize: 8, color: C.muted, marginBottom: 2 }}>{l}</div>
                          <div style={{ fontFamily: "'JetBrains Mono',monospace",
                            fontSize: 11, fontWeight: 700, color: col }}>{v}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </>

              /* -- WATCHLIST -- */
              ) : (
                <>
                  <div style={{ height: 38, flexShrink: 0, display: "flex", alignItems: "center",
                    padding: "0 13px", borderBottom: "1px solid " + C.border, gap: 6 }}>
                    <Star size={13} color={C.amber} />
                    <span style={{ fontSize: 11, fontWeight: 600, color: C.text, marginLeft: 4 }}>Watchlist</span>
                    <div style={{ flex: 1 }} />
                    <Plus size={14} color={C.muted} style={{ cursor: "pointer" }} />
                  </div>

                  <div style={{ flex: 1, overflowY: "auto" }}>
                    {wlItems.map(item => {
                      const up  = item.changePct >= 0;
                      const sel = item.symbol === selected;
                      const fx  = isForexSym(item.symbol);
                      return (
                        <div key={item.symbol} className="wl"
                          onClick={() => selectSym(item.symbol, getTypeOf(item.symbol))}
                          style={{ padding: "10px 13px",
                            borderBottom: "1px solid " + C.border + "18",
                            transition: "all .12s",
                            background:  sel ? C.green + "06" : "transparent",
                            borderLeft:  sel ? "2px solid " + C.green : "2px solid transparent" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                            <div>
                              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12,
                                fontWeight: 700, color: sel ? C.green : C.bright }}>
                                {item.symbol}
                              </div>
                              <div style={{ fontSize: 9, color: C.muted, marginTop: 1 }}>
                                {item.name.slice(0, 16)}
                              </div>
                            </div>
                            <div style={{ textAlign: "right" }}>
                              <div style={{ fontFamily: "'JetBrains Mono',monospace",
                                fontSize: 12.5, fontWeight: 600, color: C.bright }}>
                                {fmtPx(item.price, fx)}
                              </div>
                              <div style={{ display: "flex", alignItems: "center",
                                justifyContent: "flex-end", gap: 2,
                                fontFamily: "'JetBrains Mono',monospace",
                                fontSize: 9.5, fontWeight: 600, color: up ? C.green : C.red }}>
                                {up ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                                {(up ? "+" : "") + item.changePct.toFixed(2) + "%"}
                              </div>
                            </div>
                          </div>
                          <Spark data={item.history} positive={up} w={228} h={28} />
                        </div>
                      );
                    })}

                    <div style={{ height: 1, background: C.border, margin: "6px 0" }} />

                    <div style={{ padding: "10px 13px" }}>
                      <div style={{ fontSize: 9, fontWeight: 700, color: C.muted,
                        letterSpacing: "0.1em", marginBottom: 10 }}>
                        MARKET OVERVIEW
                      </div>
                      {summaryItems.map(({ label, item, col }) => {
                        const up = (item ? item.changePct : 0) >= 0;
                        return (
                          <div key={label} style={{ display: "flex", justifyContent: "space-between",
                            alignItems: "center", marginBottom: 9 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                              <div style={{ width: 3, height: 14, borderRadius: 1.5,
                                background: col, flexShrink: 0 }} />
                              <span style={{ fontSize: 10, color: C.muted }}>{label}</span>
                            </div>
                            <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
                              <span style={{ fontFamily: "'JetBrains Mono',monospace",
                                fontSize: 10.5, color: C.bright, fontWeight: 600 }}>
                                {fmtP(item ? item.price : 0)}
                              </span>
                              <span style={{ fontFamily: "'JetBrains Mono',monospace",
                                fontSize: 9, color: up ? C.green : C.red }}>
                                {(up ? "+" : "") + (item ? item.changePct : 0).toFixed(2) + "%"}
                              </span>
                            </div>
                          </div>
                        );
                      })}

                      <div style={{ marginTop: 12 }}>
                        <div style={{ fontSize: 9, fontWeight: 700, color: C.muted,
                          letterSpacing: "0.1em", marginBottom: 7 }}>
                          FEAR & GREED INDEX
                        </div>
                        <div style={{ position: "relative", height: 5,
                          background: C.surf3, borderRadius: 3, overflow: "hidden" }}>
                          <div style={{ position: "absolute", left: 0, top: 0,
                            width: "62%", height: "100%", borderRadius: 3,
                            background: "linear-gradient(90deg," + C.red + "," + C.amber + "," + C.green + ")" }} />
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                          <span style={{ fontSize: 8, color: C.red }}>Fear</span>
                          <span style={{ fontSize: 10, color: C.amber,
                            fontFamily: "'JetBrains Mono',monospace", fontWeight: 700 }}>
                            62  Greed
                          </span>
                          <span style={{ fontSize: 8, color: C.green }}>Extreme</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

        </div>{/* end content row */}
      </div>{/* end main column */}

      {/* ==== TICKER TAPE ==== */}
      <div style={{ position: "fixed", bottom: 0, left: 56, right: 0, height: 25,
        background: "#050710", borderTop: "1px solid " + C.border,
        overflow: "hidden", display: "flex", alignItems: "center", zIndex: 50 }}>
        <div style={{ display: "flex", animation: "ticker-run 110s linear infinite", whiteSpace: "nowrap" }}>
          {[...allItems, ...allItems].map((item, i) => {
            const up = item.changePct >= 0;
            const fx = isForexSym(item.symbol);
            return (
              <span key={i} style={{ padding: "0 16px", fontSize: 9.5,
                fontFamily: "'JetBrains Mono',monospace", color: C.muted }}>
                <span style={{ color: C.bright, fontWeight: 600, marginRight: 5 }}>{item.symbol}</span>
                <span style={{ marginRight: 4 }}>{fmtPx(item.price, fx)}</span>
                <span style={{ color: up ? C.green : C.red }}>
                  {up ? "\u25b2" : "\u25bc"} {Math.abs(item.changePct).toFixed(2) + "%"}
                </span>
                <span style={{ color: C.faint, marginLeft: 14 }}>|</span>
              </span>
            );
          })}
        </div>
      </div>
      <div style={{ position: "fixed", bottom: 0, left: 0, width: 56, height: 25,
        background: "#050710", borderTop: "1px solid " + C.border, zIndex: 51 }} />
    </div>
  );
}
