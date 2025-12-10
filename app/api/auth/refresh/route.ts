import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { User } from '@/models';
import { verifyToken, generateToken } from '@/lib/auth';

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Rafraîchir le token d'accès
 *     description: Utilise un refresh token valide pour générer un nouveau access token
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     responses:
 *       200:
 *         description: Token rafraîchi avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 accessToken:
 *                   type: string
 *       400:
 *         description: Refresh token requis
 *       401:
 *         description: Refresh token invalide
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    // Validation
    if (!body.refreshToken) {
      return NextResponse.json(
        {
          success: false,
          error: 'refreshToken requis',
        },
        { status: 400 }
      );
    }

    // Vérifier le refresh token
    let payload;
    try {
      payload = await verifyToken(body.refreshToken);
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: 'Refresh token invalide ou expiré',
        },
        { status: 401 }
      );
    }

    // Vérifier que c'est bien un refresh token
    if (payload.type !== 'refresh') {
      return NextResponse.json(
        {
          success: false,
          error: 'Type de token invalide',
        },
        { status: 401 }
      );
    }

    // Vérifier que l'utilisateur existe toujours
    const user = await User.findById(payload.userId).lean();
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Utilisateur non trouvé',
        },
        { status: 401 }
      );
    }

    // Générer un nouveau access token
    const newAccessToken = await generateToken(
      {
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      },
      'access'
    );

    return NextResponse.json({
      success: true,
      accessToken: newAccessToken,
    });
  } catch (error: any) {
    console.error('Erreur POST /api/auth/refresh:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors du rafraîchissement du token',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

