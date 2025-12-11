import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Building } from '@/models';
import { logAudit } from '@/lib/audit';

/**
 * @swagger
 * /api/buildings:
 *   get:
 *     summary: Récupérer tous les bâtiments
 *     description: Liste tous les bâtiments du campus
 *     tags:
 *       - Buildings
 *     responses:
 *       200:
 *         description: Liste des bâtiments récupérée avec succès
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
 *                   example: 3
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Building'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const buildings = await Building.find()
      .sort({ name: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      count: buildings.length,
      data: buildings,
    });
  } catch (error: any) {
    console.error('Erreur GET /api/buildings:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la récupération des bâtiments',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/buildings:
 *   post:
 *     summary: Créer un nouveau bâtiment
 *     description: Ajoute un nouveau bâtiment au campus
 *     tags:
 *       - Buildings
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nom du bâtiment
 *                 example: "Bâtiment A"
 *               address:
 *                 type: string
 *                 description: Adresse du bâtiment
 *                 example: "123 Rue de l'Université"
 *               totalFloors:
 *                 type: integer
 *                 description: Nombre d'étages
 *                 example: 5
 *               mapImageUrl:
 *                 type: string
 *                 description: URL de l'image du plan
 *                 example: "https://example.com/maps/building-a.png"
 *     responses:
 *       201:
 *         description: Bâtiment créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Building'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    // Validation
    if (!body.name) {
      return NextResponse.json(
        {
          success: false,
          error: 'Le champ "name" est requis',
        },
        { status: 400 }
      );
    }

    // Créer le bâtiment
    const building = await Building.create({
      name: body.name,
      address: body.address,
      totalFloors: body.totalFloors,
      mapImageUrl: body.mapImageUrl,
    });

    const response = NextResponse.json(
      {
        success: true,
        data: building,
      },
      { status: 201 }
    );
    await logAudit({
      action: 'BUILDING_CREATED',
      entityType: 'Building',
      entityId: building._id.toString(),
      details: { name: body.name, address: body.address, totalFloors: body.totalFloors },
    });
    return response;
  } catch (error: any) {
    console.error('Erreur POST /api/buildings:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la création du bâtiment',
        message: error.message,
      },
      { status: 500 }
    );
  }
}





