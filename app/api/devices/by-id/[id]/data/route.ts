import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Device, DeviceData } from '@/models';
import { DeviceStatus, DeviceConfigStatus } from '@/types/enums';
import { logAudit } from '@/lib/audit';

/**
 * @swagger
 * /api/devices/by-id/{id}/data:
 *   get:
 *     summary: Récupérer les données d'un device
 *     description: Retourne l'historique des données (température, humidité, CO2, etc.) d'un device
 *     tags:
 *       - Device Data
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du device ou Serial Number
 *         example: "507f1f77bcf86cd799439011"
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Date de début
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Date de fin
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Nombre max de mesures
 *     responses:
 *       200:
 *         description: Données récupérées avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 device:
 *                   type: object
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/DeviceData'
 *                 stats:
 *                   type: object
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
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit') || '100');

    // Trouver le device (par ID ou serialNumber)
    let device = await Device.findById(id).lean();
    if (!device) {
      device = await Device.findOne({ serialNumber: id }).lean();
    }

    if (!device) {
      return NextResponse.json(
        {
          success: false,
          error: 'Device non trouvé',
        },
        { status: 404 }
      );
    }

    // Construction de la requête avec filtres de date
    const query: any = { deviceId: device._id };

    if (startDate || endDate) {
      query.measuredAt = {};
      if (startDate) query.measuredAt.$gte = new Date(startDate);
      if (endDate) query.measuredAt.$lte = new Date(endDate);
    }

    // Récupérer les données
    const data = await DeviceData.find(query)
      .sort({ measuredAt: -1 })
      .limit(limit)
      .lean();

    // Injecter le serialNumber dans les entrées si absent (compat)
    const dataWithSerial = data.map((d) => ({
      ...d,
      serialNumber: d.serialNumber || device.serialNumber,
    }));

    // Calculer des statistiques
    const stats = {
      temperature: calculateStats(data.map(d => d.temperature).filter(v => v != null)),
      humidity: calculateStats(data.map(d => d.humidity).filter(v => v != null)),
      co2: calculateStats(data.map(d => d.co2).filter(v => v != null)),
      decibel: calculateStats(data.map(d => d.decibel).filter(v => v != null)),
      luminosity: calculateStats(data.map(d => d.luminosity).filter(v => v != null)),
    };

    return NextResponse.json({
      success: true,
      device: {
        id: device._id,
        serialNumber: device.serialNumber,
        name: device.name,
      },
      count: dataWithSerial.length,
      data: dataWithSerial,
      stats,
    });
  } catch (error: any) {
    const { id } = await params;
    console.error(`Erreur GET /api/devices/${id}/data:`, error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la récupération des données',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/devices/by-id/{id}/data:
 *   post:
 *     summary: Enregistrer des données d'un device
 *     description: Utilisé par les devices pour envoyer leurs mesures (température, humidité, CO2, etc.)
 *     tags:
 *       - Device Data
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du device ou Serial Number
 *         example: "ESP32-001"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               serialNumber:
 *                 type: string
 *                 description: Serial Number du device (auto-déduit)
 *                 example: "ESP32-001"
 *               temperature:
 *                 type: number
 *                 description: Température en °C
 *                 example: 23.5
 *               humidity:
 *                 type: number
 *                 description: Humidité en %
 *                 example: 45.2
 *               co2:
 *                 type: number
 *                 description: CO2 en ppm
 *                 example: 800
 *               decibel:
 *                 type: number
 *                 description: Niveau sonore en dB
 *                 example: 55
 *               luminosity:
 *                 type: number
 *                 description: Luminosité en %
 *                 example: 75
 *     responses:
 *       201:
 *         description: Données enregistrées
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

    // Trouver le device (par ID ou serialNumber)
    let device = await Device.findById(id);
    if (!device) {
      device = await Device.findOne({ serialNumber: id });
    }

    if (!device) {
      return NextResponse.json(
        {
          success: false,
          error: 'Device non trouvé',
        },
        { status: 404 }
      );
    }

    // Vérifier qu'au moins une donnée est fournie
    const hasData = body.temperature != null || 
                    body.humidity != null || 
                    body.co2 != null || 
                    body.decibel != null || 
                    body.luminosity != null;

    if (!hasData) {
      return NextResponse.json(
        {
          success: false,
          error: 'Au moins une donnée est requise (temperature, humidity, co2, decibel, luminosity)',
        },
        { status: 400 }
      );
    }

    // Créer l'enregistrement
    const deviceData = await DeviceData.create({
      deviceId: device._id,
      serialNumber: device.serialNumber,
      temperature: body.temperature,
      humidity: body.humidity,
      co2: body.co2,
      decibel: body.decibel,
      luminosity: body.luminosity,
      measuredAt: new Date(),
    });

    // Mettre à jour le lastSeenAt et normaliser les statuts
    device.lastSeenAt = new Date();
    const validStatuses = Object.values(DeviceStatus);
    if (!validStatuses.includes(device.status as DeviceStatus)) {
      device.status = DeviceStatus.ONLINE; // on considère qu'un device qui envoie des données est en ligne
    } else if (device.status !== DeviceStatus.ONLINE) {
      // Optionnel: on peut remonter le device en ONLINE quand il envoie une mesure
      device.status = DeviceStatus.ONLINE;
    }
    const validConfigStatuses = Object.values(DeviceConfigStatus);
    if (!validConfigStatuses.includes(device.configStatus as DeviceConfigStatus)) {
      device.configStatus = DeviceConfigStatus.IN_PROGRESS; // fallback si absent/incorrect
    }
    await device.save();

    const response = NextResponse.json(
      {
        success: true,
        data: {
          ...deviceData.toObject(),
          serialNumber: device.serialNumber,
        },
      },
      { status: 201 }
    );
    await logAudit({
      action: 'DEVICE_DATA_CREATED',
      entityType: 'Device',
      entityId: device._id.toString(),
      details: {
        serialNumber: device.serialNumber,
        temperature: body.temperature,
        humidity: body.humidity,
        co2: body.co2,
        decibel: body.decibel,
        luminosity: body.luminosity,
      },
    });
    return response;
  } catch (error: any) {
    const { id } = await params;
    console.error(`Erreur POST /api/devices/${id}/data:`, error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de l\'enregistrement des données',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

// Helper pour calculer les statistiques
function calculateStats(values: number[]) {
  if (values.length === 0) return null;

  return {
    count: values.length,
    min: Math.min(...values),
    max: Math.max(...values),
    avg: values.reduce((a, b) => a + b, 0) / values.length,
    latest: values[0],
  };
}

