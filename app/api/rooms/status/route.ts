import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { RoomStatus, Room, Building } from '@/models';

/**
 * @swagger
 * /api/rooms/status:
 *   get:
 *     summary: Récupérer le statut de toutes les salles
 *     description: Retourne le statut temps réel de toutes les salles (disponible, occupée, inconnu). Utile pour le dashboard étudiant.
 *     tags:
 *       - Rooms
 *     parameters:
 *       - in: query
 *         name: buildingId
 *         schema:
 *           type: string
 *         description: Filtrer par ID de bâtiment
 *         example: "507f1f77bcf86cd799439011"
 *       - in: query
 *         name: availability
 *         schema:
 *           type: string
 *           enum: [AVAILABLE, OCCUPIED, UNKNOWN]
 *         description: Filtrer par disponibilité
 *         example: AVAILABLE
 *     responses:
 *       200:
 *         description: Liste des statuts de salles
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   example: 5
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/RoomStatus'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const buildingId = searchParams.get('buildingId');
    const availability = searchParams.get('availability');

    // Construire le pipeline d'agrégation
    const pipeline: any[] = [
      {
        $lookup: {
          from: 'rooms',
          localField: 'roomId',
          foreignField: '_id',
          as: 'room',
        },
      },
      { $unwind: '$room' },
      {
        $lookup: {
          from: 'buildings',
          localField: 'room.buildingId',
          foreignField: '_id',
          as: 'building',
        },
      },
      { $unwind: '$building' },
    ];

    // Ajouter des filtres si nécessaire
    const matchStage: any = {};
    if (buildingId) matchStage['building._id'] = buildingId;
    if (availability) matchStage.availability = availability;

    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage });
    }

    // Projeter les champs souhaités
    pipeline.push({
      $project: {
        _id: 1,
        availability: 1,
        currentStatus: 1,
        lastUpdateAt: 1,
        reason: 1,
        room: {
          _id: 1,
          name: 1,
          floor: 1,
          capacity: 1,
          mapX: 1,
          mapY: 1,
        },
        building: {
          _id: 1,
          name: 1,
        },
      },
    });

    const roomStatuses = await RoomStatus.aggregate(pipeline);

    return NextResponse.json({
      success: true,
      count: roomStatuses.length,
      data: roomStatuses,
    });
  } catch (error: any) {
    console.error('Erreur GET /api/rooms/status:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la récupération du statut des salles',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

