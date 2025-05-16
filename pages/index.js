// pages/index.js

import Head from 'next/head';
import dynamic from 'next/dynamic';

const TexCognition = dynamic(() => import('../src/components/TexCognition'), { ssr: false });

export default function Home() {
  return (
    <>
      <Head>
        <title>Tex — Synthetic Cognition</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main style={{
        background: '#000',
        color: '#cfdcff',
        width: '100%',
        height: '100vh',
        margin: 0,
        padding: 0,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <TexCognition />
      </main>
    </>
  );
}
