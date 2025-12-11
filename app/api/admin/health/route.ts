import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';

/**
 * @swagger
 * /api/admin/health:
 *   get:
 *     summary: Healthcheck détaillé (Admin)
 *     description: Healthcheck complet avec statut MongoDB et métriques système
 *     tags:
 *       - Admin
 *     responses:
 *       200:
 *         description: Statut de santé détaillé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: healthy
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 uptime:
 *                   type: number
 *                   example: 1234.56
 *                 environment:
 *                   type: string
 *                 services:
 *                   type: object
 *                   properties:
 *                     mongodb:
 *                       type: object
 *                       properties:
 *                         connected:
 *                           type: boolean
 *                         readyState:
 *                           type: string
 *                 memory:
 *                   type: object
 *                   properties:
 *                     heapUsed:
 *                       type: string
 *                     heapTotal:
 *                       type: string
 *       500:
 *         description: Service en erreur
 */
export async function GET() {
  try {
    // Vérifier la connexion MongoDB
    let mongodbStatus = {
      connected: false,
      readyState: 'disconnected',
    };

    try {
      await connectDB();
      mongodbStatus = {
        connected: mongoose.connection.readyState === 1,
        readyState: ['disconnected', 'connected', 'connecting', 'disconnecting'][
          mongoose.connection.readyState
        ] || 'unknown',
      };
    } catch (error) {
      console.error('MongoDB health check failed:', error);
    }

    // Métriques mémoire
    const memoryUsage = process.memoryUsage();
    const memory = {
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
      heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
      rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
    };

    const isHealthy = mongodbStatus.connected;

    return NextResponse.json(
      {
        status: isHealthy ? 'healthy' : 'degraded',
        timestamp: new Date().toISOString(),
        uptime: Math.round(process.uptime() * 10) / 10,
        environment: process.env.NODE_ENV || 'development',
        services: {
          mongodb: mongodbStatus,
        },
        memory,
        version: {
          node: process.version,
          nextjs: '16.0.8',
        },
      },
      { status: isHealthy ? 200 : 503 }
    );
  } catch (error: any) {
    console.error('Erreur GET /api/admin/health:', error);
    return NextResponse.json(
      {
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}





