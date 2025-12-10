import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Healthcheck basique
 *     description: Healthcheck rapide pour Railway et monitoring (ne nécessite pas MongoDB)
 *     tags:
 *       - Admin
 *     responses:
 *       200:
 *         description: Application en bonne santé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 uptime:
 *                   type: number
 *                   example: 123.45
 *                 environment:
 *                   type: string
 *                   example: production
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


