import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Room, Device, DeviceData } from '@/models';

/**
 * @swagger
 * /api/rooms/by-id/{id}/data:
 *   get:
 *     summary: Récupérer les données de tous les devices d'une salle
 *     description: Retourne l'historique des données de tous les devices d'une salle
 *     tags:
 *       - Device Data
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
 *         description: Nombre max de mesures par device
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit') || '100');

    // Vérifier que la salle existe
    const room = await Room.findById(id).lean();
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
    const devices = await Device.find({ roomId: id }).lean();

    if (devices.length === 0) {
      return NextResponse.json({
        success: true,
        room: { id: room._id, name: room.name },
        devices: [],
        message: 'Aucun device dans cette salle',
      });
    }

    const deviceIds = devices.map((d) => d._id);

    // Construction de la requête
    const query: any = { deviceId: { $in: deviceIds } };

    if (startDate || endDate) {
      query.measuredAt = {};
      if (startDate) query.measuredAt.$gte = new Date(startDate);
      if (endDate) query.measuredAt.$lte = new Date(endDate);
    }

    // Récupérer les données
    const allData = await DeviceData.find(query)
      .sort({ measuredAt: -1 })
      .limit(limit * devices.length)
      .lean();

    // Grouper par device
    const devicesWithData = devices.map((device) => {
      const deviceData = allData.filter(
        (d) => d.deviceId.toString() === device._id.toString()
      );

      const deviceDataWithSerial = deviceData.map((d) => ({
        ...d,
        serialNumber: d.serialNumber || device.serialNumber,
      }));

      const stats = {
        temperature: calculateStats(deviceDataWithSerial.map(d => d.temperature).filter(v => v != null)),
        humidity: calculateStats(deviceDataWithSerial.map(d => d.humidity).filter(v => v != null)),
        co2: calculateStats(deviceDataWithSerial.map(d => d.co2).filter(v => v != null)),
        decibel: calculateStats(deviceDataWithSerial.map(d => d.decibel).filter(v => v != null)),
        luminosity: calculateStats(deviceDataWithSerial.map(d => d.luminosity).filter(v => v != null)),
      };

      return {
        device: {
          id: device._id,
          serialNumber: device.serialNumber,
          name: device.name,
        },
        count: deviceDataWithSerial.length,
        data: deviceDataWithSerial.slice(0, limit),
        stats,
      };
    });

    return NextResponse.json({
      success: true,
      room: {
        id: room._id,
        name: room.name,
        floor: room.floor,
      },
      devices: devicesWithData,
    });
  } catch (error: any) {
    const { id } = await params;
    console.error(`Erreur GET /api/rooms/${id}/data:`, error);
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

