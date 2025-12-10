import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Device, Sensor, SensorMeasurement } from '@/models';
import { DeviceStatus } from '@/types/enums';

/**
 * @swagger
 * /api/admin/devices/stats:
 *   get:
 *     summary: Statistiques globales des devices
 *     description: Retourne des statistiques détaillées sur tous les devices (admin uniquement)
 *     tags:
 *       - Admin
 *     responses:
 *       200:
 *         description: Statistiques récupérées avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 10
 *                     byStatus:
 *                       type: object
 *                       properties:
 *                         ONLINE:
 *                           type: integer
 *                         OFFLINE:
 *                           type: integer
 *                         ERROR:
 *                           type: integer
 *                         UNKNOWN:
 *                           type: integer
 *                     battery:
 *                       type: object
 *                       properties:
 *                         average:
 *                           type: number
 *                         low:
 *                           type: array
 *                           items:
 *                             type: object
 *                     sensors:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         byType:
 *                           type: object
 *                     measurements:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         last24h:
 *                           type: integer
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Stats des devices
    const devices = await Device.find().lean();
    const total = devices.length;

    // Grouper par statut
    const byStatus = devices.reduce((acc: any, device) => {
      acc[device.status] = (acc[device.status] || 0) + 1;
      return acc;
    }, {});

    // Stats batterie
    const devicesWithBattery = devices.filter((d) => d.batteryLevel != null);
    const avgBattery =
      devicesWithBattery.length > 0
        ? devicesWithBattery.reduce((sum, d) => sum + (d.batteryLevel || 0), 0) /
          devicesWithBattery.length
        : null;

    const lowBatteryDevices = devices
      .filter((d) => d.batteryLevel != null && d.batteryLevel < 20)
      .map((d) => ({
        id: d._id,
        serialNumber: d.serialNumber,
        name: d.name,
        batteryLevel: d.batteryLevel,
      }));

    // Stats capteurs
    const sensors = await Sensor.find().lean();
    const sensorsByType = sensors.reduce((acc: any, sensor) => {
      acc[sensor.type] = (acc[sensor.type] || 0) + 1;
      return acc;
    }, {});

    // Stats mesures
    const totalMeasurements = await SensorMeasurement.countDocuments();
    const last24h = await SensorMeasurement.countDocuments({
      measuredAt: {
        $gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
    });

    // Dernière activité
    const recentDevices = await Device.find()
      .sort({ lastSeenAt: -1 })
      .limit(5)
      .select('serialNumber name lastSeenAt status')
      .lean();

    return NextResponse.json({
      success: true,
      data: {
        devices: {
          total,
          byStatus,
        },
        battery: {
          average: avgBattery ? Math.round(avgBattery * 10) / 10 : null,
          lowBattery: lowBatteryDevices,
        },
        sensors: {
          total: sensors.length,
          byType: sensorsByType,
        },
        measurements: {
          total: totalMeasurements,
          last24h,
        },
        recentActivity: recentDevices,
      },
    });
  } catch (error: any) {
    console.error('Erreur GET /api/admin/devices/stats:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la récupération des statistiques',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

