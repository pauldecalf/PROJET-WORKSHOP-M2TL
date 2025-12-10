import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { NFCBadge, Device, User } from '@/models';

/**
 * @swagger
 * /api/admin/nfc/scan:
 *   post:
 *     summary: Scanner un badge NFC
 *     description: Permet à un admin de scanner un badge NFC pour récupérer les informations associées (device et/ou user)
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
 *             properties:
 *               badgeHash:
 *                 type: string
 *                 description: Hash du badge NFC scanné
 *                 example: "a1b2c3d4e5f6"
 *     responses:
 *       200:
 *         description: Badge scanné avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 badge:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     badgeHash:
 *                       type: string
 *                     isActive:
 *                       type: boolean
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                 device:
 *                   type: object
 *                   nullable: true
 *                   description: Device associé au badge (si existe)
 *                 user:
 *                   type: object
 *                   nullable: true
 *                   description: Utilisateur associé au badge (si existe)
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         description: Badge non trouvé
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    // Validation
    if (!body.badgeHash) {
      return NextResponse.json(
        {
          success: false,
          error: 'badgeHash est requis',
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

    // Chercher un device associé
    const device = await Device.findOne({ badgeId: badge._id })
      .populate('roomId')
      .lean();

    // Chercher un utilisateur associé
    const user = await User.findOne({ badgeId: badge._id })
      .select('-passwordHash') // Ne pas retourner le mot de passe
      .lean();

    return NextResponse.json({
      success: true,
      badge: {
        _id: badge._id,
        badgeHash: badge.badgeHash,
        createdAt: badge.createdAt,
      },
      device: device ? {
        _id: device._id,
        serialNumber: device.serialNumber,
        name: device.name,
        roomId: device.roomId,
        status: device.status,
        configStatus: device.configStatus,
        batteryLevel: device.batteryLevel,
        lastSeenAt: device.lastSeenAt,
      } : null,
      user: user ? {
        _id: user._id,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
      } : null,
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

