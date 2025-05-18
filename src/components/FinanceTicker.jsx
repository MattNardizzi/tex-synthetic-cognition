// FinanceTicker.jsx — ultra-light Polygon.io stream (SWR polling)
import useSWR from "swr";

const POLYGON_KEY = process.env.NEXT_PUBLIC_POLYGON_API_KEY;
const SYMBOLS     = ["SPY","QQQ","AAPL","NVDA","TSLA"];

const fetcher = url => fetch(url).then(r => r.json());

function fmt(n){
  return n?.toLocaleString("en-US",{ minimumFractionDigits:2, maximumFractionDigits:2 });
}

export default function FinanceTicker(){
  const { data } = useSWR(
    () =>
      POLYGON_KEY &&
      `/api/quotes?syms=${SYMBOLS.join(",")}`,
    fetcher,
    { refreshInterval: 5000 }   // 5-sec poll
  );

  if(!data) return null;

  return (
    <div className="rounded-lg backdrop-blur-sm bg-black/40 px-4 py-2 text-xs font-mono flex gap-4">
      {data.map(q => (
        <span key={q.sym} className={q.change>=0 ? "text-green-400" : "text-red-400"}>
          {q.sym} {fmt(q.price)} {q.change>=0 ? "▲" : "▼"}{fmt(Math.abs(q.change))} (
          {fmt(q.perc)}%)
        </span>
      ))}
    </div>
  );
}
