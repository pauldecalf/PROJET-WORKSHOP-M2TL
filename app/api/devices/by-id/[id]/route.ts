import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Device } from '@/models';
import { logAudit } from '@/lib/audit';

/**
 * @swagger
 * /api/devices/by-id/{id}:
 *   get:
 *     summary: Récupérer un device spécifique
 *     description: Retourne les détails d'un device par son ID
 *     tags:
 *       - Devices
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du device
 *         example: "507f1f77bcf86cd799439011"
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const resolvedParams = await params;
    const device = await Device.findById(resolvedParams.id)
      .populate('roomId')
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
    const resolvedParams = await params;
    console.error(`Erreur GET /api/devices/${resolvedParams.id}:`, error);
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

/**
 * @swagger
 * /api/devices/by-id/{id}:
 *   patch:
 *     summary: Mettre à jour un device
 *     description: Met à jour partiellement les informations d'un device
 *     tags:
 *       - Devices
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du device
 *         example: "507f1f77bcf86cd799439011"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Nouveau nom"
 *               status:
 *                 type: string
 *                 enum: [ONLINE, OFFLINE, ERROR, UNKNOWN]
 *                 example: OFFLINE
 *               batteryLevel:
 *                 type: number
 *                 example: 80.0
 *               isPoweredOn:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       200:
 *         description: Device mis à jour avec succès
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
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const resolvedParams = await params;
    const body = await request.json();

    // Mettre à jour le device
    const device = await Device.findByIdAndUpdate(
      resolvedParams.id,
      {
        $set: {
          ...body,
          lastSeenAt: new Date(),
        },
      },
      { new: true, runValidators: true }
    )
      .populate('roomId')
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

    const response = NextResponse.json({
      success: true,
      data: device,
    });
    await logAudit({
      action: 'DEVICE_UPDATED',
      entityType: 'Device',
      entityId: device._id.toString(),
      details: body,
    });
    return response;
  } catch (error: any) {
    const resolvedParams = await params;
    console.error(`Erreur PATCH /api/devices/${resolvedParams.id}:`, error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la mise à jour du device',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/devices/by-id/{id}:
 *   delete:
 *     summary: Supprimer un device
 *     description: Supprime définitivement un device et toutes ses données associées
 *     tags:
 *       - Devices
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du device
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Device supprimé avec succès
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
 *                   example: "Device supprimé avec succès"
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const resolvedParams = await params;
    const device = await Device.findByIdAndDelete(resolvedParams.id);

    if (!device) {
      return NextResponse.json(
        {
          success: false,
          error: 'Device non trouvé',
        },
        { status: 404 }
      );
    }

    const response = NextResponse.json({
      success: true,
      message: 'Device supprimé avec succès',
    });
    if (device) {
      await logAudit({
        action: 'DEVICE_DELETED',
        entityType: 'Device',
        entityId: device._id.toString(),
        details: { serialNumber: device.serialNumber },
      });
    }
    return response;
  } catch (error: any) {
    const resolvedParams = await params;
    console.error(`Erreur DELETE /api/devices/${resolvedParams.id}:`, error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la suppression du device',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

