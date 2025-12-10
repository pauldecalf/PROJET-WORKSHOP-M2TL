import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Room } from '@/models';

/**
 * @swagger
 * /api/rooms/by-id/{id}:
 *   get:
 *     summary: Récupérer une salle spécifique
 *     description: Retourne les détails d'une salle par son ID
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
 *         description: Salle trouvée
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Room'
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

    return NextResponse.json({
      success: true,
      data: room,
    });
  } catch (error: any) {
    const resolvedParams = await params;
    console.error(`Erreur GET /api/rooms/${resolvedParams.id}:`, error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la récupération de la salle',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/rooms/by-id/{id}:
 *   patch:
 *     summary: Mettre à jour une salle
 *     description: Met à jour partiellement les informations d'une salle
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Salle 101 - Nouveau nom"
 *               floor:
 *                 type: integer
 *                 example: 2
 *               capacity:
 *                 type: integer
 *                 example: 40
 *               mapX:
 *                 type: number
 *                 example: 150
 *               mapY:
 *                 type: number
 *                 example: 250
 *     responses:
 *       200:
 *         description: Salle mise à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Room'
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

    // Mettre à jour la salle
    const room = await Room.findByIdAndUpdate(
      resolvedParams.id,
      { $set: body },
      { new: true, runValidators: true }
    )
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

    return NextResponse.json({
      success: true,
      data: room,
    });
  } catch (error: any) {
    const resolvedParams = await params;
    console.error(`Erreur PATCH /api/rooms/${resolvedParams.id}:`, error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la mise à jour de la salle',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

