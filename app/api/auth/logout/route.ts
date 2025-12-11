import { NextRequest, NextResponse } from 'next/server';

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Déconnexion utilisateur
 *     description: Invalide le token côté client (JWT stateless - pas de révocation serveur)
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Déconnexion réussie
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
 *                   example: "Déconnexion réussie"
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
export async function POST(request: NextRequest) {
  try {
    // Avec JWT stateless, la déconnexion se fait côté client
    // (supprimer le token du localStorage/cookies)
    // Si vous voulez une blacklist des tokens, il faudrait Redis

    return NextResponse.json({
      success: true,
      message: 'Déconnexion réussie. Supprimez le token côté client.',
    });
  } catch (error: any) {
    console.error('Erreur POST /api/auth/logout:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la déconnexion',
        message: error.message,
      },
      { status: 500 }
    );
  }
}





