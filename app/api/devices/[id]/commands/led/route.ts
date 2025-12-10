import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Device, DeviceCommand } from '@/models';
import { CommandType, CommandStatus } from '@/types/enums';

/**
 * @swagger
 * /api/devices/{id}/commands/led:
 *   post:
 *     summary: Contrôler la LED d'un device
 *     description: Envoie une commande pour contrôler la LED (couleur, mode, durée)
 *     tags:
 *       - Device Commands
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du device
 *         example: "507f1f77bcf86cd799439011"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - color
 *             properties:
 *               color:
 *                 type: string
 *                 enum: [red, green, blue, yellow, white, off]
 *                 example: green
 *               mode:
 *                 type: string
 *                 enum: [solid, blink, fade]
 *                 default: solid
 *                 example: blink
 *               duration:
 *                 type: integer
 *                 description: Durée en millisecondes (0 = infini)
 *                 default: 0
 *                 example: 5000
 *     responses:
 *       201:
 *         description: Commande LED créée
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;
    const body = await request.json();

    // Validation
    if (!body.color) {
      return NextResponse.json(
        {
          success: false,
          error: 'Le champ "color" est requis',
        },
        { status: 400 }
      );
    }

    const validColors = ['red', 'green', 'blue', 'yellow', 'white', 'off'];
    if (!validColors.includes(body.color)) {
      return NextResponse.json(
        {
          success: false,
          error: `Couleur invalide. Valeurs autorisées: ${validColors.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Vérifier que le device existe
    const device = await Device.findById(id);
    if (!device) {
      return NextResponse.json(
        {
          success: false,
          error: 'Device non trouvé',
        },
        { status: 404 }
      );
    }

    // Créer la commande SET_LED_STATE
    const commandDoc = await DeviceCommand.create({
      deviceId: id,
      command: CommandType.SET_LED_STATE,
      payload: {
        color: body.color,
        mode: body.mode || 'solid',
        duration: body.duration || 0,
      },
      status: CommandStatus.PENDING,
      sentAt: new Date(),
    });

    return NextResponse.json(
      {
        success: true,
        command: commandDoc,
        message: `Commande LED envoyée (${body.color})`,
      },
      { status: 201 }
    );
  } catch (error: any) {
    const { id } = await params;
    console.error(`Erreur POST /api/devices/${id}/commands/led:`, error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de l\'envoi de la commande LED',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

