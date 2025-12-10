import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Device, DeviceConfig } from '@/models';

/**
 * @swagger
 * /api/devices/{uid}/config:
 *   get:
 *     summary: Récupérer la configuration d'un device (par UID)
 *     description: Utilisé par les devices IoT pour récupérer leur config au démarrage (utilise serialNumber)
 *     tags:
 *       - Devices
 *     parameters:
 *       - in: path
 *         name: uid
 *         required: true
 *         schema:
 *           type: string
 *         description: Serial Number du device (UID)
 *         example: "ESP32-ABC123"
 *     responses:
 *       200:
 *         description: Configuration récupérée
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 device:
 *                   type: object
 *                 config:
 *                   $ref: '#/components/schemas/DeviceConfig'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ uid: string }> }
) {
  try {
    await connectDB();

    const { uid } = await params;

    // Trouver le device par son serialNumber
    const device = await Device.findOne({ serialNumber: uid }).lean();

    if (!device) {
      return NextResponse.json(
        {
          success: false,
          error: 'Device non trouvé',
        },
        { status: 404 }
      );
    }

    // Récupérer la config
    const config = await DeviceConfig.findOne({ deviceId: device._id })
      .sort({ updatedAt: -1 })
      .lean();

    if (!config) {
      return NextResponse.json({
        success: true,
        device: {
          id: device._id,
          serialNumber: device.serialNumber,
          name: device.name,
        },
        config: null,
        message: 'Aucune configuration définie (utiliser les valeurs par défaut)',
      });
    }

    return NextResponse.json({
      success: true,
      device: {
        id: device._id,
        serialNumber: device.serialNumber,
        name: device.name,
      },
      config,
    });
  } catch (error: any) {
    const { uid } = await params;
    console.error(`Erreur GET /api/devices/${uid}/config:`, error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la récupération de la config',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

