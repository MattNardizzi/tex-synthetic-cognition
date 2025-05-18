// FinanceTicker.jsx  — simple live quote row (Polygon.io v2 “last trade”)
// npm i swr
import useSWR from 'swr';
import React from 'react';

const symbols = ['SPY', 'QQQ', 'AAPL', 'MSFT', 'X:BTCUSD'];
const fetcher = url => fetch(url).then(r => r.json());

function useQuotes() {
  const key = process.env.NEXT_PUBLIC_POLYGON_API_KEY;
  const { data, error } = useSWR(
    key ? symbols.map(s => 
      `https://api.polygon.io/v2/last/trade/${s}?apiKey=${key}`
    ) : null,
    (...urls) => Promise.all(urls.map(fetcher)),
    { refreshInterval: 10_000 }
  );

  if (error) return { quotes: null, err: 'network' };
  if (!data)  return { quotes: null };
  
  const quotes = data.map((d, idx) => ({
    sym: symbols[idx].replace('X:', ''),   // strip X: for BTC
    px : d.last?.price || d.results?.p || 0,    // handle both JSON shapes
  }));
  return { quotes };
}

export default function FinanceTicker() {
  const { quotes, err } = useQuotes();
  const [previous, setPrevious] = React.useState({});

  React.useEffect(() => { 
    if (quotes) setPrevious(p => {
      const copy = {...p};
      quotes.forEach(q => copy[q.sym] = q.px);
      return copy;
    });
  }, [quotes]);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2
                    flex gap-6 px-5 py-2 rounded-xl bg-black/50
                    backdrop-blur-md text-sm font-mono text-gray-100"
         style={{transition:'opacity 0.4s ease'}}>
      {!quotes && <span>Loading quotes…</span>}
      {err && <span className="text-red-400">Polygon error</span>}
      {quotes && quotes.map(q => {
        const prev = previous[q.sym] || q.px;
        const up   = q.px >= prev;
        return (
          <span key={q.sym}
                className={`flex items-center gap-1 
                            ${up ? 'text-green-300' : 'text-red-400'}`}>
            {q.sym}: {q.px.toFixed(q.sym==='BTCUSD'?0:2)}
            <span>{up ? '▲' : '▼'}</span>
          </span>
        );
      })}
    </div>
  );
}
