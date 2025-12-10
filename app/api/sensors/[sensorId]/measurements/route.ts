import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { SensorMeasurement, Sensor } from '@/models';

/**
 * @swagger
 * /api/sensors/{sensorId}/measurements:
 *   get:
 *     summary: Récupérer les mesures d'un capteur
 *     description: Retourne l'historique des mesures d'un capteur avec statistiques (moyenne, min, max)
 *     tags:
 *       - Sensors
 *     parameters:
 *       - in: path
 *         name: sensorId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du capteur
 *         example: "507f1f77bcf86cd799439011"
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Date de début (ISO 8601)
 *         example: "2025-12-09T00:00:00Z"
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Date de fin (ISO 8601)
 *         example: "2025-12-10T23:59:59Z"
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Nombre maximum de mesures à retourner
 *         example: 100
 *     responses:
 *       200:
 *         description: Mesures récupérées avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 sensor:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     type:
 *                       type: string
 *                       example: "TEMPERATURE"
 *                     label:
 *                       type: string
 *                       example: "Température ambiante"
 *                     unit:
 *                       type: string
 *                       example: "°C"
 *                 count:
 *                   type: integer
 *                   example: 144
 *                 stats:
 *                   type: object
 *                   properties:
 *                     count:
 *                       type: integer
 *                       example: 144
 *                     avg:
 *                       type: number
 *                       example: 22.3
 *                     min:
 *                       type: number
 *                       example: 20.1
 *                     max:
 *                       type: number
 *                       example: 24.5
 *                     latest:
 *                       type: number
 *                       example: 22.5
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Measurement'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sensorId: string }> }
) {
  try {
    await connectDB();

    const resolvedParams = await params;
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit') || '100');

    // Vérifier que le capteur existe
    const sensor = await Sensor.findById(resolvedParams.sensorId);
    if (!sensor) {
      return NextResponse.json(
        {
          success: false,
          error: 'Capteur non trouvé',
        },
        { status: 404 }
      );
    }

    // Construire la requête
    const query: any = { sensorId: resolvedParams.sensorId };

    if (startDate || endDate) {
      query.measuredAt = {};
      if (startDate) query.measuredAt.$gte = new Date(startDate);
      if (endDate) query.measuredAt.$lte = new Date(endDate);
    }

    // Récupérer les mesures
    const measurements = await SensorMeasurement.find(query)
      .sort({ measuredAt: -1 })
      .limit(limit)
      .lean();

    // Calculer des statistiques simples
    const numericValues = measurements
      .map((m) => m.numericValue)
      .filter((v) => v !== undefined && v !== null) as number[];

    const stats = numericValues.length > 0 ? {
      count: numericValues.length,
      avg: numericValues.reduce((a, b) => a + b, 0) / numericValues.length,
      min: Math.min(...numericValues),
      max: Math.max(...numericValues),
      latest: measurements[0]?.numericValue,
    } : null;

    return NextResponse.json({
      success: true,
      sensor: {
        id: sensor._id,
        type: sensor.type,
        label: sensor.label,
        unit: sensor.unit,
      },
      count: measurements.length,
      stats,
      data: measurements,
    });
  } catch (error: any) {
    const resolvedParams = await params;
    console.error(
      `Erreur GET /api/sensors/${resolvedParams.sensorId}/measurements:`,
      error
    );
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la récupération des mesures',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/sensors/{sensorId}/measurements:
 *   post:
 *     summary: Ajouter une mesure
 *     description: Enregistre une nouvelle mesure pour un capteur (utilisé par les devices IoT)
 *     tags:
 *       - Sensors
 *     parameters:
 *       - in: path
 *         name: sensorId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du capteur
 *         example: "507f1f77bcf86cd799439011"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               numericValue:
 *                 type: number
 *                 description: Valeur numérique de la mesure
 *                 example: 22.5
 *               measuredAt:
 *                 type: string
 *                 format: date-time
 *                 description: Date de la mesure (défaut = maintenant)
 *                 example: "2025-12-10T10:30:00Z"
 *               rawValue:
 *                 type: object
 *                 description: Données brutes supplémentaires (optionnel)
 *                 example: { humidity: 45.2, pressure: 1013.25 }
 *     responses:
 *       201:
 *         description: Mesure créée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Measurement'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sensorId: string }> }
) {
  try {
    await connectDB();

    const resolvedParams = await params;
    const body = await request.json();

    // Vérifier que le capteur existe
    const sensor = await Sensor.findById(resolvedParams.sensorId);
    if (!sensor) {
      return NextResponse.json(
        {
          success: false,
          error: 'Capteur non trouvé',
        },
        { status: 404 }
      );
    }

    // Créer la mesure
    const measurement = await SensorMeasurement.create({
      sensorId: resolvedParams.sensorId,
      measuredAt: body.measuredAt || new Date(),
      numericValue: body.numericValue,
      rawValue: body.rawValue,
    });

    return NextResponse.json(
      {
        success: true,
        data: measurement,
      },
      { status: 201 }
    );
  } catch (error: any) {
    const resolvedParams = await params;
    console.error(
      `Erreur POST /api/sensors/${resolvedParams.sensorId}/measurements:`,
      error
    );
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de l\'ajout de la mesure',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

