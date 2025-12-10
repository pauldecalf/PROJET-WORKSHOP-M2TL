import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Device, DeviceData } from '@/models';

/**
 * @swagger
 * /api/devices/{id}/measurements:
 *   get:
 *     summary: Récupérer toutes les mesures d'un device
 *     description: Retourne l'historique des mesures de tous les capteurs d'un device
 *     tags:
 *       - Sensors
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du device
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
 *         description: Nombre max de mesures par capteur
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
 *                 device:
 *                   type: object
 *                 sensors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       sensor:
 *                         $ref: '#/components/schemas/Sensor'
 *                       measurements:
 *                         type: array
 *                         items:
 *                           $ref: '#/components/schemas/Measurement'
 *                       stats:
 *                         type: object
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

    const resolvedParams = await params;
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit') || '100');

    // Vérifier que le device existe
    const device = await Device.findById(resolvedParams.id).lean();
    if (!device) {
      return NextResponse.json(
        {
          success: false,
          error: 'Device non trouvé',
        },
        { status: 404 }
      );
    }

    // Récupérer tous les capteurs du device
    const sensors = await Sensor.find({ deviceId: resolvedParams.id }).lean();

    // Pour chaque capteur, récupérer ses mesures
    const sensorsWithMeasurements = await Promise.all(
      sensors.map(async (sensor) => {
        const query: any = { sensorId: sensor._id };

        if (startDate || endDate) {
          query.measuredAt = {};
          if (startDate) query.measuredAt.$gte = new Date(startDate);
          if (endDate) query.measuredAt.$lte = new Date(endDate);
        }

        const measurements = await SensorMeasurement.find(query)
          .sort({ measuredAt: -1 })
          .limit(limit)
          .lean();

        // Calculer des stats
        const numericValues = measurements
          .map((m) => m.numericValue)
          .filter((v) => v !== undefined && v !== null) as number[];

        const stats =
          numericValues.length > 0
            ? {
                count: numericValues.length,
                avg: numericValues.reduce((a, b) => a + b, 0) / numericValues.length,
                min: Math.min(...numericValues),
                max: Math.max(...numericValues),
                latest: measurements[0]?.numericValue,
              }
            : null;

        return {
          sensor,
          measurements,
          stats,
        };
      })
    );

    return NextResponse.json({
      success: true,
      device: {
        id: device._id,
        serialNumber: device.serialNumber,
        name: device.name,
      },
      sensors: sensorsWithMeasurements,
    });
  } catch (error: any) {
    const resolvedParams = await params;
    console.error(`Erreur GET /api/devices/${resolvedParams.id}/measurements:`, error);
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

