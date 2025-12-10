import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            🏢 Système IoT de Gestion de Salles
          </h1>
          <p className="text-xl text-gray-600">
            API REST pour la gestion de dispositifs IoT, capteurs et salles connectées
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Documentation API Swagger */}
          <Link
            href="/api-docs"
            className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow border-2 border-blue-200 hover:border-blue-400"
          >
            <div className="flex items-center mb-4">
              <span className="text-4xl mr-4">📚</span>
              <h2 className="text-2xl font-bold text-gray-900">
                Documentation API
              </h2>
            </div>
            <p className="text-gray-600 mb-4">
              Documentation interactive Swagger UI pour tester toutes les routes API
            </p>
            <div className="flex items-center text-blue-600 font-semibold">
              Ouvrir Swagger UI
              <span className="ml-2">→</span>
            </div>
          </Link>

          {/* Exemple API - Devices */}
          <Link
            href="/api/devices"
            className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow border-2 border-green-200 hover:border-green-400"
          >
            <div className="flex items-center mb-4">
              <span className="text-4xl mr-4">📟</span>
              <h2 className="text-2xl font-bold text-gray-900">
                Liste des Devices
              </h2>
            </div>
            <p className="text-gray-600 mb-4">
              Voir tous les dispositifs IoT (ESP32, capteurs) en JSON
            </p>
            <div className="flex items-center text-green-600 font-semibold">
              GET /api/devices
              <span className="ml-2">→</span>
            </div>
          </Link>

          {/* Statut des salles */}
          <Link
            href="/api/rooms/status"
            className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow border-2 border-purple-200 hover:border-purple-400"
          >
            <div className="flex items-center mb-4">
              <span className="text-4xl mr-4">🚪</span>
              <h2 className="text-2xl font-bold text-gray-900">
                Statut des Salles
              </h2>
            </div>
            <p className="text-gray-600 mb-4">
              Disponibilité temps réel de toutes les salles (disponible, occupée)
            </p>
            <div className="flex items-center text-purple-600 font-semibold">
              GET /api/rooms/status
              <span className="ml-2">→</span>
            </div>
          </Link>

          {/* Spec OpenAPI */}
          <Link
            href="/api/swagger"
            className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow border-2 border-orange-200 hover:border-orange-400"
          >
            <div className="flex items-center mb-4">
              <span className="text-4xl mr-4">📋</span>
              <h2 className="text-2xl font-bold text-gray-900">
                Spec OpenAPI
              </h2>
            </div>
            <p className="text-gray-600 mb-4">
              Spécification OpenAPI 3.0 au format JSON (pour Postman, Insomnia, etc.)
            </p>
            <div className="flex items-center text-orange-600 font-semibold">
              GET /api/swagger
              <span className="ml-2">→</span>
            </div>
          </Link>
        </div>

        {/* Info section */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            🚀 Démarrage rapide
          </h3>
          <div className="space-y-4 text-gray-700">
            <div>
              <h4 className="font-semibold text-lg mb-2">1. Configuration MongoDB</h4>
              <code className="bg-gray-100 px-3 py-1 rounded text-sm">
                echo "MONGODB_URI=mongodb://localhost:27017/workshop" &gt; .env.local
              </code>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-2">2. Initialiser la base de données</h4>
              <code className="bg-gray-100 px-3 py-1 rounded text-sm">
                npm run seed
              </code>
              <p className="text-sm text-gray-600 mt-1">
                Crée automatiquement ~17 000 documents de test
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-2">3. Tester les API</h4>
              <p className="text-sm text-gray-600">
                Utilisez <Link href="/api-docs" className="text-blue-600 hover:underline">Swagger UI</Link> pour tester interactivement toutes les routes
              </p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-4xl mb-3">🗄️</div>
            <h4 className="font-bold text-lg mb-2">13 Collections MongoDB</h4>
            <p className="text-sm text-gray-600">
              Buildings, Rooms, Devices, Sensors, Measurements, NFC, etc.
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-4xl mb-3">🔌</div>
            <h4 className="font-bold text-lg mb-2">7+ Routes API REST</h4>
            <p className="text-sm text-gray-600">
              CRUD complet pour devices, mesures, salles et statuts
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-4xl mb-3">📊</div>
            <h4 className="font-bold text-lg mb-2">Time-Series Data</h4>
            <p className="text-sm text-gray-600">
              Stockage optimisé des mesures (température, CO2, humidité)
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-600">
          <p>
            📚 Documentation complète disponible dans les fichiers <code className="bg-gray-200 px-2 py-1 rounded text-sm">*.md</code>
          </p>
          <p className="mt-2">
            Built with <span className="text-red-500">❤️</span> using Next.js, MongoDB & Swagger
          </p>
        </div>
      </div>
    </div>
  );
}
