// pages/index.js

import Head from 'next/head';
import dynamic from 'next/dynamic';

// Dynamically import TexCognition component without SSR (WebGL-safe)
const TexCognition = dynamic(
  () => import('../src/components/TexCognition'),
  { ssr: false }
);

export default function HomePage() {
  return (
    <>
      <Head>
        <title>Tex — Synthetic Cognition</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="A living synthetic intelligence that breathes, mutates, and reasons." />
      </Head>

      <main
        style={{
          width: '100vw',
          height: '100vh',
          margin: 0,
          padding: 0,
          background: '#000',
          color: '#cfdcff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden'
        }}
      >
        <TexCognition />
      </main>
    </>
  );
}
