// src/app/api/tex/route.js

export async function POST(request) {
  const { prompt = '' } = await request.json();

  try {
    const res = await fetch('http://localhost:5001/think', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });

    const data = await res.json();

    return new Response(JSON.stringify({ reply: data.response }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('🛑 Error contacting Tex brain:', error);
    return new Response(JSON.stringify({ reply: '⚠️ Tex is currently offline.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
