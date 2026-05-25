"""
sage_fallback.py
FastAPI fallback server -- mirrors the Node.js API surface.
Run with:  uvicorn sage_fallback:app --port 4001 --reload

Use this when Node.js is down or you prefer Python.
Wire frontend to http://localhost:4001 instead of :4000.
"""

import os
import asyncio
import httpx
from datetime import datetime
from typing import Optional, List

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

#  Config 
ALPACA_KEY     = os.getenv("ALPACA_API_KEY", "")
ALPACA_SECRET  = os.getenv("ALPACA_SECRET_KEY", "")
ALPACA_DATA    = os.getenv("ALPACA_DATA_URL",  "https://data.alpaca.markets")
ALPACA_TRADE   = os.getenv("ALPACA_TRADE_URL", "https://paper-api.alpaca.markets")
TWELVE_KEY     = os.getenv("TWELVE_DATA_API_KEY", "")
TWELVE_URL     = os.getenv("TWELVE_DATA_URL",  "https://api.twelvedata.com")
FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "http://localhost:3000")

ALPACA_HEADERS = {
    "APCA-API-KEY-ID":     ALPACA_KEY,
    "APCA-API-SECRET-KEY": ALPACA_SECRET,
}

TF_ALPACA = {
    "1m": "1Min", "5m": "5Min", "15m": "15Min",
    "1H": "1Hour", "4H": "4Hour",
    "1D": "1Day",  "1W": "1Week", "1M": "1Month",
}
TF_TWELVE = {
    "1m": "1min", "5m": "5min", "15m": "15min", "1H": "1h",
    "4H": "4h",   "1D": "1day", "1W": "1week",  "1M": "1month",
}
BAR_LIMIT = {
    "1m": 120, "5m": 130, "15m": 130, "1H": 130,
    "4H": 120, "1D": 120, "1W": 100,  "1M": 80,
}

FUTURES_SYMBOLS = {"ES","NQ","YM","RTY","GC","SI","CL","NG","ZN","ZB","BTC","ETH"}

#  Helpers 
import re

def is_forex(symbol: str) -> bool:
    return bool(re.match(r"^[A-Z]{3}/[A-Z]{3}$", symbol))

def is_futures(symbol: str) -> bool:
    return symbol.upper() in FUTURES_SYMBOLS

def normalize_bar_alpaca(b: dict) -> dict:
    return {
        "open":   b["o"], "high":  b["h"],
        "low":    b["l"], "close": b["c"],
        "volume": b.get("v", 0),
        "time":   int(datetime.fromisoformat(b["t"].replace("Z","+00:00")).timestamp() * 1000),
    }

def normalize_bar_twelve(v: dict) -> dict:
    return {
        "open":   float(v["open"]),  "high":  float(v["high"]),
        "low":    float(v["low"]),   "close": float(v["close"]),
        "volume": int(v.get("volume") or 0),
        "time":   int(datetime.fromisoformat(v["datetime"]).timestamp() * 1000),
    }

#  FastAPI app 
app = FastAPI(title="Sage Trading Fallback API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_ORIGIN],
    allow_methods=["*"],
    allow_headers=["*"],
)

#  Health 
@app.get("/api/health")
async def health():
    return {
        "status": "ok",
        "server": "FastAPI fallback",
        "timestamp": datetime.utcnow().isoformat(),
        "env": {
            "alpaca":     bool(ALPACA_KEY and not ALPACA_KEY.startswith("YOUR_")),
            "twelveData": bool(TWELVE_KEY and not TWELVE_KEY.startswith("YOUR_")),
        }
    }

