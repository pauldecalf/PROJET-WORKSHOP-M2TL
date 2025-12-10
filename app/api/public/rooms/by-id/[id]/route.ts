import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Room, RoomStatus } from '@/models';

/**
 * @swagger
 * /api/public/rooms/by-id/{id}:
 *   get:
 *     summary: Informations publiques d'une salle
 *     description: Route publique pour consulter les infos d'une salle (dashboard étudiant)
 *     tags:
 *       - Public
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la salle
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Informations publiques de la salle
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: "Salle 101"
 *                     floor:
 *                       type: integer
 *                       example: 1
 *                     capacity:
 *                       type: integer
 *                       example: 30
 *                     availability:
 *                       type: string
 *                       enum: [AVAILABLE, OCCUPIED, UNKNOWN]
 *                       example: AVAILABLE
 *                     lastUpdateAt:
 *                       type: string
 *                       format: date-time
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

    // Récupérer la salle
    const room = await Room.findById(resolvedParams.id)
      .populate('buildingId')
      .lean();

    if (!room) {
      return NextResponse.json(
        {
          success: false,
          error: 'Salle non trouvée',
        },
        { status: 404 }
      );
    }

    // Récupérer le statut
    const status = await RoomStatus.findOne({ roomId: resolvedParams.id }).lean();

    // Retourner uniquement les données publiques
    return NextResponse.json({
      success: true,
      data: {
        id: room._id,
        name: room.name,
        buildingName: (room.buildingId as any)?.name || 'N/A',
        floor: room.floor,
        capacity: room.capacity,
        availability: status?.availability || 'UNKNOWN',
        lastUpdateAt: status?.lastUpdateAt || null,
        // On ne retourne pas : mapX, mapY, sourceDeviceId, etc.
      },
    });
  } catch (error: any) {
    const resolvedParams = await params;
    console.error(`Erreur GET /api/public/rooms/${resolvedParams.id}:`, error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la récupération des informations',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

