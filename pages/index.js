// pages/index.js

import Head from 'next/head';
import dynamic from 'next/dynamic';

// Dynamically import the Strategy Core Shell with no SSR (for WebGL safety)
const StrategyCoreShell = dynamic(
  () => import('../src/components/StrategyCoreShell'),
  { ssr: false }
);

export default function HomePage() {
  return (
    <>
      <Head>
        <title>Tex — Strategy Core Shell</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Tex is a strategic synthetic intelligence. Alive, evolving, and embedded with a synthetic need system." />
      </Head>

      <main
        style={{
          width: '100vw',
          height: '100vh',
          margin: 0,
          padding: 0,
          background: '#000',
          overflow: 'hidden',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <StrategyCoreShell />
      </main>
    </>
  );
}
