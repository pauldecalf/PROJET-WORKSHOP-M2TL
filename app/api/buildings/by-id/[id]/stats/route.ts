import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Building, Room, Device, RoomStatus } from '@/models';
import { RoomAvailability } from '@/types/enums';

/**
 * @swagger
 * /api/buildings/by-id/{id}/stats:
 *   get:
 *     summary: Statistiques d'un bâtiment
 *     description: Retourne des statistiques détaillées sur un bâtiment (salles, devices, disponibilité)
 *     tags:
 *       - Buildings
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du bâtiment
 *         example: "507f1f77bcf86cd799439011"
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
 *                 building:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     totalFloors:
 *                       type: integer
 *                 stats:
 *                   type: object
 *                   properties:
 *                     rooms:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                           example: 20
 *                         byFloor:
 *                           type: object
 *                           example: { "1": 5, "2": 5, "3": 10 }
 *                         totalCapacity:
 *                           type: integer
 *                           example: 600
 *                     devices:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                           example: 15
 *                         byStatus:
 *                           type: object
 *                           example: { "ONLINE": 12, "OFFLINE": 3 }
 *                     availability:
 *                       type: object
 *                       properties:
 *                         available:
 *                           type: integer
 *                           example: 15
 *                         occupied:
 *                           type: integer
 *                           example: 3
 *                         unknown:
 *                           type: integer
 *                           example: 2
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

    // Vérifier que le bâtiment existe
    const building = await Building.findById(id).lean();
    if (!building) {
      return NextResponse.json(
        {
          success: false,
          error: 'Bâtiment non trouvé',
        },
        { status: 404 }
      );
    }

    // Récupérer toutes les salles du bâtiment
    const rooms = await Room.find({ buildingId: id }).lean();
    const roomIds = rooms.map((r) => r._id);

    // Stats des salles
    const roomsByFloor = rooms.reduce((acc: any, room) => {
      acc[room.floor || 0] = (acc[room.floor || 0] || 0) + 1;
      return acc;
    }, {});

    const totalCapacity = rooms.reduce((sum, room) => sum + (room.capacity || 0), 0);

    // Stats des devices
    const devices = await Device.find({ roomId: { $in: roomIds } }).lean();
    const devicesByStatus = devices.reduce((acc: any, device) => {
      acc[device.status] = (acc[device.status] || 0) + 1;
      return acc;
    }, {});

    // Stats de disponibilité
    const roomStatuses = await RoomStatus.find({ roomId: { $in: roomIds } }).lean();
    const availabilityStats = roomStatuses.reduce(
      (acc: any, status) => {
        const availability = status.availability;
        if (availability === RoomAvailability.AVAILABLE) acc.available++;
        else if (availability === RoomAvailability.OCCUPIED) acc.occupied++;
        else acc.unknown++;
        return acc;
      },
      { available: 0, occupied: 0, unknown: 0 }
    );

    // Si certaines salles n'ont pas de statut
    const roomsWithoutStatus = rooms.length - roomStatuses.length;
    availabilityStats.unknown += roomsWithoutStatus;

    return NextResponse.json({
      success: true,
      building: {
        id: building._id,
        name: building.name,
        totalFloors: building.totalFloors,
      },
      stats: {
        rooms: {
          total: rooms.length,
          byFloor: roomsByFloor,
          totalCapacity,
        },
        devices: {
          total: devices.length,
          byStatus: devicesByStatus,
        },
        availability: availabilityStats,
      },
    });
  } catch (error: any) {
    const { id } = await params;
    console.error(`Erreur GET /api/buildings/${id}/stats:`, error);
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

