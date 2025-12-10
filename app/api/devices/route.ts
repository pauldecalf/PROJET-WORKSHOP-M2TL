import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Device, Room } from '@/models';
import { DeviceStatus } from '@/types/enums';

/**
 * @swagger
 * /api/devices:
 *   get:
 *     summary: Récupérer tous les devices
 *     description: Liste tous les devices IoT avec possibilité de filtrage par salle ou statut
 *     tags:
 *       - Devices
 *     parameters:
 *       - in: query
 *         name: roomId
 *         schema:
 *           type: string
 *         description: Filtrer par ID de salle
 *         example: "507f1f77bcf86cd799439011"
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ONLINE, OFFLINE, ERROR, UNKNOWN]
 *         description: Filtrer par statut
 *         example: ONLINE
 *     responses:
 *       200:
 *         description: Liste des devices récupérée avec succès
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
 *                   example: 10
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Device'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get('roomId');
    const status = searchParams.get('status');

    // Construction de la requête avec filtres optionnels
    const query: any = {};
    if (roomId) query.roomId = roomId;
    if (status) query.status = status;

    const devices = await Device.find(query)
      .populate('roomId')
      .sort({ lastSeenAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      count: devices.length,
      data: devices,
    });
  } catch (error: any) {
    console.error('Erreur GET /api/devices:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la récupération des devices',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/devices:
 *   post:
 *     summary: Créer un nouveau device
 *     description: Crée un nouveau device IoT dans le système
 *     tags:
 *       - Devices
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - serialNumber
 *             properties:
 *               serialNumber:
 *                 type: string
 *                 description: Numéro de série unique du device
 *                 example: "ESP32-001"
 *               name:
 *                 type: string
 *                 description: Nom du device
 *                 example: "Capteur Salle 101"
 *               roomId:
 *                 type: string
 *                 description: ID de la salle où est installé le device
 *                 example: "507f1f77bcf86cd799439011"
 *               status:
 *                 type: string
 *                 enum: [ONLINE, OFFLINE, ERROR, UNKNOWN]
 *                 example: ONLINE
 *               firmwareVersion:
 *                 type: string
 *                 example: "1.0.0"
 *               batteryLevel:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *                 example: 95.5
 *               isPoweredOn:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Device créé avec succès (configStatus défini automatiquement à PENDING)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Device'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       409:
 *         description: Un device avec ce numéro de série existe déjà
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    // Validation basique
    if (!body.serialNumber) {
      return NextResponse.json(
        {
          success: false,
          error: 'Le numéro de série est requis',
        },
        { status: 400 }
      );
    }

    // Vérifier si le device existe déjà
    const existingDevice = await Device.findOne({
      serialNumber: body.serialNumber,
    });

    if (existingDevice) {
      return NextResponse.json(
        {
          success: false,
          error: 'Un device avec ce numéro de série existe déjà',
        },
        { status: 409 }
      );
    }

    // Vérifier que la salle existe si roomId est fourni
    if (body.roomId) {
      const room = await Room.findById(body.roomId);
      if (!room) {
        return NextResponse.json(
          {
            success: false,
            error: 'La salle spécifiée n\'existe pas',
          },
          { status: 404 }
        );
      }
    }

    // Créer le device
    // Note: configStatus sera automatiquement défini à PENDING (valeur par défaut du modèle)
    const device = await Device.create({
      serialNumber: body.serialNumber,
      name: body.name,
      roomId: body.roomId,
      status: body.status || DeviceStatus.UNKNOWN,
      // configStatus: PENDING (défini automatiquement)
      firmwareVersion: body.firmwareVersion,
      batteryLevel: body.batteryLevel,
      isPoweredOn: body.isPoweredOn !== undefined ? body.isPoweredOn : true,
      lastSeenAt: new Date(),
    });

    // Récupérer le device créé avec ses relations
    const populatedDevice = await Device.findById(device._id)
      .populate('roomId')
      .lean();

    return NextResponse.json(
      {
        success: true,
        data: populatedDevice,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Erreur POST /api/devices:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la création du device',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

