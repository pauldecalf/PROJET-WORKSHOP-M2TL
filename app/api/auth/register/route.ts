import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { User } from '@/models';
import { hashPassword, generateToken } from '@/lib/auth';
import { UserRole } from '@/types/enums';

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Inscription d'un nouvel utilisateur
 *     description: Crée un nouveau compte utilisateur et retourne les tokens JWT
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "newadmin@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 example: "SecurePass123!"
 *               displayName:
 *                 type: string
 *                 example: "John Doe"
 *               role:
 *                 type: string
 *                 enum: [SUPERVISOR, STUDENT]
 *                 default: SUPERVISOR
 *                 example: "SUPERVISOR"
 *     responses:
 *       201:
 *         description: Compte créé avec succès
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
 *                 refreshToken:
 *                   type: string
 *                 user:
 *                   type: object
 *       400:
 *         description: Email déjà utilisé ou données invalides
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    // Validation
    if (!body.email || !body.password) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email et password requis',
        },
        { status: 400 }
      );
    }

    if (body.password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          error: 'Le mot de passe doit contenir au moins 8 caractères',
        },
        { status: 400 }
      );
    }

    // Vérifier si l'email existe déjà
    const existingUser = await User.findOne({ email: body.email.toLowerCase() });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: 'Un compte avec cet email existe déjà',
        },
        { status: 400 }
      );
    }

    // Hasher le mot de passe
    const passwordHash = await hashPassword(body.password);

    // Créer l'utilisateur
    const user = await User.create({
      email: body.email.toLowerCase(),
      passwordHash,
      displayName: body.displayName,
      role: body.role || UserRole.SUPERVISOR,
    });

    // Générer les tokens
    const tokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const accessToken = await generateToken(tokenPayload, 'access');
    const refreshToken = await generateToken(tokenPayload, 'refresh');

    // Retourner les tokens et les infos utilisateur
    return NextResponse.json(
      {
        success: true,
        accessToken,
        refreshToken,
        user: {
          id: user._id,
          email: user.email,
          displayName: user.displayName,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Erreur POST /api/auth/register:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la création du compte',
        message: error.message,
      },
      { status: 500 }
    );
  }
}





