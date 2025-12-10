import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Building, Room } from '@/models';

/**
 * @swagger
 * /api/buildings/by-id/{id}/rooms:
 *   get:
 *     summary: Récupérer toutes les salles d'un bâtiment
 *     description: Liste toutes les salles d'un bâtiment spécifique
 *     tags:
 *       - Buildings
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du bâtiment
 *         example: "507f1f77bcf86cd799439011"
 *       - in: query
 *         name: floor
 *         schema:
 *           type: integer
 *         description: Filtrer par étage
 *         example: 1
 *     responses:
 *       200:
 *         description: Liste des salles récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 building:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                 count:
 *                   type: integer
 *                   example: 5
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Room'
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

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const floor = searchParams.get('floor');

    // Vérifier que le bâtiment existe
    const building = await Building.findById(id).lean();
    if (!building) {
      return NextResponse.json(
        {
          success: false,
          error: 'Bâtiment non trouvé',
        },
        { status: 404 }
      );
    }

    // Construction de la requête avec filtre optionnel
    const query: any = { buildingId: id };
    if (floor) query.floor = parseInt(floor);

    // Récupérer les salles
    const rooms = await Room.find(query)
      .sort({ floor: 1, name: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      building: {
        id: building._id,
        name: building.name,
      },
      count: rooms.length,
      data: rooms,
    });
  } catch (error: any) {
    const { id } = await params;
    console.error(`Erreur GET /api/buildings/${id}/rooms:`, error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la récupération des salles',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

