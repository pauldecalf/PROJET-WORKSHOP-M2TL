import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Device, DeviceData } from '@/models';
import { logAudit } from '@/lib/audit';

/**
 * @swagger
 * /api/devices/by-serial/{serialNumber}/data:
 *   get:
 *     summary: Récupérer les données d'un device (par Serial Number)
 *     description: Retourne l'historique des données d'un device en utilisant son Serial Number
 *     tags:
 *       - Device Data
 *     parameters:
 *       - in: path
 *         name: serialNumber
 *         required: true
 *         schema:
 *           type: string
 *         description: Serial Number du device
 *         example: "ESP32-001"
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
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ serialNumber: string }> }
) {
  try {
    await connectDB();

    const { serialNumber } = await params;
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit') || '100');

    // Trouver le device par serialNumber
    const device = await Device.findOne({ serialNumber }).lean();

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

    // Injecter le serialNumber pour toutes les entrées (utile si anciennes données sans champ)
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
    const { serialNumber } = await params;
    console.error(`Erreur GET /api/devices/by-serial/${serialNumber}/data:`, error);
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
 * /api/devices/by-serial/{serialNumber}/data:
 *   post:
 *     summary: Enregistrer des données d'un device (par Serial Number)
 *     description: Utilisé par les devices pour envoyer leurs mesures en utilisant leur Serial Number
 *     tags:
 *       - Device Data
 *     parameters:
 *       - in: path
 *         name: serialNumber
 *         required: true
 *         schema:
 *           type: string
 *         description: Serial Number du device
 *         example: "ESP32-001"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
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
  { params }: { params: Promise<{ serialNumber: string }> }
) {
  try {
    await connectDB();

    const { serialNumber } = await params;
    const body = await request.json();

    // Trouver le device par serialNumber
    const device = await Device.findOne({ serialNumber });

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

    // Mettre à jour le lastSeenAt du device
    device.lastSeenAt = new Date();
    await device.save();

    const response = NextResponse.json(
      {
        success: true,
        data: deviceData,
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
    const { serialNumber } = await params;
    console.error(`Erreur POST /api/devices/by-serial/${serialNumber}/data:`, error);
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





