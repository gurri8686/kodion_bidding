/**
 * GET /api/health
 * Health check endpoint - tests database connectivity
 */

import { NextResponse } from 'next/server';
import { testConnection } from '@/lib/db/connection';

export async function GET() {
  try {
    const dbHealthy = await testConnection();

    if (dbHealthy) {
      return NextResponse.json({
        status: 'healthy',
        database: 'connected',
        timestamp: new Date().toISOString(),
      });
    } else {
      return NextResponse.json(
        {
          status: 'unhealthy',
          database: 'disconnected',
          timestamp: new Date().toISOString(),
        },
        { status: 503 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'error',
        database: 'error',
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
