import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { AuditLog } from '@/models';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '200', 10), 500);

    const logs = await AuditLog.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      count: logs.length,
      data: logs,
    });
  } catch (error: any) {
    console.error('Erreur GET /api/history:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la récupération des logs',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

