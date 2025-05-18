// src/app/api/tex/route.js
export async function POST(request) {
  const { prompt = '' } = await request.json();

  return new Response(
    JSON.stringify({ reply: `Echo: ${prompt}` }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
}

export function GET() {
  return new Response('Method Not Allowed', { status: 405 });
}
