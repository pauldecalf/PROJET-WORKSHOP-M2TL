import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { NFCBadge, Device } from '@/models';

/**
 * @swagger
 * /api/admin/nfc/associate:
 *   post:
 *     summary: Associer un badge NFC à un device
 *     description: Permet à un admin d'associer un badge NFC à un device en scannant le badge
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
 *               - badgeHash
 *               - deviceId
 *             properties:
 *               badgeHash:
 *                 type: string
 *                 description: Hash du badge NFC scanné
 *                 example: "a1b2c3d4e5f6"
 *               deviceId:
 *                 type: string
 *                 description: ID du device à associer
 *                 example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Badge associé au device avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Badge associé au device avec succès"
 *                 badge:
 *                   type: object
 *                 device:
 *                   type: object
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         description: Badge ou device non trouvé
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    // Validation
    if (!body.badgeHash || !body.deviceId) {
      return NextResponse.json(
        {
          success: false,
          error: 'badgeHash et deviceId sont requis',
        },
        { status: 400 }
      );
    }

    // Trouver le badge NFC
    const badge = await NFCBadge.findOne({ badgeHash: body.badgeHash }).lean();

    if (!badge) {
      return NextResponse.json(
        {
          success: false,
          error: 'Badge NFC non trouvé',
        },
        { status: 404 }
      );
    }

    // Trouver le device
    const device = await Device.findById(body.deviceId);

    if (!device) {
      return NextResponse.json(
        {
          success: false,
          error: 'Device non trouvé',
        },
        { status: 404 }
      );
    }

    // Vérifier si un autre device est déjà associé à ce badge
    const existingDevice = await Device.findOne({ 
      badgeId: badge._id,
      _id: { $ne: body.deviceId } 
    }).lean();

    if (existingDevice) {
      return NextResponse.json(
        {
          success: false,
          error: `Ce badge est déjà associé au device ${existingDevice.serialNumber}`,
        },
        { status: 400 }
      );
    }

    // Associer le badge au device
    device.badgeId = badge._id;
    await device.save();

    return NextResponse.json({
      success: true,
      message: 'Badge associé au device avec succès',
      badge: {
        _id: badge._id,
        badgeHash: badge.badgeHash,
      },
      device: {
        _id: device._id,
        serialNumber: device.serialNumber,
        name: device.name,
        badgeId: device.badgeId,
      },
    });
  } catch (error: any) {
    console.error('Erreur POST /api/admin/nfc/associate:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de l\'association du badge',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

