import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Room, Building } from '@/models';

/**
 * @swagger
 * /api/rooms:
 *   get:
 *     summary: Récupérer toutes les salles
 *     description: Liste toutes les salles avec leurs bâtiments
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
 *                 count:
 *                   type: integer
 *                   example: 5
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Room'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const buildingId = searchParams.get('buildingId');
    const floor = searchParams.get('floor');

    // Construction de la requête avec filtres optionnels
    const query: any = {};
    if (buildingId) query.buildingId = buildingId;
    if (floor) query.floor = parseInt(floor);

    const rooms = await Room.find(query)
      .populate('buildingId')
      .sort({ 'buildingId': 1, floor: 1, name: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      count: rooms.length,
      data: rooms,
    });
  } catch (error: any) {
    console.error('Erreur GET /api/rooms:', error);
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

/**
 * @swagger
 * /api/rooms:
 *   post:
 *     summary: Créer une nouvelle salle
 *     description: Crée une nouvelle salle dans un bâtiment
 *     tags:
 *       - Rooms
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - buildingId
 *               - name
 *             properties:
 *               buildingId:
 *                 type: string
 *                 description: ID du bâtiment
 *                 example: "507f1f77bcf86cd799439011"
 *               name:
 *                 type: string
 *                 description: Nom de la salle
 *                 example: "Salle 101"
 *               floor:
 *                 type: integer
 *                 description: Étage
 *                 example: 1
 *               capacity:
 *                 type: integer
 *                 description: Capacité en personnes
 *                 example: 30
 *               mapX:
 *                 type: number
 *                 description: Position X sur le plan
 *                 example: 100
 *               mapY:
 *                 type: number
 *                 description: Position Y sur le plan
 *                 example: 200
 *     responses:
 *       201:
 *         description: Salle créée avec succès
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
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         description: Bâtiment non trouvé
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    // Validation
    if (!body.buildingId || !body.name) {
      return NextResponse.json(
        {
          success: false,
          error: 'buildingId et name sont requis',
        },
        { status: 400 }
      );
    }

    // Vérifier que le bâtiment existe
    const building = await Building.findById(body.buildingId);
    if (!building) {
      return NextResponse.json(
        {
          success: false,
          error: 'Le bâtiment spécifié n\'existe pas',
        },
        { status: 404 }
      );
    }

    // Créer la salle
    const room = await Room.create({
      buildingId: body.buildingId,
      name: body.name,
      floor: body.floor,
      capacity: body.capacity,
      mapX: body.mapX,
      mapY: body.mapY,
    });

    // Récupérer la salle créée avec son bâtiment
    const populatedRoom = await Room.findById(room._id)
      .populate('buildingId')
      .lean();

    return NextResponse.json(
      {
        success: true,
        data: populatedRoom,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Erreur POST /api/rooms:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la création de la salle',
        message: error.message,
      },
      { status: 500 }
    );
  }
}





