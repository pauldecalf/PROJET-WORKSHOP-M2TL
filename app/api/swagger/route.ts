import { NextResponse } from 'next/server';
import { swaggerSpec } from '@/lib/swagger';

/**
 * @swagger
 * /api/swagger:
 *   get:
 *     summary: Récupérer le spec OpenAPI
 *     description: Retourne la spécification OpenAPI 3.0 au format JSON
 *     responses:
 *       200:
 *         description: Spécification OpenAPI
 */
export async function GET() {
  return NextResponse.json(swaggerSpec);
}

