import { NextResponse } from 'next/server';

/**
 * Healthcheck endpoint pour Railway et autres plateformes
 * Ne dépend PAS de MongoDB pour être rapide
 */
export async function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
    },
    { status: 200 }
  );
}

