'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface RoomStatus {
  _id: string;
  name: string;
  status: string;
  capacity?: number;
  buildingId?: {
    name: string;
  };
  deviceCount: number;
  lastUpdate?: string;
}

export default function PublicRoomsPage() {
  const [rooms, setRooms] = useState<RoomStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadRooms();
    // Rafraîchir toutes les 30 secondes
    const interval = setInterval(loadRooms, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadRooms = async () => {
    try {
      const response = await fetch('/api/public/rooms/status');
      const data = await response.json();

      if (data.success) {
        setRooms(data.data);
      } else {
        setError('Erreur lors du chargement des salles');
      }
    } catch (err) {
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'OCCUPIED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'MAINTENANCE':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusEmoji = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return '✅';
      case 'OCCUPIED':
        return '🔴';
      case 'MAINTENANCE':
        return '⚠️';
      default:
        return '❓';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des salles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">W</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">Workshop IoT</span>
            </Link>

            <div className="flex items-center space-x-4">
              <Link href="/" className="text-gray-600 hover:text-gray-900 transition">
                ← Retour à l'accueil
              </Link>
              <Link
                href="/api-docs"
                className="text-gray-600 hover:text-gray-900 transition"
              >
                API Docs
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Title */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              🏠 Disponibilité des salles
            </h1>
            <p className="text-xl text-gray-600">
              Consultez l'état en temps réel de toutes nos salles connectées
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Stats Summary */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {rooms.length}
              </div>
              <div className="text-sm text-gray-600">Total des salles</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="text-3xl font-bold text-green-600 mb-1">
                {rooms.filter(r => r.status === 'AVAILABLE').length}
              </div>
              <div className="text-sm text-gray-600">Disponibles</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="text-3xl font-bold text-red-600 mb-1">
                {rooms.filter(r => r.status === 'OCCUPIED').length}
              </div>
              <div className="text-sm text-gray-600">Occupées</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="text-3xl font-bold text-yellow-600 mb-1">
                {rooms.filter(r => r.status === 'MAINTENANCE').length}
              </div>
              <div className="text-sm text-gray-600">En maintenance</div>
            </div>
          </div>

          {/* Rooms Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <div
                key={room._id}
                className="bg-white rounded-xl shadow-sm hover:shadow-lg transition border border-gray-100 overflow-hidden"
              >
                <div className="p-6">
                  {/* Status Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(
                        room.status
                      )}`}
                    >
                      {getStatusEmoji(room.status)} {room.status}
                    </span>
                    {room.capacity && (
                      <span className="text-sm text-gray-500">
                        👥 {room.capacity}
                      </span>
                    )}
                  </div>

                  {/* Room Name */}
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {room.name}
                  </h3>

                  {/* Building */}
                  {room.buildingId && (
                    <p className="text-gray-600 mb-4">
                      🏢 {room.buildingId.name}
                    </p>
                  )}

                  {/* Device Count */}
                  <div className="flex items-center text-gray-600 mb-4">
                    <span className="mr-2">📟</span>
                    <span>
                      {room.deviceCount} device{room.deviceCount > 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* View Details Button */}
                  <Link
                    href={`/public/rooms/${room._id}`}
                    className="block w-full text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition"
                  >
                    Voir les détails
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {rooms.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🏠</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Aucune salle disponible
              </h3>
              <p className="text-gray-600">
                Les salles seront affichées ici dès qu'elles seront configurées.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-12 mt-12 border-t">
        <div className="text-center text-gray-600">
          <p className="mb-2">
            Données mises à jour en temps réel toutes les 30 secondes
          </p>
          <div className="flex justify-center space-x-6">
            <Link href="/" className="hover:text-gray-900 transition">
              Accueil
            </Link>
            <Link href="/api-docs" className="hover:text-gray-900 transition">
              API Documentation
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

