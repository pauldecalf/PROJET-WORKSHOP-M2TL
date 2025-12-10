import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Device } from '@/models';

/**
 * @swagger
 * /api/devices/by-serial/{serialNumber}:
 *   get:
 *     summary: Récupérer un device par son Serial Number
 *     description: Retourne les details d'un device en utilisant son Serial Number
 *     tags:
 *       - Devices
 *     parameters:
 *       - in: path
 *         name: serialNumber
 *         required: true
 *         schema:
 *           type: string
 *         description: Serial Number du device
 *         example: "ESP32-001"
 *     responses:
 *       200:
 *         description: Device trouvé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Device'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ serialNumber: string }> }
) {
  try {
    await connectDB();

    const { serialNumber } = await params;

    const device = await Device.findOne({ serialNumber })
      .populate('roomId')
      .populate('badgeId')
      .lean();

    if (!device) {
      return NextResponse.json(
        {
          success: false,
          error: 'Device non trouvé',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: device,
    });
  } catch (error: any) {
    const { serialNumber } = await params;
    console.error(`Erreur GET /api/devices/by-serial/${serialNumber}:`, error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la récupération du device',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

