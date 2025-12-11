import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { NFCBadge, Device } from '@/models';
import { DeviceConfigStatus } from '@/types/enums';

/**
 * @swagger
 * /api/admin/nfc/device-status:
 *   post:
 *     summary: Changer le statut d'un device via NFC
 *     description: Permet à un admin de scanner un badge NFC pour changer le statut de configuration d'un device
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
 *               - configStatus
 *             properties:
 *               badgeHash:
 *                 type: string
 *                 description: Hash du badge NFC scanné
 *                 example: "a1b2c3d4e5f6"
 *               configStatus:
 *                 type: string
 *                 enum: [PENDING, IN_PROGRESS, CONFIGURED]
 *                 description: Nouveau statut de configuration
 *                 example: "CONFIGURED"
 *     responses:
 *       200:
 *         description: Statut mis à jour avec succès
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
 *                   example: "Statut du device mis à jour avec succès"
 *                 badge:
 *                   type: object
 *                   properties:
 *                     badgeId:
 *                       type: string
 *                     badgeHash:
 *                       type: string
 *                 device:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     serialNumber:
 *                       type: string
 *                     name:
 *                       type: string
 *                     configStatus:
 *                       type: string
 *                     previousStatus:
 *                       type: string
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
    if (!body.badgeHash || !body.configStatus) {
      return NextResponse.json(
        {
          success: false,
          error: 'badgeHash et configStatus sont requis',
        },
        { status: 400 }
      );
    }

    // Vérifier que le configStatus est valide
    const validStatuses = Object.values(DeviceConfigStatus);
    if (!validStatuses.includes(body.configStatus)) {
      return NextResponse.json(
        {
          success: false,
          error: `configStatus invalide. Valeurs autorisées: ${validStatuses.join(', ')}`,
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

    // Trouver le device associé à ce badge
    const device = await Device.findOne({ badgeId: badge._id });

    if (!device) {
      return NextResponse.json(
        {
          success: false,
          error: 'Aucun device associé à ce badge',
        },
        { status: 404 }
      );
    }

    // Sauvegarder l'ancien statut
    const previousStatus = device.configStatus;

    // Mettre à jour le statut
    device.configStatus = body.configStatus;
    await device.save();

    return NextResponse.json({
      success: true,
      message: 'Statut du device mis à jour avec succès',
      badge: {
        badgeId: badge._id,
        badgeHash: badge.badgeHash,
      },
      device: {
        _id: device._id,
        serialNumber: device.serialNumber,
        name: device.name,
        configStatus: device.configStatus,
        previousStatus,
      },
    });
  } catch (error: any) {
    console.error('Erreur POST /api/admin/nfc/device-status:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la mise à jour du statut',
        message: error.message,
      },
      { status: 500 }
    );
  }
}





