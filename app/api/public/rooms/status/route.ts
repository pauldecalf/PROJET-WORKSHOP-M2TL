import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { RoomStatus } from '@/models';

/**
 * @swagger
 * /api/public/rooms/status:
 *   get:
 *     summary: Statut public de toutes les salles
 *     description: Route publique pour le dashboard étudiant. Retourne uniquement les informations non sensibles.
 *     tags:
 *       - Public
 *     parameters:
 *       - in: query
 *         name: buildingId
 *         schema:
 *           type: string
 *         description: Filtrer par ID de bâtiment
 *       - in: query
 *         name: availability
 *         schema:
 *           type: string
 *           enum: [AVAILABLE, OCCUPIED, UNKNOWN]
 *         description: Filtrer par disponibilité
 *         example: AVAILABLE
 *     responses:
 *       200:
 *         description: Liste des statuts de salles (données publiques)
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
 *                     type: object
 *                     properties:
 *                       roomId:
 *                         type: string
 *                       roomName:
 *                         type: string
 *                       buildingName:
 *                         type: string
 *                       floor:
 *                         type: integer
 *                       capacity:
 *                         type: integer
 *                       availability:
 *                         type: string
 *                         enum: [AVAILABLE, OCCUPIED, UNKNOWN]
 *                       lastUpdateAt:
 *                         type: string
 *                         format: date-time
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const buildingId = searchParams.get('buildingId');
    const availability = searchParams.get('availability');

    // Pipeline d'agrégation
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

    // Filtres
    const matchStage: any = {};
    if (buildingId) matchStage['building._id'] = buildingId;
    if (availability) matchStage.availability = availability;

    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage });
    }

    // Projection : uniquement les données publiques (pas d'infos sensibles)
    pipeline.push({
      $project: {
        _id: 0, // Cacher l'ID MongoDB
        roomId: '$room._id',
        roomName: '$room.name',
        buildingName: '$building.name',
        floor: '$room.floor',
        capacity: '$room.capacity',
        availability: 1,
        lastUpdateAt: 1,
        // On ne retourne PAS : sourceDeviceId, sourceSensorId, reason (infos internes)
      },
    });

    const roomStatuses = await RoomStatus.aggregate(pipeline);

    return NextResponse.json({
      success: true,
      count: roomStatuses.length,
      data: roomStatuses,
    });
  } catch (error: any) {
    console.error('Erreur GET /api/public/rooms/status:', error);
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





