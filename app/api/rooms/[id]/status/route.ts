import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { RoomStatus, Room } from '@/models';

/**
 * @swagger
 * /api/rooms/{id}/status:
 *   get:
 *     summary: Récupérer le statut d'une salle spécifique
 *     description: Retourne le statut de disponibilité d'une salle particulière
 *     tags:
 *       - Rooms
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
 *         description: Statut de la salle récupéré avec succès
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
 *                     roomId:
 *                       type: string
 *                     availability:
 *                       type: string
 *                       enum: [AVAILABLE, OCCUPIED, UNKNOWN]
 *                       example: AVAILABLE
 *                     lastUpdateAt:
 *                       type: string
 *                       format: date-time
 *                     reason:
 *                       type: string
 *                       example: "Pas de détection NFC"
 *                     room:
 *                       $ref: '#/components/schemas/Room'
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

    // Vérifier que la salle existe
    const room = await Room.findById(resolvedParams.id).lean();
    if (!room) {
      return NextResponse.json(
        {
          success: false,
          error: 'Salle non trouvée',
        },
        { status: 404 }
      );
    }

    // Récupérer le statut de la salle
    const status = await RoomStatus.findOne({ roomId: resolvedParams.id })
      .populate('roomId')
      .populate('sourceDeviceId')
      .lean();

    if (!status) {
      // Si pas de statut, retourner UNKNOWN par défaut
      return NextResponse.json({
        success: true,
        data: {
          roomId: resolvedParams.id,
          availability: 'UNKNOWN',
          lastUpdateAt: null,
          reason: 'Aucun statut enregistré',
          room: room,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: status,
    });
  } catch (error: any) {
    const resolvedParams = await params;
    console.error(`Erreur GET /api/rooms/${resolvedParams.id}/status:`, error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la récupération du statut',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

