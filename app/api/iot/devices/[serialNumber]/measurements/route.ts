import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Device, Sensor, SensorMeasurement } from '@/models';

/**
 * @swagger
 * /api/iot/devices/{serialNumber}/measurements:
 *   post:
 *     summary: Enregistrer des mesures (par serialNumber)
 *     description: Utilisé par les devices IoT pour envoyer leurs mesures
 *     tags:
 *       - IoT Devices
 *     parameters:
 *       - in: path
 *         name: serialNumber
 *         required: true
 *         schema:
 *           type: string
 *         description: Serial Number du device
 *         example: "ESP32-ABC123"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - measurements
 *             properties:
 *               measurements:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - sensorType
 *                     - value
 *                   properties:
 *                     sensorType:
 *                       type: string
 *                       enum: [TEMPERATURE, HUMIDITY, CO2, NOISE_LEVEL, LUMINOSITY]
 *                       example: TEMPERATURE
 *                     value:
 *                       type: number
 *                       example: 23.5
 *                     unit:
 *                       type: string
 *                       example: "°C"
 *     responses:
 *       201:
 *         description: Mesures enregistrées
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 saved:
 *                   type: integer
 *                   example: 3
 *                 data:
 *                   type: array
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         description: Device ou capteur non trouvé
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

    // Validation
    if (!body.measurements || !Array.isArray(body.measurements) || body.measurements.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'measurements requis (array non vide)',
        },
        { status: 400 }
      );
    }

    // Trouver le device par son serialNumber
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

    // Mettre à jour le lastSeenAt
    await Device.findByIdAndUpdate(device._id, {
      lastSeenAt: new Date(),
    });

    // Récupérer tous les capteurs du device
    const sensors = await Sensor.find({ deviceId: device._id }).lean();

    // Créer un map sensorType -> sensorId
    const sensorMap = new Map(sensors.map((s) => [s.type, s._id]));

    // Enregistrer chaque mesure
    const savedMeasurements: any[] = [];

    for (const measurement of body.measurements) {
      const { sensorType, value, unit } = measurement;

      if (!sensorType || value == null) {
        console.warn('Mesure invalide ignorée:', measurement);
        continue;
      }

      const sensorId = sensorMap.get(sensorType);
      if (!sensorId) {
        console.warn(`Capteur ${sensorType} non trouvé pour le device ${serialNumber}`);
        continue;
      }

      const savedMeasurement = await SensorMeasurement.create({
        sensorId,
        numericValue: value,
        rawValue: unit ? { value, unit } : undefined,
        measuredAt: new Date(),
      });

      savedMeasurements.push(savedMeasurement);
    }

    return NextResponse.json(
      {
        success: true,
        saved: savedMeasurements.length,
        data: savedMeasurements,
      },
      { status: 201 }
    );
  } catch (error: any) {
    const { serialNumber } = await params;
    console.error(`Erreur POST /api/iot/devices/${serialNumber}/measurements:`, error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de l\'enregistrement des mesures',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

