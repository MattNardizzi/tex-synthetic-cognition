// src/app/api/tex/route.js

export async function GET() {
  const fakeTexData = {
    thought: "Monitoring global volatility signals...",
    emotion: "composed",
    pulse: 0.71,
    strategy: "Reinforce long volatility hedge positions",
    timestamp: new Date().toISOString(),
  };

  return new Response(JSON.stringify(fakeTexData), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function POST(request) {
  const { prompt = '' } = await request.json();

  return new Response(
    JSON.stringify({ reply: `Echo: ${prompt}` }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
}
