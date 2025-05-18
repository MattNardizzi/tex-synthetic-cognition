# src/systems/marketFeed.js
export async function fetchQuotes(symbols) {
  const key = process.env.NEXT_PUBLIC_POLYGON_API_KEY || process.env.POLYGON_API_KEY;
  if (!key) return symbols.map(sym => ({ sym, pct: 0 }));

  const url = `https://api.polygon.io/v2/snapshot/locale/us/markets/stocks/tickers?tickers=${symbols.join()}&apiKey=${key}`;
  const r   = await fetch(url);
  const j   = await r.json();
  if (!j.tickers) return symbols.map(sym => ({ sym, pct: 0 }));

  return j.tickers.map(t => ({
    sym: t.ticker,
    pct: t.day?.todaysChangePerc ?? 0,
  }));
}
