import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Device, DeviceCommand } from '@/models';
import { CommandType, CommandStatus } from '@/types/enums';

/**
 * @swagger
 * /api/devices/{id}/commands/reboot:
 *   post:
 *     summary: Envoyer une commande de redémarrage
 *     description: Crée une commande pour redémarrer un device
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
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 example: "Mise à jour firmware"
 *     responses:
 *       201:
 *         description: Commande créée
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
    const body = await request.json().catch(() => ({}));

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

    // Créer la commande TURN_ON (reboot = éteindre puis rallumer)
    const commandDoc = await DeviceCommand.create({
      deviceId: id,
      command: CommandType.TURN_ON,
      payload: body.reason ? { reason: body.reason } : {},
      status: CommandStatus.PENDING,
      sentAt: new Date(),
    });

    return NextResponse.json(
      {
        success: true,
        command: commandDoc,
        message: 'Commande REBOOT envoyée',
      },
      { status: 201 }
    );
  } catch (error: any) {
    const { id } = await params;
    console.error(`Erreur POST /api/devices/${id}/commands/reboot:`, error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de l\'envoi de la commande',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

