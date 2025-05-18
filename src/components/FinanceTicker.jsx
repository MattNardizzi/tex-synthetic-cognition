/*
  FinanceTicker.jsx — live scrolling mini-ticker (Polygon.io)
  ────────────────────────────────────────────────────────────
  DEPENDENCIES:  npm i swr   (lightweight React fetch cache)
  .env.local must contain  POLYGON_API_KEY=pk_xxx

  USAGE in StrategyCoreShell.jsx (bottom of div):
    <FinanceTicker />
*/

import React from "react";
import useSWR from "swr";
import { fetchQuotes } from "../systems/marketFeed";

const SYMBOLS = ["AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "SPY", "BTCUSD", "ETHUSD"];

export default function FinanceTicker() {
  /* call SWR every 30 s */
  const { data = [] } = useSWR("quotes", () => fetchQuotes(SYMBOLS), {
    refreshInterval: 30000,
  });

  /* simple marquee animation via css keyframes */
  return (
    <div className="absolute bottom-0 left-0 w-full overflow-hidden whitespace-nowrap bg-black/30 py-1 text-sm font-mono text-[#6ed6ff] pointer-events-none" style={{ backdropFilter: "blur(4px)" }}>
      <div className="animate-marquee inline-block">
        {data.map(({ sym, pct }, i) => (
          <span key={i} className="mx-6">
            {sym} {pct > 0 ? "+" : ""}
            {pct.toFixed(2)}%
          </span>
        ))}
      </div>
      {/* duplicate for seamless loop */}
      <div className="animate-marquee inline-block" aria-hidden="true">
        {data.map(({ sym, pct }, i) => (
          <span key={i} className="mx-6">
            {sym} {pct > 0 ? "+" : ""}
            {pct.toFixed(2)}%
          </span>
        ))}
      </div>
      <style jsx>{`
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