#  Candles 
@app.get("/api/candles/{symbol}")
async def get_candles(symbol: str, tf: str = "1H"):
    symbol = symbol.upper()
    valid_tfs = list(TF_ALPACA.keys())
    if tf not in valid_tfs:
        raise HTTPException(400, f"Invalid tf. Use one of: {', '.join(valid_tfs)}")

    limit = BAR_LIMIT.get(tf, 130)

    async with httpx.AsyncClient(timeout=12.0) as client:
        # Forex & Futures -> TwelveData
        if is_forex(symbol) or is_futures(symbol):
            td_sym = (symbol + "=F") if is_futures(symbol) else symbol
            try:
                r = await client.get(f"{TWELVE_URL}/time_series", params={
                    "symbol": td_sym, "interval": TF_TWELVE.get(tf, "1h"),
                    "outputsize": limit, "apikey": TWELVE_KEY, "order": "ASC",
                })
                d = r.json()
                if "values" not in d:
                    raise HTTPException(502, d.get("message", "No data from TwelveData"))
                bars = [normalize_bar_twelve(v) for v in d["values"]]
                return {"symbol": symbol, "timeframe": tf, "bars": bars}
            except httpx.RequestError as e:
                raise HTTPException(502, str(e))

        # Stocks -> Alpaca with TwelveData fallback
        try:
            r = await client.get(
                f"{ALPACA_DATA}/v2/stocks/{symbol}/bars",
                headers=ALPACA_HEADERS,
                params={"timeframe": TF_ALPACA.get(tf, "1Hour"), "limit": limit, "feed": "iex"},
            )
            d = r.json()
            bars = [normalize_bar_alpaca(b) for b in (d.get("bars") or [])]
            if not bars:
                raise ValueError("Empty")
            return {"symbol": symbol, "timeframe": tf, "bars": bars}
        except Exception:
            # TwelveData fallback
            r = await client.get(f"{TWELVE_URL}/time_series", params={
                "symbol": symbol, "interval": TF_TWELVE.get(tf, "1h"),
                "outputsize": limit, "apikey": TWELVE_KEY, "order": "ASC",
            })
            d = r.json()
            if "values" not in d:
                raise HTTPException(502, d.get("message", "No bar data found"))
            bars = [normalize_bar_twelve(v) for v in d["values"]]
            return {"symbol": symbol, "timeframe": tf, "bars": bars}

#  Quote 
@app.get("/api/quote/{symbol}")
async def get_quote(symbol: str):
    symbol = symbol.upper()
    async with httpx.AsyncClient(timeout=8.0) as client:
        if is_forex(symbol) or is_futures(symbol):
            td_sym = (symbol + "=F") if is_futures(symbol) else symbol
            r = await client.get(f"{TWELVE_URL}/quote", params={"symbol": td_sym, "apikey": TWELVE_KEY})
            d = r.json()
            if d.get("code") and d["code"] != 200:
                raise HTTPException(502, d.get("message", "TwelveData error"))
            return {
                "symbol":    symbol,
                "price":     float(d.get("close", 0)),
                "open":      float(d.get("open", 0)),
                "high":      float(d.get("high", 0)),
                "low":       float(d.get("low", 0)),
                "volume":    int(d.get("volume") or 0),
                "prevClose": float(d.get("previous_close", 0)),
                "change":    float(d.get("change", 0)),
                "changePct": float(d.get("percent_change", 0)),
            }

        # Stocks via Alpaca snapshot
        try:
            r = await client.get(
                f"{ALPACA_DATA}/v2/stocks/snapshots",
                headers=ALPACA_HEADERS,
                params={"symbols": symbol, "feed": "iex"},
            )
            snap = r.json().get(symbol, {})
            lt   = snap.get("latestTrade", {})
            dBar = snap.get("dailyBar", {})
            pBar = snap.get("prevDailyBar", {})
            price = lt.get("p") or dBar.get("c") or 0
            prev  = pBar.get("c") or price
            return {
                "symbol":    symbol,
                "price":     price,
                "open":      dBar.get("o", 0),
                "high":      dBar.get("h", 0),
                "low":       dBar.get("l", 0),
                "volume":    dBar.get("v", 0),
                "prevClose": prev,
                "change":    price - prev,
                "changePct": ((price - prev) / prev * 100) if prev else 0,
            }
        except Exception:
            raise HTTPException(502, f"Could not fetch quote for {symbol}")

#  Search 
@app.get("/api/search")
async def search(q: str = Query(..., min_length=1)):
    async with httpx.AsyncClient(timeout=8.0) as client:
        r = await client.get(f"{TWELVE_URL}/symbol_search", params={"symbol": q, "apikey": TWELVE_KEY})
        d = r.json()
        results = []
        for item in (d.get("data") or [])[:10]:
            results.append({
                "symbol":   item["symbol"],
                "name":     item["instrument_name"],
                "type":     item["instrument_type"],
                "exchange": item.get("exchange", ""),
            })
        return results

#  Account (Alpaca paper) 
@app.get("/api/account")
async def get_account():
    async with httpx.AsyncClient(timeout=8.0) as client:
        r = await client.get(f"{ALPACA_TRADE}/v2/account", headers=ALPACA_HEADERS)
        d = r.json()
        if r.status_code != 200:
            raise HTTPException(r.status_code, d.get("message", "Alpaca error"))
        return {
            "buyingPower":    float(d["buying_power"]),
            "cash":           float(d["cash"]),
            "portfolioValue": float(d["portfolio_value"]),
            "equity":         float(d["equity"]),
            "currency":       d["currency"],
            "status":         d["status"],
        }
