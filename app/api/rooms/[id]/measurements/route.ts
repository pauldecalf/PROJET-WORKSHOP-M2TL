import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Room, Device, Sensor, SensorMeasurement } from '@/models';

/**
 * @swagger
 * /api/rooms/{id}/measurements:
 *   get:
 *     summary: Récupérer toutes les mesures d'une salle
 *     description: Retourne l'historique des mesures de tous les capteurs de tous les devices d'une salle
 *     tags:
 *       - Sensors
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la salle
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
 *       - in: query
 *         name: sensorType
 *         schema:
 *           type: string
 *           enum: [TEMPERATURE, HUMIDITY, CO2, NOISE_LEVEL, LUMINOSITY]
 *         description: Filtrer par type de capteur
 *     responses:
 *       200:
 *         description: Mesures récupérées avec succès
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
    const sensorType = searchParams.get('sensorType');

    // Vérifier que la salle existe
    const room = await Room.findById(resolvedParams.id).lean();
    if (!room) {
      return NextResponse.json(
        {
          success: false,
          error: 'Salle non trouvée',
        },
        { status: 404 }
      );
    }

    // Récupérer tous les devices de la salle
    const devices = await Device.find({ roomId: resolvedParams.id }).lean();

    if (devices.length === 0) {
      return NextResponse.json({
        success: true,
        room: { id: room._id, name: room.name },
        devices: [],
        message: 'Aucun device dans cette salle',
      });
    }

    const deviceIds = devices.map((d) => d._id);

    // Récupérer tous les capteurs de ces devices
    const sensorQuery: any = { deviceId: { $in: deviceIds } };
    if (sensorType) sensorQuery.type = sensorType;
    const sensors = await Sensor.find(sensorQuery).lean();

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

    // Grouper par device
    const devicesWithSensors = devices.map((device) => ({
      device: {
        id: device._id,
        serialNumber: device.serialNumber,
        name: device.name,
      },
      sensors: sensorsWithMeasurements.filter(
        (s) => s.sensor.deviceId.toString() === device._id.toString()
      ),
    }));

    return NextResponse.json({
      success: true,
      room: {
        id: room._id,
        name: room.name,
        floor: room.floor,
      },
      devices: devicesWithSensors,
    });
  } catch (error: any) {
    const resolvedParams = await params;
    console.error(`Erreur GET /api/rooms/${resolvedParams.id}/measurements:`, error);
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

