import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Device, RoomStatus } from '@/models';

/**
 * @swagger
 * /api/admin/nfc/scan:
 *   post:
 *     summary: Scanner un device par numéro de série (admin)
 *     description: Permet à un admin de récupérer les infos d'un device par son numéro de série
 *     tags:
 *       - Admin
 *       - NFC
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - serialNumber
 *             properties:
 *               serialNumber:
 *                 type: string
 *                 description: Numéro de série du device
 *                 example: "ESP32-001"
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
 *                 device:
 *                   type: object
 *                   nullable: true
 *                   description: Device correspondant au numéro de série
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         description: Device non trouvé
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    // Validation
    if (!body.serialNumber) {
      return NextResponse.json(
        {
          success: false,
          error: 'serialNumber est requis',
        },
        { status: 400 }
      );
    }

    const device = await Device.findOne({ serialNumber: body.serialNumber }).populate('roomId');

    if (!device) {
      return NextResponse.json(
        {
          success: false,
          error: 'Device non trouvé',
        },
        { status: 404 }
      );
    }

    // Mettre le statut du device en IN_PROGRESS (processus de scan/config)
    device.status = 'IN_PROGRESS' as any;
    await device.save();

    return NextResponse.json({
      success: true,
      device: {
        _id: device._id,
        serialNumber: device.serialNumber,
        name: device.name,
        roomId: device.roomId,
        status: device.status,
        configStatus: device.configStatus,
        batteryLevel: device.batteryLevel,
        lastSeenAt: device.lastSeenAt,
      },
    });
  } catch (error: any) {
    console.error('Erreur POST /api/admin/nfc/scan:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors du scan du badge',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

