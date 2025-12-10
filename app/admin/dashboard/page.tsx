'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Stats {
  devices: {
    total: number;
    byStatus: Record<string, number>;
    byConfigStatus: Record<string, number>;
  };
  rooms: {
    total: number;
    byStatus: Record<string, number>;
  };
  buildings: {
    total: number;
  };
  recentData: any[];
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    // Vérifier l'authentification
    const storedUser = localStorage.getItem('user');
    const accessToken = localStorage.getItem('accessToken');

    if (!storedUser || !accessToken) {
      router.push('/admin/login');
      return;
    }

    setUser(JSON.parse(storedUser));

    // Charger les stats
    loadStats();
  }, [router, isMounted]);

  const loadStats = async () => {
    try {
      const response = await fetch('/api/admin/devices/stats');
      const data = await response.json();
      
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
    router.push('/admin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">W</span>
                </div>
                <span className="text-2xl font-bold text-gray-900">Workshop IoT</span>
              </Link>
              <span className="text-gray-400">|</span>
              <span className="text-gray-600">Dashboard Admin</span>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">
                  {user?.displayName || user?.email}
                </p>
                <p className="text-xs text-gray-500">{user?.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex space-x-8">
            <Link
              href="/admin/dashboard"
              className="py-4 border-b-2 border-blue-600 text-blue-600 font-semibold"
            >
              📊 Dashboard
            </Link>
            <Link
              href="/admin/devices"
              className="py-4 text-gray-600 hover:text-gray-900 transition"
            >
              📟 Devices
            </Link>
            <Link
              href="/admin/rooms"
              className="py-4 text-gray-600 hover:text-gray-900 transition"
            >
              🏠 Salles
            </Link>
            <Link
              href="/admin/buildings"
              className="py-4 text-gray-600 hover:text-gray-900 transition"
            >
              🏢 Bâtiments
            </Link>
            <Link
              href="/api-docs"
              className="py-4 text-gray-600 hover:text-gray-900 transition"
            >
              📚 API Docs
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Bienvenue, {user?.displayName || 'Admin'} ! 👋
          </h1>
          <p className="text-blue-100">
            Voici un aperçu de votre infrastructure IoT
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            {/* Total Devices */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">📟</span>
                </div>
                <span className="text-sm text-gray-500">Total</span>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {stats.devices.total}
              </div>
              <div className="text-sm text-gray-600">Devices</div>
            </div>

            {/* Total Rooms */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🏠</span>
                </div>
                <span className="text-sm text-gray-500">Total</span>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {stats.rooms.total}
              </div>
              <div className="text-sm text-gray-600">Salles</div>
            </div>

            {/* Total Buildings */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🏢</span>
                </div>
                <span className="text-sm text-gray-500">Total</span>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {stats.buildings.total}
              </div>
              <div className="text-sm text-gray-600">Bâtiments</div>
            </div>

            {/* Devices Online */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">✅</span>
                </div>
                <span className="text-sm text-gray-500">En ligne</span>
              </div>
              <div className="text-3xl font-bold text-green-600 mb-1">
                {stats.devices.byStatus?.ONLINE || 0}
              </div>
              <div className="text-sm text-gray-600">Devices actifs</div>
            </div>
          </div>
        )}

        {/* Device Status */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Statut des devices */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              📊 Statut des devices
            </h2>
            <div className="space-y-3">
              {stats?.devices.byStatus && Object.entries(stats.devices.byStatus).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      status === 'ONLINE' ? 'bg-green-500' :
                      status === 'OFFLINE' ? 'bg-gray-400' :
                      status === 'ERROR' ? 'bg-red-500' :
                      'bg-yellow-500'
                    }`}></div>
                    <span className="text-gray-700">{status}</span>
                  </div>
                  <span className="font-semibold text-gray-900">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Configuration Status */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              ⚙️ État de configuration
            </h2>
            <div className="space-y-3">
              {stats?.devices.byConfigStatus && Object.entries(stats.devices.byConfigStatus).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      status === 'CONFIGURED' ? 'bg-green-500' :
                      status === 'IN_PROGRESS' ? 'bg-blue-500' :
                      'bg-yellow-500'
                    }`}></div>
                    <span className="text-gray-700">{status}</span>
                  </div>
                  <span className="font-semibold text-gray-900">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            ⚡ Actions rapides
          </h2>
          <div className="grid md:grid-cols-4 gap-4">
            <Link
              href="/admin/devices/new"
              className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-center"
            >
              <div className="text-3xl mb-2">➕</div>
              <div className="font-semibold text-gray-900">Ajouter un device</div>
            </Link>
            <Link
              href="/admin/rooms/new"
              className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition text-center"
            >
              <div className="text-3xl mb-2">🏠</div>
              <div className="font-semibold text-gray-900">Créer une salle</div>
            </Link>
            <Link
              href="/admin/buildings/new"
              className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition text-center"
            >
              <div className="text-3xl mb-2">🏢</div>
              <div className="font-semibold text-gray-900">Ajouter un bâtiment</div>
            </Link>
            <Link
              href="/api-docs"
              className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition text-center"
            >
              <div className="text-3xl mb-2">📚</div>
              <div className="font-semibold text-gray-900">Voir l'API</div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

