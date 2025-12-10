import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Building, Room } from '@/models';

/**
 * @swagger
 * /api/buildings/by-id/{id}:
 *   get:
 *     summary: Récupérer un bâtiment spécifique
 *     description: Retourne les détails d'un bâtiment par son ID
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
 *     responses:
 *       200:
 *         description: Bâtiment trouvé
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

    return NextResponse.json({
      success: true,
      data: building,
    });
  } catch (error: any) {
    const { id } = await params;
    console.error(`Erreur GET /api/buildings/${id}:`, error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la récupération du bâtiment',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/buildings/by-id/{id}:
 *   patch:
 *     summary: Mettre à jour un bâtiment
 *     description: Met à jour partiellement les informations d'un bâtiment
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Bâtiment A - Rénové"
 *               address:
 *                 type: string
 *                 example: "123 Rue de l'Université"
 *               totalFloors:
 *                 type: integer
 *                 example: 6
 *               mapImageUrl:
 *                 type: string
 *                 example: "https://example.com/maps/building-a-new.png"
 *     responses:
 *       200:
 *         description: Bâtiment mis à jour avec succès
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

    const { id } = await params;
    const body = await request.json();

    // Mettre à jour le bâtiment
    const building = await Building.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    ).lean();

    if (!building) {
      return NextResponse.json(
        {
          success: false,
          error: 'Bâtiment non trouvé',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: building,
    });
  } catch (error: any) {
    const { id } = await params;
    console.error(`Erreur PATCH /api/buildings/${id}:`, error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la mise à jour du bâtiment',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/buildings/by-id/{id}:
 *   delete:
 *     summary: Supprimer un bâtiment
 *     description: Supprime un bâtiment (seulement s'il n'a pas de salles associées)
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
 *     responses:
 *       200:
 *         description: Bâtiment supprimé avec succès
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
 *                   example: "Bâtiment supprimé avec succès"
 *       400:
 *         description: Impossible de supprimer (salles associées)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Impossible de supprimer ce bâtiment car il contient 5 salle(s)"
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

    const { id } = await params;

    // Vérifier que le bâtiment existe
    const building = await Building.findById(id);
    if (!building) {
      return NextResponse.json(
        {
          success: false,
          error: 'Bâtiment non trouvé',
        },
        { status: 404 }
      );
    }

    // Vérifier qu'il n'y a pas de salles associées
    const roomCount = await Room.countDocuments({ buildingId: id });
    if (roomCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Impossible de supprimer ce bâtiment car il contient ${roomCount} salle(s)`,
        },
        { status: 400 }
      );
    }

    // Supprimer le bâtiment
    await Building.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Bâtiment supprimé avec succès',
    });
  } catch (error: any) {
    const { id } = await params;
    console.error(`Erreur DELETE /api/buildings/${id}:`, error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la suppression du bâtiment',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

